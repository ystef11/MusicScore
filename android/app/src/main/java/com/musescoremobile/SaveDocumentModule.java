package com.musescoremobile;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.MimeTypeMap;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public class SaveDocumentModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final int CREATE_FILE_REQUEST_CODE = 43;
    private Promise pending;
    private List<SaveFile> files = List.of();
    private int currentFile;

    static final class SaveFile {
        final File source;
        final String name;
        final String mimeType;
        final boolean temporary;

        SaveFile(File source, String name, String mimeType, boolean temporary) {
            this.source = source;
            this.name = name;
            this.mimeType = mimeType;
            this.temporary = temporary;
        }
    }

    public SaveDocumentModule(ReactApplicationContext context) {
        super(context);
        context.addActivityEventListener(this);
    }

    @Override public String getName() { return "SaveDocumentModule"; }
    @Override public void onNewIntent(Intent intent) { }

    @ReactMethod
    public void saveDocuments(ReadableArray paths, Promise promise) {
        List<SaveFile> documents = new ArrayList<>();
        for (int i = 0; i < paths.size(); i++) {
            String path = paths.getString(i);
            File source = new File(path.startsWith("file://") ? path.substring(7) : path);
            String name = source.getName();
            int dot = name.lastIndexOf('.');
            String suffix = dot < 0 ? "" : name.substring(dot);
            String mimeType = suffix.isEmpty() ? null : MimeTypeMap.getSingleton()
                    .getMimeTypeFromExtension(suffix.substring(1).toLowerCase(Locale.ROOT));
            String datedName = (dot < 0 ? name : name.substring(0, dot)) + "_" + System.currentTimeMillis() + suffix;
            documents.add(new SaveFile(source, datedName, mimeType == null ? "*/*" : mimeType, false));
        }
        UiThreadUtil.runOnUiThread(() -> {
            if (begin(promise)) openPicker(documents);
        });
    }

    @ReactMethod
    public void saveWebScore(String manifestPath, String format, String title, Promise promise) {
        UiThreadUtil.runOnUiThread(() -> {
            if (!begin(promise)) return;
            new Thread(() -> {
                try {
                    SaveFile file = WebScoreExport.prepare(getReactApplicationContext(), manifestPath, format, title);
                    UiThreadUtil.runOnUiThread(() -> openPicker(List.of(file)));
                } catch (Exception error) {
                    UiThreadUtil.runOnUiThread(() -> reject("FILE_SAVE_ERROR", error.getMessage(), error));
                }
            }, "PrepareWebScoreExport").start();
        });
    }

    @ReactMethod
    public void saveOfflineScore(String path, String info, Promise promise) {
        UiThreadUtil.runOnUiThread(() -> {
            if (!begin(promise)) return;
            new Thread(() -> {
                try {
                    SaveFile archive = OfflineScoreArchive.exportScore(getReactApplicationContext(), path, info);
                    UiThreadUtil.runOnUiThread(() -> openPicker(List.of(archive)));
                } catch (Exception error) {
                    UiThreadUtil.runOnUiThread(() -> reject("FILE_SAVE_ERROR", error.getMessage(), error));
                }
            }, "PrepareOfflineScoreExport").start();
        });
    }

    @ReactMethod
    public void importOfflineScore(String uri, Promise promise) {
        new Thread(() -> {
            try {
                promise.resolve(OfflineScoreArchive.importScore(getReactApplicationContext(), Uri.parse(uri)).toString());
            } catch (Exception error) {
                promise.reject("OFFLINE_SCORE_IMPORT_FAILED", error);
            }
        }, "ImportOfflineScore").start();
    }

    private boolean begin(Promise promise) {
        if (pending != null) {
            promise.reject("SAVE_IN_PROGRESS", "Сохранение уже выполняется.");
            return false;
        }
        if (getCurrentActivity() == null) {
            promise.reject("ACTIVITY_NOT_FOUND", "Не удалось открыть окно сохранения.");
            return false;
        }
        pending = promise;
        return true;
    }

    private void openPicker(List<SaveFile> documents) {
        files = documents;
        pickNextFile();
    }

    private void pickNextFile() {
        if (currentFile == files.size()) {
            WritableMap result = Arguments.createMap();
            result.putString("status", "All files saved successfully");
            clearRequest().resolve(result);
            return;
        }
        SaveFile file = files.get(currentFile);
        Activity activity = getCurrentActivity();
        if (activity == null) {
            reject("ACTIVITY_NOT_FOUND", "Не удалось открыть окно сохранения.", null);
            return;
        }
        if (!file.source.isFile() || file.source.length() == 0) {
            reject("FILE_SAVE_ERROR", "Локальный файл недоступен.", null);
            return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType(file.mimeType);
        intent.putExtra(Intent.EXTRA_TITLE, file.name);
        try {
            activity.startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
        } catch (RuntimeException error) {
            reject("FILE_SAVE_ERROR", "Не удалось открыть окно сохранения.", error);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int request, int result, Intent data) {
        if (request != CREATE_FILE_REQUEST_CODE || pending == null || currentFile >= files.size()) return;
        Uri destination = data == null ? null : data.getData();
        if (result != Activity.RESULT_OK || destination == null) {
            reject("CANCELLED", "User cancelled the document creation", null);
            return;
        }
        File source = files.get(currentFile).source;
        new Thread(() -> {
            try (FileInputStream input = new FileInputStream(source);
                 OutputStream output = activity.getContentResolver().openOutputStream(destination, "wt")) {
                if (output == null) throw new IOException("Unable to open destination");
                byte[] buffer = new byte[32768];
                int count;
                while ((count = input.read(buffer)) != -1) output.write(buffer, 0, count);
            } catch (Exception error) {
                UiThreadUtil.runOnUiThread(() -> reject("FILE_SAVE_ERROR", "Не удалось записать файл.", error));
                return;
            }
            UiThreadUtil.runOnUiThread(() -> {
                currentFile++;
                pickNextFile();
            });
        }, "SaveDocument").start();
    }

    private Promise clearRequest() {
        for (SaveFile file : files) {
            if (file.temporary) file.source.delete();
        }
        Promise promise = pending;
        pending = null;
        files = List.of();
        currentFile = 0;
        return promise;
    }

    private void reject(String code, String message, Throwable error) {
        clearRequest().reject(code, message, error);
    }
}
