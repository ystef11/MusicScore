package com.sheet2;

import android.view.View;
import com.behavior.BottomSheetBehavior;
import kotlin.jvm.internal.Intrinsics;

public final class InlineSheetPresenter$show$behavior$1$1 extends BottomSheetBehavior.BottomSheetCallback {
    final boolean $dismissable;
    final InlineSheetPresenter this$0;

    InlineSheetPresenter$show$behavior$1$1(InlineSheetPresenter inlineSheetPresenter, boolean z) {
        this.this$0 = inlineSheetPresenter;
        this.$dismissable = z;
    }

    @Override
    public void onStateChanged(View bottomSheet, int newState) {
        BottomSheetBehavior bottomSheetBehavior;
        Intrinsics.checkNotNullParameter(bottomSheet, "bottomSheet");
        if (newState != 1) {
            if (newState != 3 && newState != 4) {
                if (newState == 5) {
                    this.this$0.dismiss(false, true);
                    return;
                } else if (newState != 6) {
                    return;
                }
            }
            if (this.this$0.snaps && (bottomSheetBehavior = this.this$0.behavior) != null) {
                bottomSheetBehavior.setHideable(this.$dismissable);
            }
            final InlineSheetPresenter inlineSheetPresenter = this.this$0;
            bottomSheet.post(new Runnable() {
                @Override
                public final void run() {
                    inlineSheetPresenter.anchor.pushContentOriginOffset$react_native_sheet2_release();
                }
            });
            return;
        }
        this.this$0.cancelAncestorJsTouches(bottomSheet);
    }

    @Override
    public void onSlide(View bottomSheet, float slideOffset) {
        Intrinsics.checkNotNullParameter(bottomSheet, "bottomSheet");
        this.this$0.anchor.pushContentOriginOffset$react_native_sheet2_release();
    }
}
