package com.sheet2;

import android.content.Context;
import android.view.MotionEvent;
import android.widget.FrameLayout;
import kotlin.jvm.internal.Intrinsics;

final class DialogPassThroughFrameLayout extends FrameLayout {
    @Override
    public boolean dispatchTouchEvent(MotionEvent ev) {
        Intrinsics.checkNotNullParameter(ev, "ev");
        return false;
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent ev) {
        Intrinsics.checkNotNullParameter(ev, "ev");
        return false;
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        Intrinsics.checkNotNullParameter(event, "event");
        return false;
    }

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public DialogPassThroughFrameLayout(Context context) {
        super(context);
        Intrinsics.checkNotNullParameter(context, "context");
    }
}
