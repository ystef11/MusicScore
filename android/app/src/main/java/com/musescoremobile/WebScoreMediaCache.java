package com.musescoremobile;

import android.app.Activity;
import android.content.Context;
import android.net.Uri;
import android.webkit.CookieManager;
import android.util.Log;
import com.facebook.react.bridge.Promise;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Supplier;

/** Reads the viewer's exact media URLs using Android networking, then serves local files. */
final class WebScoreMediaCache {
    private static URL checked(String value) throws Exception {
        URL url = new URL(value);
        String host = url.getHost().toLowerCase(Locale.ROOT);
        if (!"https".equals(url.getProtocol()) || url.getUserInfo() != null
                || (url.getPort() != -1 && url.getPort() != 443)
                || !(host.equals("musescore.com") || host.endsWith(".musescore.com")
                || host.equals("ustatik.com") || host.endsWith(".ustatik.com"))) {
            throw new IOException("Неподдерживаемый адрес медиа");
        }
        return url;
    }

    private static final String TAG = "WebScoreMedia";
    private static final ExecutorService FIRST_PAGES = Executors.newFixedThreadPool(2);
    private static final ExecutorService PAGES = Executors.newFixedThreadPool(6);
    private static final ExecutorService AUDIO = Executors.newFixedThreadPool(2);
    private static final ExecutorService TIMING = Executors.newFixedThreadPool(2);
    private static final Map<String, Load> loads = new ConcurrentHashMap<>();

    static synchronized void load(Context context, String key, String url, String script,
                                  Supplier<Activity> activitySupplier, boolean allowVerification,
                                  Set<Integer> failedPages, boolean refresh, Promise promise) {
        if (!key.matches("[0-9]+-[0-9]+")) {
            promise.reject("WEB_SCORE_VIEW", "Некорректный идентификатор партитуры");
            return;
        }
        Load load = loads.get(key);
        if (load != null && refresh && !load.refresh) {
            load.complete.whenComplete((path, error) ->
                load(context, key, url, script, activitySupplier, allowVerification, failedPages, true, promise));
            return;
        }
        if (load == null) {
            load = new Load(context, key, refresh);
            loads.put(key, load);
            load.start(context, url, script, activitySupplier, allowVerification, failedPages);
        }
        (refresh ? load.complete : load.firstPage).whenComplete((path, error) -> {
            if (error == null) promise.resolve(path);
            else promise.reject("WEB_SCORE_MEDIA", error.getMessage(), error);
        });
    }

    static synchronized CompletableFuture<String> finished(Context context, String key) {
        Load load = loads.get(key);
        if (load != null) return load.complete;
        return CompletableFuture.completedFuture(cacheFile(context, key).getAbsolutePath());
    }

