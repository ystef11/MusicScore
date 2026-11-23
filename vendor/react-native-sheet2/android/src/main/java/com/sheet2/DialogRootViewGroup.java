package com.sheet2;

import android.content.Context;
import android.content.res.Resources;
import android.graphics.Outline;
import android.os.Looper;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewOutlineProvider;
import android.view.ViewParent;

import kotlin.Lazy;
import kotlin.LazyKt;
import kotlin.Unit;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.internal.Intrinsics;

public final class DialogRootViewGroup extends BaseRNView {
    private boolean centeredPresentation;
    private final View.OnLayoutChangeListener contentLayoutListener;
    private boolean followsContentHeight;

    private final Lazy metrics;
    private Function0<Unit> onSheetLayoutChanged;
    private View reactView;
    private float sheetMaxHeightSize;
    private float sheetMaxWidthSize;
    private float sheetMinHeightSize;

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public DialogRootViewGroup(Context context) {
        super(context);
        Intrinsics.checkNotNullParameter(context, "context");
        this.sheetMaxHeightSize = Float.MAX_VALUE;
        this.sheetMaxWidthSize = Float.MAX_VALUE;
        this.sheetMinHeightSize = Float.MIN_VALUE;
        this.contentLayoutListener = new View.OnLayoutChangeListener() {
            @Override
            public final void onLayoutChange(View view, int i, int i2, int i3, int i4, int i5, int i6, int i7, int i8) {
                DialogRootViewGroup.this.syncHeightToContent();
            }
        };
        this.metrics = LazyKt.lazy(new Function0() {
            @Override
            public final Object invoke() {
                return Resources.getSystem();
            }
        });
    }

    public final Function0<Unit> getOnSheetLayoutChanged() {
        return this.onSheetLayoutChanged;
    }

    public final void setOnSheetLayoutChanged(Function0<Unit> function0) {
        this.onSheetLayoutChanged = function0;
    }

    public final float getSheetMaxHeightSize() {
        return this.sheetMaxHeightSize;
    }

    public final void setSheetMaxHeightSize(float f) {
        this.sheetMaxHeightSize = f;
    }

    public final float getSheetMaxWidthSize() {
        return this.sheetMaxWidthSize;
    }

    public final void setSheetMaxWidthSize(float f) {
        this.sheetMaxWidthSize = f;
    }

    public final float getSheetMinHeightSize() {
        return this.sheetMinHeightSize;
    }

    public final void setSheetMinHeightSize(float f) {
        this.sheetMinHeightSize = f;
    }

    public final boolean getCenteredPresentation() {
        return this.centeredPresentation;
    }

    public final void setCenteredPresentation(boolean z) {
        this.centeredPresentation = z;
        if (z) {
            setTranslationX(0.0f);
        }
        layout();
    }

    public final boolean getFollowsContentHeight() {
        return this.followsContentHeight;
    }

    public final void setFollowsContentHeight(boolean z) {
        this.followsContentHeight = z;
        syncHeightToContent();
    }

    private final int getContentHeight() {
        View view;
        if (!this.followsContentHeight || (view = this.reactView) == null) {
            return 0;
        }
        return view.getHeight();
    }

    public final void syncHeightToContent() {
        int contentHeight = getContentHeight();
        if (contentHeight <= 0) {
            return;
        }
        ensureLayoutParams();
        ViewGroup.LayoutParams layoutParams = getLayoutParams();
        if (layoutParams == null) {
            return;
        }
        if (layoutParams.height == contentHeight && getHeight() == contentHeight) {
            return;
        }
        layoutParams.height = contentHeight;
        Object parent = getParent();
        View view = parent instanceof View ? (View) parent : null;
        if (view != null && view.getHeight() > 0) {
            int width = getWidth() > 0 ? getWidth() : view.getWidth();
            measure(View.MeasureSpec.makeMeasureSpec(width, 1073741824), View.MeasureSpec.makeMeasureSpec(contentHeight, 1073741824));
            int height = (view.getHeight() - view.getPaddingBottom()) - contentHeight;
            layout(getLeft(), height, getLeft() + width, contentHeight + height);
        }
        layout();
        notifySheetLayoutChanged();
    }

    private final float centeringTranslationX(int newWidth) {
        if (this.centeredPresentation) {
            return 0.0f;
        }
        return (getMetrics().getDisplayMetrics().widthPixels - newWidth) / 2;
    }

    private final Resources getMetrics() {
        Object value = this.metrics.getValue();
        Intrinsics.checkNotNullExpressionValue(value, "getValue(...)");
        return (Resources) value;
    }

    public final void setCornerRadius(final float r) {
        setOutlineProvider(new ViewOutlineProvider() {
            @Override
            public void getOutline(View view, Outline outline) {
                Intrinsics.checkNotNullParameter(view, "view");
                Intrinsics.checkNotNullParameter(outline, "outline");
                int width = view.getWidth();
                int height = view.getHeight();
                float f = r;
                outline.setRoundRect(0, 0, width, (int) (height + f), f);
            }
        });
        setClipToOutline(true);
    }

