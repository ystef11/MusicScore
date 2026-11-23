package com.sheet2;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.Color;
import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.inputmethod.InputMethodManager;
import android.widget.FrameLayout;

import androidx.coordinatorlayout.widget.CoordinatorLayout;
import com.behavior.BottomSheetBehavior;
import com.facebook.react.uimanager.RootView;
import kotlin.Unit;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.internal.Intrinsics;
import kotlin.ranges.RangesKt;

public final class InlineSheetPresenter {
    private static final float SCRIM_ALPHA = 0.5f;
    private static final long SCRIM_DURATION_MS = 250;
    final AppFittedSheet anchor;
    BottomSheetBehavior<FrameLayout> behavior;
    private final View hostView;
    private Function0<Unit> onDismiss;
    private FrameLayout overlay;
    private FrameLayout overlayHost;
    private View overlayView;
    private ValueAnimator scrimAnimator;
    boolean snaps;

    public InlineSheetPresenter(AppFittedSheet anchor, View hostView) {
        Intrinsics.checkNotNullParameter(anchor, "anchor");
        Intrinsics.checkNotNullParameter(hostView, "hostView");
        this.anchor = anchor;
        this.hostView = hostView;
    }

    public final boolean isShown() {
        return this.overlay != null;
    }

    public final void show(final boolean dismissable, final boolean dismissOnOverlayTap, float overlayOpacity, int collapsedHeight, Function0<Unit> onDismiss) {
        ViewGroup viewGroupFindInlineRoot;
        Intrinsics.checkNotNullParameter(onDismiss, "onDismiss");
        if (isShown() || (viewGroupFindInlineRoot = InlineFooterPresenterKt.findInlineRoot(this.anchor)) == null) {
            return;
        }
        this.onDismiss = onDismiss;
        boolean z = true;
        this.snaps = collapsedHeight > 0;
        float f = overlayOpacity >= 0.0f ? overlayOpacity : 0.5f;
        Context context = this.anchor.getContext();
        Intrinsics.checkNotNull(context);
        PassThroughFrameLayout passThroughFrameLayout = new PassThroughFrameLayout(context);
        passThroughFrameLayout.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));
        PassThroughCoordinatorLayout passThroughCoordinatorLayout = new PassThroughCoordinatorLayout(context);
        passThroughCoordinatorLayout.setLayoutParams(new FrameLayout.LayoutParams(-1, -1));
        passThroughCoordinatorLayout.setBackgroundColor(0);
        PassThroughCoordinatorLayout passThroughCoordinatorLayout2 = passThroughCoordinatorLayout;
        passThroughFrameLayout.addView(passThroughCoordinatorLayout2);
        View view = new View(context);
        view.setLayoutParams(new CoordinatorLayout.LayoutParams(-1, -1));
        if (f > 0.0f) {
            passThroughCoordinatorLayout.addView(view);
        }
        final PassThroughFrameLayout passThroughFrameLayout2 = new PassThroughFrameLayout(context);
        CoordinatorLayout.LayoutParams layoutParams = new CoordinatorLayout.LayoutParams(-1, -2);
        layoutParams.gravity = 49;
        passThroughFrameLayout2.setLayoutParams(layoutParams);
        ViewParent parent = this.hostView.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(this.hostView);
        }
        passThroughFrameLayout2.addView(this.hostView);
        passThroughCoordinatorLayout.addView(passThroughFrameLayout2);
        final BottomSheetBehavior<FrameLayout> bottomSheetBehavior = new BottomSheetBehavior<>();
        bottomSheetBehavior.setHideable(true);
        bottomSheetBehavior.setSkipCollapsed(!this.snaps);
        if (!dismissable && !this.snaps) {
            z = false;
        }
        bottomSheetBehavior.setDraggable(z);
        bottomSheetBehavior.setPeekHeight(this.snaps ? collapsedHeight : 10, false);
        bottomSheetBehavior.setState(5);
        bottomSheetBehavior.addBottomSheetCallback(new InlineSheetPresenter$show$behavior$1$1(this, dismissable));
        ViewGroup.LayoutParams layoutParams2 = passThroughFrameLayout2.getLayoutParams();
        Intrinsics.checkNotNull(layoutParams2, "null cannot be cast to non-null type androidx.coordinatorlayout.widget.CoordinatorLayout.LayoutParams");
        ((CoordinatorLayout.LayoutParams) layoutParams2).setBehavior(bottomSheetBehavior);
        this.behavior = bottomSheetBehavior;
        view.setOnClickListener(new View.OnClickListener() {
            @Override
            public final void onClick(View view2) {
                InlineSheetPresenter.show$lambda$6(dismissable, dismissOnOverlayTap, bottomSheetBehavior, view2);
            }
        });
        if (f > 0.0f) {
            animateScrim(passThroughCoordinatorLayout2, 0.0f, f);
        }
        viewGroupFindInlineRoot.addView(passThroughFrameLayout);
        InlineFooterPresenter.INSTANCE.bringFootersToFront(viewGroupFindInlineRoot);
        this.overlay = passThroughFrameLayout;
        passThroughFrameLayout2.post(new Runnable() {
            @Override
            public final void run() {
                InlineSheetPresenter.show$lambda$8(bottomSheetBehavior, InlineSheetPresenter.this, passThroughFrameLayout2);
            }
        });
    }

    static final void show$lambda$6(boolean z, boolean z2, BottomSheetBehavior bottomSheetBehavior, View view) {
        if (z && z2) {
            bottomSheetBehavior.setState(5);
        }
    }

    static final void show$lambda$8(BottomSheetBehavior bottomSheetBehavior, final InlineSheetPresenter inlineSheetPresenter, PassThroughFrameLayout passThroughFrameLayout) {
        bottomSheetBehavior.setState(inlineSheetPresenter.snaps ? 4 : 3);
        passThroughFrameLayout.post(new Runnable() {
            @Override
            public final void run() {
                inlineSheetPresenter.anchor.pushContentOriginOffset$react_native_sheet2_release();
            }
        });
    }

    public static void dismiss$default(InlineSheetPresenter inlineSheetPresenter, boolean z, boolean z2, int i, Object obj) {
        if ((i & 1) != 0) {
            z = true;
        }
        if ((i & 2) != 0) {
            z2 = true;
        }
        inlineSheetPresenter.dismiss(z, z2);
    }

    public final void dismiss(boolean animated, boolean invokeCallback) {
        Function0<Unit> function0;
        FrameLayout frameLayout = this.overlay;
        if (frameLayout == null) {
            return;
        }
        hideKeyboard();
        BottomSheetBehavior<FrameLayout> bottomSheetBehavior = this.behavior;
        if (animated && bottomSheetBehavior != null && bottomSheetBehavior.getState() != 5) {
            bottomSheetBehavior.setHideable(true);
            bottomSheetBehavior.setState(5);
            return;
        }
        ValueAnimator valueAnimator = this.scrimAnimator;
        if (valueAnimator != null) {
            valueAnimator.cancel();
        }
        this.scrimAnimator = null;
        this.behavior = null;
        this.overlayHost = null;
        this.overlay = null;
        ViewParent parent = frameLayout.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(frameLayout);
        }
        ViewParent parent2 = this.hostView.getParent();
        ViewGroup viewGroup2 = parent2 instanceof ViewGroup ? (ViewGroup) parent2 : null;
        if (viewGroup2 != null) {
            viewGroup2.removeView(this.hostView);
        }
        if (invokeCallback && (function0 = this.onDismiss) != null) {
            function0.invoke();
        }
        this.onDismiss = null;
    }

    public final void setDismissable(boolean dismissable) {
        BottomSheetBehavior<FrameLayout> bottomSheetBehavior = this.behavior;
        if (bottomSheetBehavior != null) {
            bottomSheetBehavior.setDraggable(dismissable || this.snaps);
        }
    }

    public final void setOverlayView(View view) {
        if (Intrinsics.areEqual(this.overlayView, view)) {
            return;
        }
        View view2 = this.overlayView;
        ViewParent parent = view2 != null ? view2.getParent() : null;
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(this.overlayView);
        }
        this.overlayView = view;
        attachOverlayView();
    }

    private final void attachOverlayView() {
        View view;
        FrameLayout frameLayout = this.overlayHost;
        if (frameLayout == null || (view = this.overlayView) == null) {
            return;
        }
        ViewParent parent = view.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        SheetTreeLog.INSTANCE.log(view.getContext(), "inline.attachOverlay", "overlay=" + SheetTreeLog.INSTANCE.tag(view) + " from=" + SheetTreeLog.INSTANCE.tag(viewGroup) + " fromChildren=" + SheetTreeLog.INSTANCE.childTags(viewGroup) + " to=" + SheetTreeLog.INSTANCE.tag(frameLayout));
        if (viewGroup != null) {
            viewGroup.removeView(view);
        }
        view.setLayoutParams(new FrameLayout.LayoutParams(-1, -1));
        frameLayout.addView(view);
    }

    private final void hideKeyboard() {
        View viewFindFocus = this.hostView.findFocus();
        if (viewFindFocus == null) {
            return;
        }
        Object systemService = this.hostView.getContext().getSystemService("input_method");
        InputMethodManager inputMethodManager = systemService instanceof InputMethodManager ? (InputMethodManager) systemService : null;
        if (inputMethodManager != null) {
            inputMethodManager.hideSoftInputFromWindow(viewFindFocus.getWindowToken(), 0);
        }
        viewFindFocus.clearFocus();
    }

    public final void cancelAncestorJsTouches(View child) {
        for (ViewParent parent = child.getParent(); parent != null; parent = parent.getParent()) {
            if (parent instanceof RootView) {
                long jUptimeMillis = SystemClock.uptimeMillis();
                MotionEvent motionEventObtain = MotionEvent.obtain(jUptimeMillis, jUptimeMillis, 3, 0.0f, 0.0f, 0);
                try {
                    Intrinsics.checkNotNull(motionEventObtain);
                    ((RootView) parent).onChildStartedNativeGesture(child, motionEventObtain);
                    return;
                } finally {
                    motionEventObtain.recycle();
                }
            }
        }
    }

    private final void animateScrim(final View target, float fromAlpha, float toAlpha) {
        ValueAnimator valueAnimator = this.scrimAnimator;
        if (valueAnimator != null) {
            valueAnimator.cancel();
        }
        ValueAnimator valueAnimatorOfFloat = ValueAnimator.ofFloat(fromAlpha, toAlpha);
        valueAnimatorOfFloat.setDuration(SCRIM_DURATION_MS);
        valueAnimatorOfFloat.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public final void onAnimationUpdate(ValueAnimator valueAnimator2) {
                InlineSheetPresenter.animateScrim$lambda$10$lambda$9(target, valueAnimator2);
            }
        });
        this.scrimAnimator = valueAnimatorOfFloat;
        valueAnimatorOfFloat.start();
    }

    static final void animateScrim$lambda$10$lambda$9(View view, ValueAnimator animation) {
        Intrinsics.checkNotNullParameter(animation, "animation");
        Object animatedValue = animation.getAnimatedValue();
        Intrinsics.checkNotNull(animatedValue, "null cannot be cast to non-null type kotlin.Float");
        view.setBackgroundColor(Color.argb(RangesKt.coerceIn((int) (((Float) animatedValue).floatValue() * 255.0f), 0, 255), 0, 0, 0));
    }
}
