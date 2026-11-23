package com.musescoremobile;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;
import android.os.SystemClock;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import java.util.Map;
import java.util.function.Supplier;
import org.json.JSONObject;
import org.json.JSONTokener;

/** A Chromium session for reading score data, with interactive verification when needed. */
public final class WebScoreSession {
    private static final String TAG = "WebScoreSession";
    private static final long FIRST_PAGE_TIMEOUT_MS = 30_000;
    private static final long PROBE_TIMEOUT_MS = 2_000;
    public interface Callback { void complete(JSONObject page, String error); }
    private static final java.util.Set<Request> active = new java.util.HashSet<>();
    private static Request verificationOwner;
    static final String VERIFICATION_REQUIRED = "MuseScore запрашивает проверку браузера";
    static final String SOURCE_TIMEOUT = "MuseScore не ответил вовремя";
    private static final String VERIFICATION_CANCELED = "Проверка браузера отменена";
    // Called on the UI thread before clearing the shared browser session.
    static void cancelAll() {
        for (Request request : new java.util.ArrayList<>(active)) request.finish(null, "Browser session closed");
    }
    private static boolean allowed(String url) {
        Uri uri = Uri.parse(url);
        String host = uri.getHost();
        return "https".equals(uri.getScheme()) && host != null
            && (host.equals("musescore.com") || host.endsWith(".musescore.com"))
            && uri.getUserInfo() == null && (uri.getPort() == -1 || uri.getPort() == 443);
    }
    private static boolean hasChallengeHeader(Map<String, String> headers) {
        if (headers == null) return false;
        for (Map.Entry<String, String> header : headers.entrySet()) {
            if ("cf-mitigated".equalsIgnoreCase(header.getKey())
                    && "challenge".equalsIgnoreCase(header.getValue())) return true;
        }
        return false;
    }
    public static void fetch(Context context, String url, Callback callback) { fetch(context, url, null, callback); }
    public static void fetch(Context context, String url, String expression, Callback callback) {
        fetch(context, url, expression, 75_000, callback);
    }
    static void fetch(Context context, String url, String expression, long timeoutMillis, Callback callback) {
        fetch(context, url, expression, timeoutMillis, null, false, null, callback);
    }
    static void fetch(Context context, String url, String expression, long timeoutMillis,
                      Supplier<Activity> activitySupplier, boolean allowVerification, Callback progress, Callback callback) {
        new Handler(Looper.getMainLooper()).post(() -> {
            if (!allowed(url)) { callback.complete(null, "Unsupported score host"); return; }
            try { new Request(context, url, expression, timeoutMillis, activitySupplier, allowVerification, progress, callback).start(); }
            catch (RuntimeException e) { callback.complete(null, e.getClass().getSimpleName() + ": " + e.getMessage()); }
        });
    }
    private static final class Request {
        final Handler handler = new Handler(Looper.getMainLooper());
        final WebView view;
        final String url;
        final String expression;
        final long timeoutMillis;
        final Supplier<Activity> activitySupplier;
        final boolean allowVerification;
        final Callback progress;
        final Callback callback;
        final Runnable sourceTimeout = this::onSourceTimeout;
        final Runnable firstPageTimeout = this::onFirstPageTimeout;
        final Runnable pollTask = this::poll;
        boolean done, reportedProgress, verificationPresented, verificationCompleted;
        boolean challengeResponse, pageCommitted, waitingForVerification;
        int navigation, verificationNavigation;
        int probeId;
        long probeStartedAt = -1;
        AlertDialog verificationDialog;
        FrameLayout readerHost;

        Request(Context context, String url, String expression, long timeoutMillis,
                Supplier<Activity> activitySupplier, boolean allowVerification, Callback progress, Callback callback) {
            this.url = url;
            this.expression = expression;
            this.timeoutMillis = timeoutMillis;
            this.activitySupplier = activitySupplier;
            this.allowVerification = allowVerification;
            this.progress = progress;
            this.callback = callback;
            view = createView(context);
        }