    private final int getAllowedHeight() {
        return Math.max(Math.min((int) this.sheetMaxHeightSize, getMetrics().getDisplayMetrics().heightPixels), (int) this.sheetMinHeightSize);
    }

    private final int getAllowedWidth() {
        return Math.min((int) this.sheetMaxWidthSize, getMetrics().getDisplayMetrics().widthPixels);
    }

    private final void ensureLayoutParams() {
        if (getLayoutParams() != null) {
            return;
        }
        setLayoutParams(new ViewGroup.LayoutParams(-2, -2));
    }

    private final void layout() {
        if (Intrinsics.areEqual(Looper.myLooper(), Looper.getMainLooper())) {
            ViewParent parent = getParent();
            if (parent != null) {
                parent.requestLayout();
                return;
            }
            return;
        }
        post(new Runnable() {
            @Override
            public final void run() {
                DialogRootViewGroup.layout$lambda$2(DialogRootViewGroup.this);
            }
        });
    }

    static final void layout$lambda$2(DialogRootViewGroup dialogRootViewGroup) {
        ViewParent parent = dialogRootViewGroup.getParent();
        if (parent != null) {
            parent.requestLayout();
        }
    }

    private final void notifySheetLayoutChanged() {
        post(new Runnable() {
            @Override
            public final void run() {
                DialogRootViewGroup.notifySheetLayoutChanged$lambda$3(DialogRootViewGroup.this);
            }
        });
    }

    static final void notifySheetLayoutChanged$lambda$3(DialogRootViewGroup dialogRootViewGroup) {
        Function0<Unit> function0 = dialogRootViewGroup.onSheetLayoutChanged;
        if (function0 != null) {
            function0.invoke();
        }
    }

    public final void setVirtualHeight(float h) {
        if (this.reactView == null) {
            return;
        }
        this.sheetMaxHeightSize = h;
        if (h == Float.MAX_VALUE) {
            return;
        }
        Integer numValueOf = Integer.valueOf(getContentHeight());
        if (numValueOf.intValue() <= 0) {
            numValueOf = null;
        }
        int iIntValue = numValueOf != null ? numValueOf.intValue() : getAllowedHeight();
        int allowedWidth = getAllowedWidth();
        ensureLayoutParams();
        ViewGroup.LayoutParams layoutParams = getLayoutParams();
        if (layoutParams != null) {
            layoutParams.height = iIntValue;
        }
        setTranslationX(centeringTranslationX(allowedWidth));
        ViewGroup.LayoutParams layoutParams2 = getLayoutParams();
        if (layoutParams2 != null) {
            layoutParams2.width = allowedWidth;
        }
        layout();
        notifySheetLayoutChanged();
    }

    public final void updateMaxWidth(float value) {
        this.sheetMaxWidthSize = value;
        int allowedWidth = getAllowedWidth();
        setTranslationX(centeringTranslationX(allowedWidth));
        ViewGroup.LayoutParams layoutParams = getLayoutParams();
        if (layoutParams != null) {
            layoutParams.width = allowedWidth;
        }
        layout();
        notifySheetLayoutChanged();
    }

    @Override
    public void addView(View child, int index, ViewGroup.LayoutParams params) {
        Intrinsics.checkNotNullParameter(child, "child");
        Intrinsics.checkNotNullParameter(params, "params");
        View view = this.reactView;
        SheetTreeLog.INSTANCE.log(getContext(), "host.addView", "child=" + SheetTreeLog.INSTANCE.tag(child) + " index=" + index + " children=" + SheetTreeLog.INSTANCE.childTags(this) + " replaces=" + SheetTreeLog.INSTANCE.tag(view));
        if (view != null) {
            removeView(view);
        }
        super.addView(child, index, params);
        this.reactView = child;
        child.addOnLayoutChangeListener(this.contentLayoutListener);
        setVirtualHeight(this.sheetMaxHeightSize);
    }

    @Override
    public void removeView(View view) {
        SheetTreeLog.INSTANCE.log(getContext(), "host.removeView", "child=" + SheetTreeLog.INSTANCE.tag(view) + " children=" + SheetTreeLog.INSTANCE.childTags(this));
        if (Intrinsics.areEqual(view, this.reactView)) {
            releaseReactView();
        }
        super.removeView(view);
    }

    @Override
    public void removeViewAt(int index) {
        SheetTreeLog.INSTANCE.log(getContext(), "host.removeViewAt", "index=" + index + " child=" + SheetTreeLog.INSTANCE.tag(getChildAt(index)) + " children=" + SheetTreeLog.INSTANCE.childTags(this));
        if (getChildAt(index) == this.reactView) {
            releaseReactView();
        }
        super.removeViewAt(index);
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
        notifySheetLayoutChanged();
    }

    private final void releaseReactView() {
        View view = this.reactView;
        if (view != null) {
            view.removeOnLayoutChangeListener(this.contentLayoutListener);
        }
        this.sheetMaxHeightSize = Float.MAX_VALUE;
        this.reactView = null;
    }
}
