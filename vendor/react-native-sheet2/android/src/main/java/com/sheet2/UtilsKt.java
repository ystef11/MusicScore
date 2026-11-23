package com.sheet2;

import android.content.Context;
import android.graphics.Color;
import android.os.Build;
import android.view.Window;
import android.view.WindowInsetsController;
import com.facebook.react.bridge.ReadableMap;
import kotlin.jvm.internal.Intrinsics;

public final class UtilsKt {
    public static final boolean bool(ReadableMap readableMap, String value, boolean z) {
        Intrinsics.checkNotNullParameter(value, "value");
        return (readableMap != null && readableMap.hasKey(value)) ? readableMap.getBoolean(value) : z;
    }

    public static final float m9220float(ReadableMap readableMap, String value, float f) {
        Intrinsics.checkNotNullParameter(value, "value");
        return (readableMap != null && readableMap.hasKey(value)) ? (float) readableMap.getDouble(value) : f;
    }

    public static final double m9219double(ReadableMap readableMap, String value, double d) {
        Intrinsics.checkNotNullParameter(value, "value");
        return (readableMap != null && readableMap.hasKey(value)) ? readableMap.getDouble(value) : d;
    }

    public static final int color(ReadableMap readableMap, String value, Context context) {
        String string;
        Intrinsics.checkNotNullParameter(readableMap, "<this>");
        Intrinsics.checkNotNullParameter(value, "value");
        Intrinsics.checkNotNullParameter(context, "context");
        if (readableMap.hasKey(value) && (string = readableMap.getString("backgroundColor")) != null) {
            return Color.parseColor(string);
        }
        return 0;
    }

    public static final void setStatusBarStyle(Window window, boolean z) {
        Intrinsics.checkNotNullParameter(window, "<this>");
        if (Build.VERSION.SDK_INT < 26) {
            return;
        }
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController windowInsetsController = window.getDecorView().getWindowInsetsController();
            if (windowInsetsController != null) {
                windowInsetsController.setSystemBarsAppearance(!z ? 8 : 0, 8);
                return;
            }
            return;
        }
        if (z) {
            window.getDecorView().setSystemUiVisibility(window.getDecorView().getSystemUiVisibility() & (-8193));
        } else {
            window.getDecorView().setSystemUiVisibility(window.getDecorView().getSystemUiVisibility() | 8192);
        }
    }

    public static final void setSystemUIColor(Window window, int i) {
        Intrinsics.checkNotNullParameter(window, "<this>");
        window.setNavigationBarColor(i);
        if (Build.VERSION.SDK_INT >= 29) {
            window.setNavigationBarContrastEnforced(false);
        }
    }
}
