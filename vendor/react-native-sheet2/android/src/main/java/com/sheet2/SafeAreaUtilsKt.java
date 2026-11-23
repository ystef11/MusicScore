package com.sheet2;

import android.graphics.Insets;
import android.graphics.Rect;
import android.os.Build;
import android.view.View;
import android.view.WindowInsets;
import com.facebook.react.uimanager.PixelUtil;
import java.util.Map;
import kotlin.TuplesKt;
import kotlin.collections.MapsKt;
import kotlin.jvm.internal.Intrinsics;

public final class SafeAreaUtilsKt {
    private static final EdgeInsets getRootWindowInsetsCompatR(View view) {
        Insets insets;
        WindowInsets rootWindowInsets = view.getRootWindowInsets();
        if (rootWindowInsets == null || (insets = rootWindowInsets.getInsets(WindowInsets.Type.statusBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.navigationBars() | WindowInsets.Type.captionBar())) == null) {
            return null;
        }
        return new EdgeInsets(insets.top, insets.right, insets.bottom, insets.left);
    }

    private static final EdgeInsets getRootWindowInsetsCompatM(View view) {
        WindowInsets rootWindowInsets = view.getRootWindowInsets();
        if (rootWindowInsets == null) {
            return null;
        }
        return new EdgeInsets(rootWindowInsets.getSystemWindowInsetTop(), rootWindowInsets.getSystemWindowInsetRight(), Math.min(rootWindowInsets.getSystemWindowInsetBottom(), rootWindowInsets.getStableInsetBottom()), rootWindowInsets.getSystemWindowInsetLeft());
    }

    private static final EdgeInsets getRootWindowInsetsCompatBase(View view) {
        Rect rect = new Rect();
        view.getWindowVisibleDisplayFrame(rect);
        return new EdgeInsets(rect.top, view.getWidth() - rect.right, view.getHeight() - rect.bottom, rect.left);
    }

    private static final EdgeInsets getRootWindowInsetsCompat(View view) {
        return Build.VERSION.SDK_INT >= 30 ? getRootWindowInsetsCompatR(view) : getRootWindowInsetsCompatM(view);
    }

    public static final EdgeInsets getSafeAreaInsets(View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        if (view.getHeight() == 0) {
            return null;
        }
        View rootView = view.getRootView();
        Intrinsics.checkNotNull(rootView);
        EdgeInsets rootWindowInsetsCompat = getRootWindowInsetsCompat(rootView);
        if (rootWindowInsetsCompat == null) {
            return null;
        }
        float width = rootView.getWidth();
        float height = rootView.getHeight();
        Rect rect = new Rect();
        view.getGlobalVisibleRect(rect);
        return new EdgeInsets(Math.max(rootWindowInsetsCompat.getTop() - rect.top, 0.0f), Math.max(Math.min((rect.left + view.getWidth()) - width, 0.0f) + rootWindowInsetsCompat.getRight(), 0.0f), Math.max(Math.min((rect.top + view.getHeight()) - height, 0.0f) + rootWindowInsetsCompat.getBottom(), 0.0f), Math.max(rootWindowInsetsCompat.getLeft() - rect.left, 0.0f));
    }

    public static final Map<String, Float> edgeInsetsToJavaMap(EdgeInsets insets) {
        Intrinsics.checkNotNullParameter(insets, "insets");
        return MapsKt.mapOf(TuplesKt.to("top", Float.valueOf(PixelUtil.INSTANCE.pxToDp(insets.getTop()))), TuplesKt.to("right", Float.valueOf(PixelUtil.INSTANCE.pxToDp(insets.getRight()))), TuplesKt.to("bottom", Float.valueOf(PixelUtil.INSTANCE.pxToDp(insets.getBottom()))), TuplesKt.to("left", Float.valueOf(PixelUtil.INSTANCE.pxToDp(insets.getLeft()))));
    }
}
