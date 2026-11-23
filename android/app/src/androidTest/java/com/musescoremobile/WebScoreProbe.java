package com.musescoremobile;
import android.app.Instrumentation;
import android.os.Bundle;
import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
public final class WebScoreProbe extends Instrumentation {
    private String url;
    private String expression;
    @Override public void onCreate(Bundle arguments) {
        super.onCreate(arguments);
        url = arguments.getString("url", "https://musescore.com/user/31734019/scores/5573180");
        String encoded = arguments.getString("expression64");
        if (encoded != null) expression = new String(android.util.Base64.decode(encoded, 0), StandardCharsets.UTF_8);
        start();
    }
    @Override public void onStart() {
        WebScoreSession.fetch(getTargetContext(), url, expression, (page, error) -> {
            Bundle result = new Bundle();
            result.putString("error", error);
            if (page != null) {
                result.putString("title", page.optString("title"));
                result.putString("globals", page.optString("globals"));
                result.putString("probe", page.optString("probe"));
                result.putString("stateJSON", page.optString("stateJSON").substring(0, Math.min(200, page.optString("stateJSON").length())));
                result.putInt("htmlBytes", page.optString("html").length());
                result.putBoolean("hasScoreState", page.optString("html").contains("type_download_list") || page.optString("html").contains("UGAPP"));
                try {
                    // Diagnostic body remains in the app's private directory; cookies are not logged.
                    Files.write(new File(getTargetContext().getFilesDir(), "web-score-probe.html").toPath(), page.optString("html").getBytes(StandardCharsets.UTF_8));
                } catch (Exception e) { result.putString("saveError", e.getClass().getSimpleName()); }
            }
            finish(error == null ? -1 : 0, result);
        });
    }
}
