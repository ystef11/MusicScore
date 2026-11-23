package com.sheet2;

import android.content.Context;
import android.widget.FrameLayout;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ReactPointerEventsView;
import com.facebook.react.uimanager.ViewProps;
import kotlin.jvm.internal.Intrinsics;

public final class PassThroughFrameLayout extends FrameLayout implements ReactPointerEventsView {
    private final PointerEvents pointerEvents;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public PassThroughFrameLayout(Context context) {
        super(context);
        Intrinsics.checkNotNullParameter(context, "context");
        this.pointerEvents = PointerEvents.BOX_NONE;
    }

    @Override
    public PointerEvents getPointerEvents() {
        return this.pointerEvents;
    }
}
