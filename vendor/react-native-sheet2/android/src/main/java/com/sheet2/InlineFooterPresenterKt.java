package com.sheet2;

import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import kotlin.jvm.internal.Intrinsics;

public final class InlineFooterPresenterKt {
    public static final ViewGroup findInlineRoot(View anchor) {
        Intrinsics.checkNotNullParameter(anchor, "anchor");
        ViewGroup viewGroup = null;
        for (ViewParent parent = anchor.getParent(); parent != null; parent = parent.getParent()) {
            boolean z = parent instanceof ViewGroup;
            if (z) {
                viewGroup = (ViewGroup) parent;
            }
            if (Intrinsics.areEqual(parent.getClass().getName(), "com.swmansion.rnscreens.Screen")) {
                ViewParent parent2 = parent.getParent();
                ViewGroup viewGroup2 = parent2 instanceof ViewGroup ? (ViewGroup) parent2 : null;
                if (viewGroup2 != null) {
                    return viewGroup2;
                }
                if (z) {
                    return (ViewGroup) parent;
                }
                return null;
            }
        }
        return viewGroup;
    }
}
