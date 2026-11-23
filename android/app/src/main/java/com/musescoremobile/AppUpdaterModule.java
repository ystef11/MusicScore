package com.musescoremobile;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

/** GitHub release discovery; update identity is the APK hash, never the version label. */
public final class AppUpdaterModule extends ReactContextBaseJavaModule {
    private static final String LATEST = "https://api.github.com/repos/ystef11/MusicScore/releases/latest";
    private static final int INSTALL_PERMISSION = 8914;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private volatile Release release;
    private File pendingApk;
    private Promise pendingInstall;

    private static final class Release {
        String tag, url, hash;
        long size;
    }

    public AppUpdaterModule(ReactApplicationContext context) {
        super(context);
        context.addActivityEventListener(new BaseActivityEventListener() {
            @Override public void onActivityResult(Activity activity, int code, int result, Intent data) {
                if (code != INSTALL_PERMISSION || pendingInstall == null) return;
                try {
                    if (!context.getPackageManager().canRequestPackageInstalls())
                        throw new IOException("Установка обновления не разрешена. Разрешите установку из MusicScore и повторите попытку.");
                    launchInstaller();
                } catch (Exception error) { failInstall(error); }
            }
        });
    }

    @Override public String getName() { return "AppUpdater"; }

    @ReactMethod public void check(Promise promise) {
        worker.execute(() -> {
            try {
                HttpURLConnection connection = connect(LATEST);
                JSONObject json;
                try (InputStream input = connection.getInputStream(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
                    byte[] buffer = new byte[8192]; int n;
                    while ((n = input.read(buffer)) != -1) {
                        if (output.size() + n > 1024 * 1024) throw new IOException("Слишком большой ответ GitHub");
                        output.write(buffer, 0, n);
                    }
                    json = new JSONObject(output.toString("UTF-8"));
                } finally { connection.disconnect(); }
                if (json.optBoolean("draft") || json.optBoolean("prerelease")) throw new IOException("Нет опубликованного стабильного релиза");
                JSONArray assets = json.getJSONArray("assets");
                JSONObject apk = null;
                for (int i=0; i<assets.length(); i++) {
                    JSONObject item=assets.getJSONObject(i);
                    if ("app-release.apk".equals(item.optString("name"))) { apk=item; break; }
                }
                if (apk == null) throw new IOException("В последнем релизе отсутствует app-release.apk");
                Release found = new Release();
                found.tag = json.getString("tag_name");
                found.url = apk.getString("browser_download_url");
                if (!found.url.startsWith("https://github.com/ystef11/MusicScore/releases/download/"))
                    throw new IOException("Неожиданный адрес APK");
                found.size = apk.getLong("size");
                String digest = apk.optString("digest", "");
                found.hash = digest.startsWith("sha256:") ? digest.substring(7).toLowerCase(Locale.ROOT) : "";
                if (!found.hash.matches("[a-f0-9]{64}")) {
                    // Older GitHub assets may lack a digest: stream once and hash the actual APK.
                    found.hash = "";
                    found.hash = hash(download(found));
                }
                String installed = installedHash();
                release = found;
                WritableMap result = Arguments.createMap();
                result.putBoolean("available", !found.hash.equals(installed));
                result.putString("version", found.tag);
                result.putString("sha256", found.hash);
                result.putDouble("size", found.size);
                promise.resolve(result);
            } catch (Exception error) { promise.reject("UPDATE_CHECK", "Не удалось проверить обновления: " + error.getMessage(), error); }
        });
    }

    private HttpURLConnection connect(String address) throws IOException {
        HttpURLConnection connection = (HttpURLConnection)new URL(address).openConnection();
        connection.setConnectTimeout(15000);
        connection.setReadTimeout(60000);
        connection.setRequestProperty("User-Agent", "MusicScore-Android-Updater");
        connection.setRequestProperty("Accept", address.equals(LATEST) ? "application/vnd.github+json" : "application/octet-stream");
        connection.setRequestProperty("X-GitHub-Api-Version", "2022-11-28");
        int status = connection.getResponseCode();
        if (status != 200) { connection.disconnect(); throw new IOException("GitHub HTTP " + status); }
        return connection;
    }

    private String installedHash() throws Exception {
        ReactApplicationContext context = getReactApplicationContext();
        PackageInfo info = context.getPackageManager().getPackageInfo(context.getPackageName(), 0);
        File apk = new File(context.getApplicationInfo().sourceDir);
        String key = info.lastUpdateTime + ":" + apk.length() + ":" + apk.getPath();
        SharedPreferences prefs = context.getSharedPreferences("apk_update_hash", 0);
        if (key.equals(prefs.getString("key", ""))) {
            String cached = prefs.getString("sha256", "");
            if (cached.matches("[a-f0-9]{64}")) return cached;
        }
        String value = hash(apk);
        prefs.edit().putString("key", key).putString("sha256", value).apply();
        return value;
    }

    private static String hash(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (InputStream input = new FileInputStream(file)) {
            byte[] buffer=new byte[65536]; int n;
            while ((n=input.read(buffer))!=-1) digest.update(buffer,0,n);
        }
        StringBuilder hex=new StringBuilder();
        for (byte b: digest.digest()) hex.append(String.format(Locale.ROOT,"%02x",b & 255));
        return hex.toString();
    }

    private File download(Release item) throws Exception {
        File dir = new File(getReactApplicationContext().getCacheDir(), "updates");
        if (!dir.isDirectory() && !dir.mkdirs()) throw new IOException("Не удалось создать папку обновления");
        File target = new File(dir, "musicscore.apk");
        if (!item.hash.isEmpty() && target.isFile() && item.hash.equals(hash(target))) return target;
        File part = new File(dir, "musicscore.apk.part");
        HttpURLConnection connection = connect(item.url);
        long done=0; int last=-1;
        try (InputStream input=connection.getInputStream(); OutputStream output=new FileOutputStream(part)) {
            byte[] buffer=new byte[65536]; int n;
            while ((n=input.read(buffer))!=-1) {
                output.write(buffer,0,n); done+=n;
                int percent=item.size>0 ? (int)Math.min(100,done*100/item.size) : -1;
                if (percent!=last) {
                    last=percent;
                    getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("MusicScoreUpdateProgress", percent);
                }
            }
        } catch (Exception error) { part.delete(); throw error; }
        finally { connection.disconnect(); }
        if (done!=item.size || (!item.hash.isEmpty() && !item.hash.equals(hash(part)))) {
            part.delete(); throw new IOException("APK загружен не полностью или SHA-256 не совпадает. Повторите загрузку.");
        }
        if (target.exists() && !target.delete()) throw new IOException("Не удалось заменить файл обновления");
        if (!part.renameTo(target)) throw new IOException("Не удалось сохранить APK");
        return target;
    }

    @ReactMethod public void installLatest(Promise promise) {
        worker.execute(() -> {
            try {
                Release item=release;
                if (item==null) throw new IOException("Сначала проверьте обновления");
                File file=download(item);
                getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("MusicScoreUpdateProgress", 100);
                if (hash(file).equals(installedHash())) throw new IOException("Этот APK уже установлен");
                verifyPackage(file);
                UiThreadUtil.runOnUiThread(() -> {
                    if (pendingInstall!=null) { promise.reject("UPDATE_BUSY", "Установка уже запущена"); return; }
                    pendingApk=file; pendingInstall=promise;
                    try {
                        Activity activity=getCurrentActivity();
                        if (activity==null) throw new IOException("Вернитесь в MusicScore для установки обновления");
                        if (!getReactApplicationContext().getPackageManager().canRequestPackageInstalls()) {
                            Intent intent=new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                                Uri.parse("package:"+getReactApplicationContext().getPackageName()));
                            activity.startActivityForResult(intent, INSTALL_PERMISSION);
                        } else { launchInstaller(); }
                    } catch (Exception error) { failInstall(error); }
                });
            } catch (Exception error) { promise.reject("UPDATE_INSTALL", error.getMessage(), error); }
        });
    }

