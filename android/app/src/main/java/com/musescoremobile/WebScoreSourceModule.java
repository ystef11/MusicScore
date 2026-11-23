package com.musescoremobile;
import com.facebook.react.bridge.*;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
public final class WebScoreSourceModule extends ReactContextBaseJavaModule {
    private final PracticeMicrophone microphone;
    WebScoreSourceModule(ReactApplicationContext context) { super(context); microphone=new PracticeMicrophone(context); }
    @ReactMethod public void startPracticeMicrophone(Promise promise) { microphone.start(promise); }
    @ReactMethod public void stopPracticeMicrophone() { microphone.stop(); }
    @Override public void invalidate() { microphone.stop(); super.invalidate(); }

    @Override public String getName() { return "WebScoreSource"; }
    @ReactMethod public void fetchPage(String url, Promise promise) {
        WebScoreSession.fetch(getReactApplicationContext(), url, (page, error) -> {
            if (error != null) { promise.reject("WEB_SCORE_SOURCE_ERROR", error); return; }
            WritableMap result = Arguments.createMap();
            for (String key : new String[]{"html", "url", "userAgent", "cookie", "stateJSON"}) result.putString(key, page.optString(key, ""));
            promise.resolve(result);
        });
    }
    @ReactMethod public void webAccount(String requestJSON, Promise promise) {
        try {
            org.json.JSONObject request = new org.json.JSONObject(requestJSON);
            String operation = request.optString("operation");
            if (!operation.equals("list") && !operation.equals("favorite")) throw new IllegalArgumentException("Unsupported account operation");
            String script;
            try (java.io.InputStream input = getReactApplicationContext().getAssets().open("score-engine/web-account.js")) {
                java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream();
                byte[] buffer = new byte[8192]; int length;
                while ((length = input.read(buffer)) != -1) output.write(buffer, 0, length);
                script = output.toString("UTF-8").replace("__ACCOUNT_REQUEST__", request.toString());
            }
            String url = request.optString("pageUrl", "https://musescore.com/");
            ReactApplicationContext context = getReactApplicationContext();
            boolean interactive = operation.equals("list") && request.optBoolean("interactive");
            WebScoreSession.fetch(context, url, script, 25_000,
                context::getCurrentActivity, interactive, null, (page, error) -> {
                if (error != null) {
                    promise.reject("WEB_ACCOUNT", WebScoreSession.SOURCE_TIMEOUT.equals(error)
                        ? "MuseScore не ответил на запрос избранного" : error);
                    return;
                }
                org.json.JSONObject result = page.optJSONObject("probe");
                if (result == null || result.has("error")) {
                    promise.reject("WEB_ACCOUNT", result == null ? "Не получен ответ сайта" : result.optString("error")); return;
                }
                promise.resolve(result.toString());
            });
        } catch (Exception error) { promise.reject("WEB_ACCOUNT", error); }
    }
    @ReactMethod public void flushWebAccountCookies() {
        new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> android.webkit.CookieManager.getInstance().flush());
    }
    @ReactMethod public void clearWebAccountCookies(Promise promise) {
        new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
            try {
                WebScoreSession.cancelAll();
                android.webkit.WebStorage.getInstance().deleteAllData();
                android.webkit.WebViewDatabase database = android.webkit.WebViewDatabase.getInstance(getReactApplicationContext());
                database.clearFormData();
                database.clearHttpAuthUsernamePassword();
                android.webkit.WebView cleaner = new android.webkit.WebView(getReactApplicationContext());
                try {
                    cleaner.clearCache(true);
                    cleaner.clearHistory();
                    cleaner.clearSslPreferences();
                } finally { cleaner.destroy(); }
                android.webkit.CookieManager cookies = android.webkit.CookieManager.getInstance();
                cookies.removeAllCookies(removed -> {
                    cookies.flush();
                    promise.resolve(null);
                });
            } catch (Exception error) { promise.reject("WEB_ACCOUNT_CLEAR", error); }
        });
    }
    @ReactMethod public void fetchPlayable(String title, double authorId, String authorName, String preview,
                                           String cacheKey, boolean allowVerification, ReadableArray failedPages,
                                           Promise promise) {
        Set<Integer> failed = new HashSet<>();
        for (int i = 0; i < failedPages.size(); i++) {
            if (failedPages.getType(i) != ReadableType.Number) continue;
            int index = failedPages.getInt(i);
            if (index > 0) failed.add(index);
        }
        fetchScore(title, authorId, authorName, preview, cacheKey, allowVerification, failed, false, promise);
    }

    @ReactMethod public void refreshPlayable(String title, double authorId, String authorName, String preview,
                                              String cacheKey, Promise promise) {
        fetchScore(title, authorId, authorName, preview, cacheKey, false, Collections.emptySet(), true, promise);
    }

    @ReactMethod public void storePlayableOffline(String key, Promise promise) {
        if (!validKey(key, promise)) return;
        ReactApplicationContext context = getReactApplicationContext();
        WebScoreMediaCache.finished(context, key).whenCompleteAsync((path, error) -> {
            if (error != null) {
                promise.reject("WEB_SCORE_OFFLINE", error);
                return;
            }
            try {
                promise.resolve(WebScoreOfflineStore.save(context, key, new java.io.File(path)));
            } catch (Exception failure) {
                promise.reject("WEB_SCORE_OFFLINE", failure);
            }
        });
    }

    @ReactMethod public void deletePlayable(String key, boolean offline, Promise promise) {
        if (!validKey(key, promise)) return;
        ReactApplicationContext context = getReactApplicationContext();
        WebScoreMediaCache.finishedScore(key).whenCompleteAsync((ignored, error) -> {
            try {
                WebScoreOfflineStore.remove(context, key, offline);
                promise.resolve(null);
            } catch (Exception failure) {
                promise.reject("WEB_SCORE_OFFLINE", failure);
            }
        });
    }

    private boolean validKey(String key, Promise promise) {
        if (key.matches("[0-9]+-[0-9]+")) return true;
        promise.reject("WEB_SCORE_OFFLINE", "Некорректный идентификатор партитуры");
        return false;
    }

    @ReactMethod public void resolvePublicScoreUrl(String title, double authorId, String authorName, String preview, Promise promise) {
        fetchScore(title, authorId, authorName, preview, null, false, Collections.emptySet(), false, promise);
    }

    private void fetchScore(String title, double authorId, String authorName, String preview, String cacheKey,
                            boolean allowVerification, Set<Integer> failedPages, boolean refresh, Promise promise) {
        try {
            org.json.JSONObject expected = new org.json.JSONObject();
            expected.put("title", title); expected.put("authorId", authorId);
            expected.put("authorName", authorName); expected.put("preview", preview);
            expected.put("urlOnly", cacheKey == null);
            String script;
            try (java.io.InputStream input = getReactApplicationContext().getAssets().open("score-engine/web-score-source.js")) {
                java.io.ByteArrayOutputStream output = new java.io.ByteArrayOutputStream();
                byte[] buffer = new byte[8192]; int length;
                while ((length = input.read(buffer)) != -1) output.write(buffer, 0, length);
                script = output.toString("UTF-8").replace("__SCORE__", expected.toString());
            }
            String url = "https://musescore.com/sheetmusic?text=" + android.net.Uri.encode(title);
            if (cacheKey != null) {
                ReactApplicationContext context = getReactApplicationContext();
                WebScoreMediaCache.load(context, cacheKey, url, script,
                    context::getCurrentActivity, allowVerification, failedPages, refresh, promise);
                return;
            }
            WebScoreSession.fetch(getReactApplicationContext(), url, script, 10_000, (page, error) -> {
                if (error != null) {
                    promise.reject("WEB_SCORE_VIEW", error);
                    return;
                }
                org.json.JSONObject playable = page.optJSONObject("probe");
                if (playable == null || playable.has("error")) {
                    promise.reject("WEB_SCORE_VIEW", playable == null ? "Нет данных веб-плеера" : playable.optString("error")); return;
                }
                promise.resolve(playable.optString("sourceUrl"));
            });
        } catch (Exception error) { promise.reject("WEB_SCORE_VIEW", error); }
    }

}
