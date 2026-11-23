package com.sheet2;

import android.animation.Animator;
import android.animation.AnimatorListenerAdapter;
import android.animation.ValueAnimator;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.graphics.Rect;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewConfiguration;
import android.view.Window;
import android.view.WindowManager;
import android.widget.FrameLayout;


import kotlin.Unit;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.internal.Intrinsics;
import kotlin.ranges.RangesKt;

public final class CenteredSheetDialog {
    private final View contentView;
    private final Dialog dialog;
    private final boolean dismissable;
    private boolean dismissing;
    private final float maxDim;
    private final Function0<Unit> onDismiss;
    private final boolean slide;

    public CenteredSheetDialog(Context context, View contentView, boolean z, boolean z2, Function0<Unit> onDismiss) {
        int i;
        Intrinsics.checkNotNullParameter(context, "context");
        Intrinsics.checkNotNullParameter(contentView, "contentView");
        Intrinsics.checkNotNullParameter(onDismiss, "onDismiss");
        this.contentView = contentView;
        this.dismissable = z;
        this.slide = z2;
        this.onDismiss = onDismiss;
        Dialog dialog = new Dialog(context);
        this.dialog = dialog;
        this.maxDim = 0.5f;
        dialog.requestWindowFeature(1);
        DragDismissLayout dragDismissLayout = new DragDismissLayout(this, context);
        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(-2, -2);
        layoutParams.gravity = 17;
        dragDismissLayout.addView(contentView, layoutParams);
        dragDismissLayout.setCard(contentView);
        dialog.setContentView(dragDismissLayout);
        Window window = dialog.getWindow();
        if (window != null) {
            window.setBackgroundDrawableResource(android.R.color.transparent);
            window.setLayout(-1, -1);
            window.setGravity(17);
            window.addFlags(2);
            window.setDimAmount(0.5f);
            WindowManager.LayoutParams attributes = window.getAttributes();
            if (z2) {
                i = R.style.Custom_Theme_FullScreenDialog_Slide;
            } else {
                i = R.style.Custom_Theme_FullScreenDialog_Fade;
            }
            attributes.windowAnimations = i;
            window.setAttributes(attributes);
        }
        dialog.setCancelable(z);
        dialog.setCanceledOnTouchOutside(false);
        dialog.setOnCancelListener(new DialogInterface.OnCancelListener() {
            @Override
            public final void onCancel(DialogInterface dialogInterface) {
                CenteredSheetDialog._init_$lambda$3(CenteredSheetDialog.this, dialogInterface);
            }
        });
        dialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
            @Override
            public final void onDismiss(DialogInterface dialogInterface) {
                CenteredSheetDialog.this.onDismiss.invoke();
            }
        });
    }

    public final boolean isShowing() {
        return this.dialog.isShowing();
    }

    static final void _init_$lambda$3(CenteredSheetDialog centeredSheetDialog, DialogInterface dialogInterface) {
        Window window = centeredSheetDialog.dialog.getWindow();
        if (window != null) {
            window.setWindowAnimations(0);
        }
    }

    public final void show() {
        this.dialog.show();
    }

    public final void dismiss() {
        if (!this.dialog.isShowing() || this.dismissing) {
            return;
        }
        View view = this.contentView;
        animateDismiss(view, view.getResources().getDisplayMetrics().heightPixels);
    }

    public final void finishDialog() {
        Window window = this.dialog.getWindow();
        if (window != null) {
            window.setWindowAnimations(0);
        }
        if (this.dialog.isShowing()) {
            this.dialog.dismiss();
        }
    }

    public final void setDim(float amount) {
        Window window = this.dialog.getWindow();
        if (window != null) {
            WindowManager.LayoutParams attributes = window.getAttributes();
            attributes.dimAmount = RangesKt.coerceIn(amount, 0.0f, this.maxDim);
            window.setAttributes(attributes);
        }
    }

    public final void animateDismiss(final View card, final float screenHeight) {
        WindowManager.LayoutParams attributes;
        if (this.dismissing) {
            return;
        }
        this.dismissing = true;
        final float translationY = card.getTranslationY();
        Window window = this.dialog.getWindow();
        final float f = (window == null || (attributes = window.getAttributes()) == null) ? this.maxDim : attributes.dimAmount;
        ValueAnimator valueAnimatorOfFloat = ValueAnimator.ofFloat(0.0f, 1.0f);
        valueAnimatorOfFloat.setDuration(200L);
        valueAnimatorOfFloat.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public final void onAnimationUpdate(ValueAnimator valueAnimator) {
                CenteredSheetDialog.animateDismiss$lambda$8$lambda$7(card, translationY, screenHeight, CenteredSheetDialog.this, f, valueAnimator);
            }
        });
        valueAnimatorOfFloat.addListener(new AnimatorListenerAdapter() {
            @Override
            public void onAnimationEnd(Animator animation) {
                Intrinsics.checkNotNullParameter(animation, "animation");
                CenteredSheetDialog.this.finishDialog();
            }
        });
        valueAnimatorOfFloat.start();
    }

    static final void animateDismiss$lambda$8$lambda$7(View view, float f, float f2, CenteredSheetDialog centeredSheetDialog, float f3, ValueAnimator valueAnimator) {
        Intrinsics.checkNotNullParameter(valueAnimator, "valueAnimator");
        Object animatedValue = valueAnimator.getAnimatedValue();
        Intrinsics.checkNotNull(animatedValue, "null cannot be cast to non-null type kotlin.Float");
        float fFloatValue = ((Float) animatedValue).floatValue();
        view.setTranslationY(f + ((f2 - f) * fFloatValue));
        centeredSheetDialog.setDim(f3 * (1.0f - fFloatValue));
    }

    public final void animateSpringBack(final View card) {
        WindowManager.LayoutParams attributes;
        final float translationY = card.getTranslationY();
        Window window = this.dialog.getWindow();
        final float f = (window == null || (attributes = window.getAttributes()) == null) ? this.maxDim : attributes.dimAmount;
        ValueAnimator valueAnimatorOfFloat = ValueAnimator.ofFloat(0.0f, 1.0f);
        valueAnimatorOfFloat.setDuration(180L);
        valueAnimatorOfFloat.addUpdateListener(new ValueAnimator.AnimatorUpdateListener() {
            @Override
            public final void onAnimationUpdate(ValueAnimator valueAnimator) {
                CenteredSheetDialog.animateSpringBack$lambda$10$lambda$9(card, translationY, CenteredSheetDialog.this, f, valueAnimator);
            }
        });
        valueAnimatorOfFloat.start();
    }

    static final void animateSpringBack$lambda$10$lambda$9(View view, float f, CenteredSheetDialog centeredSheetDialog, float f2, ValueAnimator a2) {
        Intrinsics.checkNotNullParameter(a2, "a");
        Object animatedValue = a2.getAnimatedValue();
        Intrinsics.checkNotNull(animatedValue, "null cannot be cast to non-null type kotlin.Float");
        float fFloatValue = ((Float) animatedValue).floatValue();
        view.setTranslationY(f * (1.0f - fFloatValue));
        centeredSheetDialog.setDim(f2 + ((centeredSheetDialog.maxDim - f2) * fFloatValue));
    }

    private final class DragDismissLayout extends FrameLayout {
        private View card;
        private final float density;
        private boolean downInsideCard;
        private float downX;
        private float downY;
        private boolean dragging;
        private final float fadeDistance;
        private final Rect hitRect;
        private long lastT;
        private float lastY;
        private final float screenHeight;
        final CenteredSheetDialog this$0;
        private final float threshold;
        private final int touchSlop;
        private float velocity;

        /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
        public DragDismissLayout(CenteredSheetDialog centeredSheetDialog, Context context) {
            super(context);
            Intrinsics.checkNotNullParameter(context, "context");
            this.this$0 = centeredSheetDialog;
            this.touchSlop = ViewConfiguration.get(context).getScaledTouchSlop();
            float f = getResources().getDisplayMetrics().density;
            this.density = f;
            float f2 = getResources().getDisplayMetrics().heightPixels;
            this.screenHeight = f2;
            float f3 = f * 96.0f;
            this.threshold = f3;
            this.fadeDistance = Math.max(f2 * 0.5f, f3 * 2.0f);
            this.hitRect = new Rect();
        }

        public final View getCard() {
            return this.card;
        }

        public final void setCard(View view) {
            this.card = view;
        }

        private final boolean cardContains(float x, float y) {
            View view = this.card;
            if (view == null) {
                return false;
            }
            view.getHitRect(this.hitRect);
            return this.hitRect.contains((int) x, (int) y);
        }

        @Override
        public boolean onInterceptTouchEvent(MotionEvent ev) {
            Intrinsics.checkNotNullParameter(ev, "ev");
            int actionMasked = ev.getActionMasked();
            if (actionMasked == 0) {
                this.downX = ev.getX();
                this.downY = ev.getY();
                this.downInsideCard = cardContains(ev.getX(), ev.getY());
                this.dragging = false;
                this.lastY = ev.getRawY();
                this.lastT = ev.getEventTime();
                this.velocity = 0.0f;
            } else if (actionMasked == 2) {
                if (this.this$0.dismissing) {
                    return true;
                }
                float y = ev.getY() - this.downY;
                float x = ev.getX() - this.downX;
                if (this.downInsideCard && y > this.touchSlop && y > Math.abs(x)) {
                    this.dragging = true;
                    return true;
                }
            }
            return this.dragging;
        }

        @Override
        public boolean onTouchEvent(MotionEvent ev) {
            Intrinsics.checkNotNullParameter(ev, "ev");
            int actionMasked = ev.getActionMasked();
            if (actionMasked == 0) {
                this.downX = ev.getX();
                this.downY = ev.getY();
                this.downInsideCard = cardContains(ev.getX(), ev.getY());
                return true;
            }
            if (actionMasked == 1) {
                View view = this.card;
                if (this.dragging && view != null) {
                    float y = ev.getY() - this.downY;
                    boolean z = this.velocity > this.density * 1200.0f;
                    if (!this.this$0.dismissable || (y <= this.threshold && !z)) {
                        this.this$0.animateSpringBack(view);
                    } else {
                        this.this$0.animateDismiss(view, this.screenHeight);
                    }
                } else if (!this.downInsideCard && this.this$0.dismissable && !this.this$0.dismissing && Math.abs(ev.getX() - this.downX) <= this.touchSlop && Math.abs(ev.getY() - this.downY) <= this.touchSlop && view != null) {
                    this.this$0.animateDismiss(view, this.screenHeight);
                }
                this.dragging = false;
                return true;
            }
            if (actionMasked != 2) {
                if (actionMasked == 3) {
                    View view2 = this.card;
                    if (this.dragging && view2 != null) {
                        this.this$0.animateSpringBack(view2);
                    }
                    this.dragging = false;
                    return true;
                }
                return super.onTouchEvent(ev);
            }
            if (!this.this$0.dismissing && this.dragging) {
                this.velocity = ((ev.getRawY() - this.lastY) / RangesKt.coerceAtLeast(ev.getEventTime() - this.lastT, 1L)) * 1000.0f;
                this.lastY = ev.getRawY();
                this.lastT = ev.getEventTime();
                float y2 = ev.getY() - this.downY;
                View view3 = this.card;
                if (view3 != null && y2 > 0.0f) {
                    view3.setTranslationY(y2);
                    CenteredSheetDialog centeredSheetDialog = this.this$0;
                    centeredSheetDialog.setDim(centeredSheetDialog.maxDim * (1.0f - (y2 / this.fadeDistance)));
                }
            }
            return true;
        }
    }
}