        private WebView createView(Context context) {
            WebView browser = new WebView(context);
            sizeForReading(browser);
            WebSettings settings = browser.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(false);
            settings.setAllowContentAccess(false);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            settings.setSupportMultipleWindows(false);
            // Use the real WebView user agent, without claiming a different device.
            CookieManager cookies = CookieManager.getInstance();
            cookies.setAcceptCookie(true);
            if (allowVerification) cookies.setAcceptThirdPartyCookies(browser, true);
            browser.setWebViewClient(new WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest request) {
                    return request.isForMainFrame() && !allowed(request.getUrl().toString());
                }

                @Override public void onPageStarted(WebView v, String pageUrl, Bitmap favicon) {
                    if (done || v != view) return;
                    navigation++;
                    probeStartedAt = -1;
                    challengeResponse = false;
                    pageCommitted = false;
                    if (verificationDialog != null) v.setVisibility(View.INVISIBLE);
                }

                @Override public void onPageCommitVisible(WebView v, String pageUrl) {
                    if (done || v != view) return;
                    pageCommitted = true;
                    if (challengeResponse && verificationDialog != null) v.setVisibility(View.VISIBLE);
                }

                @Override public void onPageFinished(WebView v, String pageUrl) {
                    if (!done && v == view && pageUrl.equals(v.getUrl())) onPageCommitVisible(v, pageUrl);
                }

                @Override public void onReceivedHttpError(WebView v, WebResourceRequest request, WebResourceResponse response) {
                    if (done || v != view || !request.isForMainFrame() || !allowed(request.getUrl().toString())) return;
                    if (hasChallengeHeader(response.getResponseHeaders())) {
                        challengeResponse = true;
                        onChallenge(pageCommitted);
                    } else {
                        finish(null, "Сайт MuseScore вернул ошибку HTTP " + response.getStatusCode());
                    }
                }

                @Override public void onReceivedError(WebView v, WebResourceRequest request, WebResourceError error) {
                    if (done || v != view || !request.isForMainFrame()) return;
                    Log.w(TAG, "MuseScore navigation failed, WebView error " + error.getErrorCode());
                    finish(null, "Не удалось подключиться к MuseScore");
                }

                @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail detail) {
                    if (v == view) finish(null, "Встроенный браузер остановился. Повторите загрузку");
                    return true;
                }
            });
            return browser;
        }

        private static void sizeForReading(WebView view) {
            android.util.DisplayMetrics metrics = view.getContext().getResources().getDisplayMetrics();
            view.measure(View.MeasureSpec.makeMeasureSpec(metrics.widthPixels, View.MeasureSpec.EXACTLY),
                View.MeasureSpec.makeMeasureSpec(metrics.heightPixels, View.MeasureSpec.EXACTLY));
            view.layout(0, 0, metrics.widthPixels, metrics.heightPixels);
        }

        void start() {
            active.add(this);
            try {
                attachScoreViewer();
                scheduleSourceTimeouts();
                view.loadUrl(url);
                handler.postDelayed(pollTask, progress != null ? 250 : 500);
            } catch (RuntimeException error) {
                finish(null, "Не удалось открыть страницу MuseScore");
            }
        }

        private Activity currentActivity() {
            Activity activity = activitySupplier == null ? null : activitySupplier.get();
            return activity == null || activity.isDestroyed() || activity.isFinishing() ? null : activity;
        }

        private void attachScoreViewer() {
            if (progress == null) return;
            Activity activity = currentActivity();
            if (activity == null || !(activity.findViewById(android.R.id.content) instanceof FrameLayout content)) return;
            // The site's page observer needs a laid-out viewport in the active window.
            readerHost = new FrameLayout(activity) {
                @Override public boolean dispatchTouchEvent(MotionEvent event) { return false; }
            };
            readerHost.setImportantForAccessibility(View.IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS);
            readerHost.setDescendantFocusability(ViewGroup.FOCUS_BLOCK_DESCENDANTS);
            readerHost.setAlpha(0f);
            int matchParent = ViewGroup.LayoutParams.MATCH_PARENT;
            readerHost.addView(view, new FrameLayout.LayoutParams(matchParent, matchParent));
            content.addView(readerHost, 0, new FrameLayout.LayoutParams(matchParent, matchParent));
        }

        private void detachScoreViewer() {
            if (readerHost == null) return;
            readerHost.removeView(view);
            if (readerHost.getParent() instanceof ViewGroup parent) parent.removeView(readerHost);
            readerHost = null;
        }

        private void scheduleSourceTimeouts() {
            handler.removeCallbacks(sourceTimeout);
            handler.removeCallbacks(firstPageTimeout);
            handler.postDelayed(sourceTimeout, timeoutMillis);
            if (progress != null && !reportedProgress) handler.postDelayed(firstPageTimeout, FIRST_PAGE_TIMEOUT_MS);
        }

        private void onSourceTimeout() {
            String message = verificationDialog != null ? "Не удалось завершить проверку браузера MuseScore"
                : waitingForVerification ? VERIFICATION_REQUIRED
                : SOURCE_TIMEOUT;
            finish(null, message);
        }

        private void onFirstPageTimeout() {
            if (reportedProgress) return;
            Log.w(TAG, "Score viewer timed out: attached=" + view.isAttachedToWindow()
                + ", size=" + view.getWidth() + "x" + view.getHeight());
            finish(null, waitingForVerification ? VERIFICATION_REQUIRED : SOURCE_TIMEOUT);
        }

        private void onChallenge(boolean showContent) {
            if (verificationCompleted) {
                finish(null, "MuseScore снова запросил проверку после её завершения");
                return;
            }
            if (verificationDialog == null && (!allowVerification || verificationPresented || reportedProgress)) {
                finish(null, VERIFICATION_REQUIRED);
                return;
            }
            if (!waitingForVerification || challengeResponse || pageCommitted) verificationNavigation = navigation;
            waitingForVerification = true;
            if (verificationDialog == null) showVerification(showContent);
            else if (showContent) view.setVisibility(View.VISIBLE);
        }

        private void showVerification(boolean showContent) {
            if (verificationOwner != null) return;
            Activity activity = currentActivity();
            if (activity == null || !activity.hasWindowFocus()) return;

            try {
                detachScoreViewer();
                verificationDialog = new AlertDialog.Builder(activity)
                    .setTitle("Проверка MuseScore")
                    .setView(view)
                    .setNegativeButton("Отмена", (dialog, button) -> finish(null, VERIFICATION_CANCELED))
                    .setOnCancelListener(dialog -> finish(null, VERIFICATION_CANCELED))
                    .create();
                verificationPresented = true;
                verificationOwner = this;
                view.setVisibility(showContent ? View.VISIBLE : View.INVISIBLE);
                verificationDialog.setCanceledOnTouchOutside(false);
                verificationDialog.show();
                handler.removeCallbacks(firstPageTimeout);
                handler.removeCallbacks(sourceTimeout);
                handler.postDelayed(sourceTimeout, 120_000);
            } catch (RuntimeException error) {
                finish(null, VERIFICATION_REQUIRED);
            }
        }

        private void closeVerification() {
            if (verificationDialog == null) return;
            AlertDialog dialog = verificationDialog;
            verificationDialog = null;
            verificationOwner = null;
            if (view.getParent() instanceof ViewGroup parent) parent.removeView(view);
            dialog.dismiss();
            view.setVisibility(View.VISIBLE);
        }

        private void resumeAfterVerification() {
            waitingForVerification = false;
            verificationCompleted = true;
            Log.i(TAG, "Browser verification passed, continuing in the same WebView");
            closeVerification();
            sizeForReading(view);
            attachScoreViewer();
            scheduleSourceTimeouts();
        }

        void poll() {
            if (done) return;
            // Page navigation can discard an evaluateJavascript callback from the previous document.
            handler.postDelayed(pollTask, progress != null ? 250 : 500);
            long now = SystemClock.uptimeMillis();
            if (probeStartedAt >= 0 && now - probeStartedAt < PROBE_TIMEOUT_MS) return;
            probeStartedAt = now;
            int currentProbe = ++probeId;
            int polledNavigation = navigation;
            String script = "(function(){const page={url:location.href,title:document.title,ready:document.readyState,"
                + "challenge:!!window._cf_chl_opt||/just a moment|^один момент/i.test(document.title)};"
                + "if(" + (waitingForVerification || challengeResponse) + "||page.challenge||page.ready==='loading'"
                + "||location.protocol!=='https:'||!/(^|\\.)musescore\\.com$/.test(location.hostname))return JSON.stringify(page);"
                + (expression == null
                    ? "page.html=document.documentElement?.outerHTML||'';"
                        + "try{page.stateJSON=JSON.stringify(window.UGAPP?.store||window.__INITIAL_STATE__||null)}catch(e){}"
                    : "try{page.probe=(" + expression + ")}catch(e){}")
                + "return JSON.stringify(page)})()";
            view.evaluateJavascript(script, value -> {
                if (done || currentProbe != probeId || polledNavigation != navigation) return;
                probeStartedAt = -1;
                try {
                    Object decoded = new JSONTokener(value).nextValue();
                    JSONObject page = new JSONObject(String.valueOf(decoded));
                    String current = page.optString("url");
                    String html = page.optString("html");
                    boolean documentChallenge = page.optBoolean("challenge");
                    boolean challenge = challengeResponse || documentChallenge;
                    JSONObject probe = page.optJSONObject("probe");
                    boolean ready = expression != null ? probe != null : html.length() > 500;
                    boolean allowedPage = allowed(current);
                    if (allowedPage && challenge) {
                        onChallenge(documentChallenge || pageCommitted);
                        if (done) return;
                    } else if (allowedPage && waitingForVerification && pageCommitted && navigation > verificationNavigation
                            && !page.optString("title").isEmpty() && !"loading".equals(page.optString("ready"))) {
                        if (verificationDialog != null) {
                            try { resumeAfterVerification(); }
                            catch (RuntimeException error) { finish(null, "Не удалось возобновить загрузку MuseScore"); }
                            return;
                        }
                        waitingForVerification = false;
                    }
                    if (allowedPage && !challenge && ready) {
                        page.put("userAgent", view.getSettings().getUserAgentString());
                        if (probe != null && probe.optBoolean("pending")) {
                            if (progress != null && probe.has("pages")) {
                                reportedProgress = true;
                                progress.complete(page, null);
                            }
                            return;
                        }
                        page.put("cookie", CookieManager.getInstance().getCookie(current));
                        finish(page, null); return;
                    }
                } catch (Exception ignored) { /* A navigation may replace the JS context while polling. */ }
            });
        }
        void finish(JSONObject page, String error) {
            if (done) return;
            done = true;
            active.remove(this);
            handler.removeCallbacksAndMessages(null);
            closeVerification();
            detachScoreViewer();
            view.destroy();
            if (error != null) Log.w(TAG, error);
            callback.complete(page, error);
        }
    }
    private WebScoreSession() {}
}