    static synchronized CompletableFuture<Void> finishedScore(String key) {
        String prefix = key.substring(0, key.indexOf('-') + 1);
        CompletableFuture<?>[] pending = loads.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(prefix))
            .map(entry -> entry.getValue().complete)
            .toArray(CompletableFuture<?>[]::new);
        return CompletableFuture.allOf(pending);
    }

    static File cacheFile(Context context, String key) {
        return new File(context.getCacheDir(), "WebScores/" + key + ".webscore");
    }

    /** All manifest changes are serialized. Media workers publish only fully written files. */
    private static final class Load {
        private final ExecutorService updates = Executors.newSingleThreadExecutor();
        private final CompletableFuture<String> firstPage = new CompletableFuture<>();
        private final CompletableFuture<String> complete = new CompletableFuture<>();
        private final boolean refresh;
        private final File manifestFile, mediaDirectory;
        private final String key;
        private JSONObject manifest;
        private JSONArray remotePages;
        private final Map<Integer, String> attemptedPages = new HashMap<>();
        private final Set<Integer> downloadingPages = new HashSet<>();
        private String referer, userAgent, remoteAudio, attemptedAudio;
        private boolean sourceDone, downloadingAudio, downloadingTiming;
        private String sourceError, expectedSourceUrl;

        Load(Context context, String key, boolean refresh) {
            this.key = key;
            this.refresh = refresh;
            manifestFile = cacheFile(context, key);
            mediaDirectory = new File(context.getCacheDir(), "WebScoreMedia/" + key + "/" + UUID.randomUUID());
        }

        void start(Context context, String url, String script, Supplier<Activity> activitySupplier, boolean allowVerification,
                   Set<Integer> failedPages) {
            enqueue(() -> {
                restore(failedPages);
                String cachedUrl = manifest == null ? "" : manifest.optString("sourceUrl");
                if (refresh) {
                    manifest = null;
                    if (scorePage(cachedUrl) == null) cachedUrl = WebScoreOfflineStore.savedSourceUrl(context, key);
                    expectedSourceUrl = scorePage(cachedUrl) == null ? null : cachedUrl;
                }
                String startUrl = scorePage(cachedUrl) == null ? url : cachedUrl;
                WebScoreSession.fetch(context, startUrl, script, 180_000, activitySupplier, allowVerification,
                    (page, error) -> enqueue(() -> accept(page, error, false)),
                    (page, error) -> enqueue(() -> accept(page, error, true)));
            });
        }

        private void enqueue(Runnable update) {
            updates.execute(() -> {
                try {
                    update.run();
                } catch (Exception error) {
                    Log.w(TAG, "Could not update " + key, error);
                }
                publish();
            });
        }

        private void restore(Set<Integer> failedPages) {
            try {
                JSONObject cached = new JSONObject(new String(Files.readAllBytes(manifestFile.toPath()), StandardCharsets.UTF_8));
                JSONArray pages = cached.getJSONArray("pages");
                if (!localFile(pages.optString(0))) return;
                for (int i = 1; i < pages.length(); i++) {
                    if (failedPages.contains(i) || !localFile(pages.optString(i))) pages.put(i, JSONObject.NULL);
                }
                if (!localFile(cached.optString("audioUrl"))) cached.remove("audioUrl");
                manifest = cached;
            } catch (Exception ignored) { /* A cold or evicted cache starts from the viewer. */ }
        }

        private void accept(JSONObject page, String error, boolean done) {
            sourceDone = done;
            JSONObject view = page == null ? null : page.optJSONObject("probe");
            if (error != null || view == null || view.has("error")) {
                sourceError = error != null ? error : view == null ? "Нет данных веб-плеера" : view.optString("error");
                Log.w(TAG, sourceError);
                JSONObject viewer = view == null ? null : view.optJSONObject("viewer");
                if (viewer != null) Log.w(TAG, "Score " + key + ": viewer=" + viewer.optInt("width") + "x"
                    + viewer.optInt("height") + ", visible=" + viewer.optBoolean("visible")
                    + ", observed pages=" + viewer.optInt("found"));
                return;
            }
            JSONArray candidates = view.optJSONArray("pages");
            if (candidates == null) return;
            String expected = manifest == null ? expectedSourceUrl : manifest.optString("sourceUrl");
            if (expected != null && !sameScorePage(view.optString("sourceUrl"), expected)) {
                sourceError = "Веб-поиск вернул другую партитуру";
                return;
            }
            sourceError = null;
            remotePages = candidates;
            referer = page.optString("url");
            userAgent = page.optString("userAgent");
            remoteAudio = view.isNull("audioUrl") ? null : view.optString("audioUrl");
            try {
                if (manifest == null) {
                    manifest = new JSONObject();
                    manifest.put("pages", new JSONArray());
                }
                manifest.put("version", view.getInt("version"));
                for (String field : new String[]{"title", "metadata", "customAudio", "sourceUrl"}) {
                    manifest.put(field, view.opt(field));
                }
                JSONArray pages = manifest.getJSONArray("pages");
                if (pages.length() < remotePages.length()) pages.put(remotePages.length() - 1, JSONObject.NULL);
                if (!mediaDirectory.isDirectory() && !mediaDirectory.mkdirs()) throw new IOException("Не удалось создать кеш просмотра");
                for (int i = 0; i < remotePages.length(); i++) schedulePage(i);
                scheduleAudio();
                if (done) scheduleTiming(view);
            } catch (Exception failure) {
                sourceError = failure.getMessage();
                Log.w(TAG, "Could not prepare " + key, failure);
            }
        }

        private void schedulePage(int index) {
            JSONArray pages = manifest.optJSONArray("pages");
            if (!pages.isNull(index) || remotePages.isNull(index) || downloadingPages.contains(index)) return;
            String url = remotePages.optString(index);
            if (url.equals(attemptedPages.put(index, url))) return;
            downloadingPages.add(index);
            ExecutorService worker = index == 0 ? FIRST_PAGES : PAGES;
            submit(worker, url, "page-" + index, "Страница " + (index + 1), false, result -> {
                downloadingPages.remove(index);
                if (result != null) {
                    try { pages.put(index, result); }
                    catch (org.json.JSONException error) { throw new IllegalStateException(error); }
                } else schedulePage(index);
            });
        }

        private void scheduleAudio() {
            if (remoteAudio == null || downloadingAudio || !manifest.isNull("audioUrl") || remoteAudio.equals(attemptedAudio)) return;
            attemptedAudio = remoteAudio;
            downloadingAudio = true;
            submit(AUDIO, remoteAudio, "audio", "Аудио", true, result -> {
                downloadingAudio = false;
                if (result == null) scheduleAudio();
                else put(manifest, "audioUrl", result);
            });
        }

        private void submit(ExecutorService worker, String url, String name, String label, boolean audio,
                            java.util.function.Consumer<String> callback) {
            String origin = referer, agent = userAgent;
            worker.execute(() -> {
                String saved = null;
                try { saved = save(url, mediaDirectory, name, label, origin, agent, audio); }
                catch (Exception failure) { Log.w(TAG, failure.getMessage()); }
                String result = saved;
                enqueue(() -> callback.accept(result));
            });
        }

        private void scheduleTiming(JSONObject view) {
            downloadingTiming = true;
            String origin = referer, agent = userAgent;
            TIMING.execute(() -> {
                try { prepareTiming(view, mediaDirectory, origin, agent); }
                catch (Exception failure) { Log.w(TAG, "Could not prepare timing", failure); }
                enqueue(() -> {
                    downloadingTiming = false;
                    for (String field : new String[]{"syncResponses", "midiUrl", "midiData"}) {
                        if (!view.isNull(field)) put(manifest, field, view.opt(field));
                    }
                });
            });
        }

        private void publish() {
            boolean pagesDone = sourceDone && downloadingPages.isEmpty();
            boolean finished = pagesDone && !downloadingAudio && !downloadingTiming;
            try {
                if (refresh && !finished) return;
                if (refresh && sourceError != null) throw new IOException(sourceError);
                if (manifest == null || manifest.getJSONArray("pages").isNull(0)) {
                    if (finished) throw new IOException(sourceError == null ? "Не удалось загрузить первую страницу нот" : sourceError);
                    return;
                }
                manifest.put("audioExpected", attemptedAudio != null || manifest.optBoolean("audioExpected"));
                if (refresh) WebScoreOfflineStore.requireComplete(manifest);
                File parent = manifestFile.getParentFile();
                if (!parent.isDirectory() && !parent.mkdirs() && !parent.isDirectory()) throw new IOException("Не удалось создать кеш нот");
                manifest.put("pagesDone", pagesDone);
                manifest.put("finished", finished);
                manifest.put("canAutoRetry", finished && sourceError == null && remotePages != null);
                manifest.put("updatedAt", System.currentTimeMillis());
                File temporary = new File(parent, manifestFile.getName() + ".new");
                Files.write(temporary.toPath(), manifest.toString().getBytes(StandardCharsets.UTF_8));
                Files.move(temporary.toPath(), manifestFile.toPath(), StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
                firstPage.complete(manifestFile.getAbsolutePath());
            } catch (Exception error) {
                if (finished) {
                    loads.remove(key, this);
                    firstPage.completeExceptionally(error);
                    complete.completeExceptionally(error);
                    if (refresh) WebScoreOfflineStore.deleteTree(mediaDirectory);
                }
                Log.w(TAG, "Could not write " + key, error);
            } finally {
                if (finished) {
                    JSONArray local = manifest == null ? null : manifest.optJSONArray("pages");
                    Log.i(TAG, "Score " + key + ": discovered " + countPages(remotePages)
                        + ", downloaded " + countPages(local) + "/" + (local == null ? 0 : local.length()));
                    loads.remove(key, this);
                    updates.shutdown();
                    complete.complete(manifestFile.getAbsolutePath());
                    File[] files = mediaDirectory.listFiles();
                    if (files != null && files.length == 0) mediaDirectory.delete();
                }
            }
        }
    }

    private static int countPages(JSONArray pages) {
        if (pages == null) return 0;
        int count = 0;
        for (int i = 0; i < pages.length(); i++) {
            if (!pages.isNull(i)) count++;
        }
        return count;
    }

    static Uri scorePage(String value) {
        Uri uri = Uri.parse(value);
        String path = uri.getPath();
        if (!"https".equals(uri.getScheme()) || !"musescore.com".equals(uri.getHost()) || uri.getUserInfo() != null
                || (uri.getPort() != -1 && uri.getPort() != 443)
                || path == null || !path.matches("/.+/scores/[0-9]+/?")) return null;
        return uri.buildUpon().clearQuery().fragment(null).build();
    }

    private static boolean sameScorePage(String first, String second) {
        if (first.equals(second)) return true;
        Uri page = scorePage(first);
        return page != null && page.equals(scorePage(second));
    }

    private static boolean localFile(String value) {
        Uri uri = Uri.parse(value);
        String path = uri.getPath();
        return "file".equals(uri.getScheme()) && path != null && new File(path).isFile();
    }

    private static void put(JSONObject object, String field, Object value) {
        try { object.put(field, value); }
        catch (org.json.JSONException error) { throw new IllegalStateException(error); }
    }

    private static void prepareTiming(JSONObject manifest, File directory, String referer, String userAgent) throws Exception {
        // Synchronization is optional: a missing map must not break pages/audio.
        JSONArray sync = manifest.optJSONArray("syncResponses");
        if (sync == null) sync = new JSONArray();
        JSONArray syncUrls = manifest.optJSONArray("syncUrls");
        // The web player often already captured both maps. Do not download them a second time.
        String captured = sync.toString();
        boolean hasTime = captured.contains("elid") && captured.contains("position");
        boolean hasSpace = captured.contains("sx") && captured.contains("sy");
        if (hasTime && hasSpace && !manifest.optBoolean("customAudio")) syncUrls = null;
        if (syncUrls != null) for (int i = 0; i < Math.min(syncUrls.length(), 6); i++) {
            try {
                String localSync = save(syncUrls.getString(i), directory, "sync-" + i, "Разметка", referer, userAgent, false);
                File file = new File(Uri.parse(localSync).getPath());
                if (file.length() <= 8000000) {
                    ByteArrayOutputStream text = new ByteArrayOutputStream();
                    try (InputStream input = new FileInputStream(file)) {
                        byte[] buffer = new byte[8192]; int length;
                        while ((length = input.read(buffer)) != -1) text.write(buffer, 0, length);
                    }
                    String body = text.toString("UTF-8");
                    sync.put(body);
                    // jmuse API responses point at the actual timing payload.
                    try {
                        JSONObject response = new JSONObject(body);
                        JSONObject info = response.optJSONObject("info");
                        String linked = info == null ? response.optString("url", "") : info.optString("url", "");
                        if (!linked.isEmpty() && !linked.equals(syncUrls.getString(i)) && syncUrls.length() < 6) syncUrls.put(linked);
                    } catch (org.json.JSONException ignored) { }

                }
            } catch (Exception ignored) { /* Keep working playback if timing is unavailable. */ }
        }
        String midi = manifest.optString("midiUrl", "");
        if (!midi.isEmpty() && !midi.equals("null")) {
            try { manifest.put("midiUrl", save(midi, directory, "rhythm", "Разметка", referer, userAgent, false)); }
            catch (Exception ignored) { manifest.remove("midiUrl"); }
        }
        manifest.put("syncResponses", sync);
    }

    private static String save(String source, File directory, String name, String label,
                               String referer, String userAgent, boolean audio) throws Exception {
        URL url = checked(source);
        for (int redirect = 0; redirect < 6; redirect++) {
            if (Thread.currentThread().isInterrupted()) throw new IOException(label + ": загрузка отменена");
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setConnectTimeout(label.equals("Разметка") ? 4000 : 15000);
            connection.setReadTimeout(label.equals("Разметка") ? 6000 : 30000);
            connection.setInstanceFollowRedirects(false);
            connection.setRequestProperty("User-Agent", userAgent);
            connection.setRequestProperty("Referer", referer);
            connection.setRequestProperty("Accept", audio ? "audio/*,*/*;q=0.8" : "image/svg+xml,image/png,image/*;q=0.8");
            String cookies = CookieManager.getInstance().getCookie(url.toString());
            if (cookies != null && !cookies.isEmpty()) connection.setRequestProperty("Cookie", cookies);
            File target = null;
            boolean saved = false;
            try {
                int status = connection.getResponseCode();
                if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                    String location = connection.getHeaderField("Location");
                    if (location == null) throw new IOException(label + ": пустой адрес перенаправления");
                    url = checked(new URL(url, location).toString());
                    continue;
                }
                if (status != 200) throw new IOException(label + ": HTTP " + status + " (" + url.getHost() + ")");
                String type = connection.getContentType();
                String path = url.getPath().toLowerCase(Locale.ROOT);
                String extension = audio ? (path.endsWith(".ogg") ? ".ogg" : path.endsWith(".m4a") ? ".m4a" : ".mp3")
                        : (path.endsWith(".png") || path.endsWith(".png@0")
                            || (type != null && type.contains("image/png")) ? ".png" : ".svg");
                target = new File(directory, name + extension);
                try (InputStream input = connection.getInputStream(); OutputStream output = new FileOutputStream(target)) {
                    byte[] buffer = new byte[32768];
                    long size = 0;
                    int length;
                    while ((length = input.read(buffer)) != -1) {
                        if (Thread.currentThread().isInterrupted()) throw new IOException(label + ": загрузка отменена");
                        if (size == 0) {
                            String head = new String(buffer, 0, Math.min(length, 512), StandardCharsets.UTF_8).toLowerCase(Locale.ROOT);
                            if ((type != null && type.toLowerCase(Locale.ROOT).contains("text/html"))
                                    || head.contains("<!doctype html") || head.contains("<html")) {
                                throw new IOException(label + ": источник вернул HTML вместо медиа");
                            }
                        }
                        size += length;
                        if (size > 100L * 1024 * 1024) throw new IOException(label + ": слишком большой файл");
                        output.write(buffer, 0, length);
                    }
                    if (size == 0) throw new IOException(label + ": пустой файл");
                }
                saved = true;
                return Uri.fromFile(target).toString();
            } catch (IOException error) {
                throw new IOException(label + ": " + error.getMessage(), error);
            } finally {
                connection.disconnect();
                if (!saved && target != null) target.delete();
            }
        }
        throw new IOException(label + ": слишком много перенаправлений");
    }
}