    private void verifyPackage(File file) throws Exception {
        ReactApplicationContext context=getReactApplicationContext();
        PackageManager pm=context.getPackageManager();
        PackageInfo next=pm.getPackageArchiveInfo(file.getPath(), PackageManager.GET_SIGNING_CERTIFICATES);
        PackageInfo own=pm.getPackageInfo(context.getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
        if (next==null || !context.getPackageName().equals(next.packageName)) throw new IOException("APK не является обновлением MusicScore");
        if (next.signingInfo==null || own.signingInfo==null || signers(own).isEmpty() || !signers(next).equals(signers(own)))
            throw new IOException("APK подписан другим ключом. Обновление невозможно");
        // No version comparison: hash defines a changed release; Android handles install compatibility.
    }

    private static Set<String> signers(PackageInfo info) {
        Set<String> result=new HashSet<>();
        for (Signature signature:info.signingInfo.getApkContentsSigners()) result.add(signature.toCharsString());
        return result;
    }

    private void launchInstaller() throws Exception {
        Activity activity=getCurrentActivity();
        if (activity==null) throw new IOException("Вернитесь в MusicScore для установки обновления");
        Uri uri=FileProvider.getUriForFile(getReactApplicationContext(),
            getReactApplicationContext().getPackageName()+".updates", pendingApk);
        Intent intent=new Intent(Intent.ACTION_VIEW).setDataAndType(uri,"application/vnd.android.package-archive")
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        activity.startActivity(intent);
        pendingInstall.resolve(null); pendingInstall=null; pendingApk=null;
    }

    private void failInstall(Exception error) {
        if (pendingInstall!=null) pendingInstall.reject("UPDATE_INSTALL", error.getMessage(), error);
        pendingInstall=null; pendingApk=null;
    }
}
