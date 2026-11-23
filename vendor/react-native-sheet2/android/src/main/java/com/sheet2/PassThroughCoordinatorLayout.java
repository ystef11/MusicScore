package com.sheet2;

import android.content.Context;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ReactPointerEventsView;
import com.facebook.react.uimanager.ViewProps;
import kotlin.jvm.internal.Intrinsics;

public final class PassThroughCoordinatorLayout extends CoordinatorLayout implements ReactPointerEventsView {
    private final PointerEvents pointerEvents;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public PassThroughCoordinatorLayout(Context context) {
        super(context);
        Intrinsics.checkNotNullParameter(context, "context");
        this.pointerEvents = PointerEvents.BOX_NONE;
    }

    @Override
    public PointerEvents getPointerEvents() {
        return this.pointerEvents;
    }
}
