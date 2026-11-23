package com.sheet2;

import android.content.Context;
import android.os.Bundle;
import android.util.TypedValue;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.widget.FrameLayout;
import androidx.appcompat.app.AppCompatDialog;
import androidx.coordinatorlayout.widget.CoordinatorLayout;
import com.behavior.BottomSheetBehavior;

public class CustomBottomSheetDialog extends AppCompatDialog {
    private BottomSheetBehavior<FrameLayout> behavior;
    private BottomSheetBehavior.BottomSheetCallback bottomSheetCallback;
    boolean cancelable;
    private FrameLayout container;
    public boolean dismissOnOverlayTap;
    boolean dismissWithAnimation;
    protected int startState;

    public void setNewNestedScrollView(View view) {
        this.behavior.setNewNestedScrollView(view);
    }

    public void collapse() {
        this.behavior.setState(4);
    }

    public void expand() {
        this.behavior.setState(3);
    }

    public void setSheetBackgroundColor(int i) {
        ViewGroup contentContainer = getContentContainer();
        if (contentContainer == null) {
            return;
        }
        contentContainer.setBackgroundColor(i);
    }

    public ViewGroup getContainerView() {
        ensureContainerAndBehavior();
        return this.container;
    }

    public int getDialogLayout() {
        return R.layout.dialog_bottom_sheet;
    }

    public int getContentContainerId() {
        return R.id.dialog_bottom_sheet_content_container;
    }

    public ViewGroup getContentContainer() {
        return (ViewGroup) getContainerView().findViewById(getContentContainerId());
    }

    public CustomBottomSheetDialog(Context context, int i) {
        super(context, getThemeResId(context, i));
        this.cancelable = true;
        this.dismissOnOverlayTap = true;
        this.startState = 3;
        this.bottomSheetCallback = new BottomSheetBehavior.BottomSheetCallback() {
            @Override
            public void onSlide(View view, float f) {
            }

            @Override
            public void onStateChanged(View view, int i2) {
                if (i2 == 5) {
                    CustomBottomSheetDialog.this.cancel();
                }
            }
        };
        supportRequestWindowFeature(1);
    }

    @Override
    public void setContentView(int i) {
        super.setContentView(wrapInBottomSheet(i, null, null));
    }

    @Override
    protected void onCreate(Bundle bundle) {
        super.onCreate(bundle);
        Window window = getWindow();
        if (window != null) {
            window.clearFlags(67108864);
            window.addFlags(Integer.MIN_VALUE);
            window.setLayout(-1, -1);
        }
    }

    @Override
    public void setContentView(View view) {
        super.setContentView(wrapInBottomSheet(0, view, null));
        setup();
    }

    @Override
    public void setContentView(View view, ViewGroup.LayoutParams layoutParams) {
        super.setContentView(wrapInBottomSheet(0, view, layoutParams));
    }

    @Override
    public void setCancelable(boolean z) {
        super.setCancelable(z);
        if (this.cancelable != z) {
            this.cancelable = z;
            BottomSheetBehavior<FrameLayout> bottomSheetBehavior = this.behavior;
            if (bottomSheetBehavior != null) {
                bottomSheetBehavior.setHideable(z);
                this.behavior.setDraggable(z);
            }
        }
    }

    private void setup() {
        this.behavior.setPeekHeight(10, true);
        this.behavior.setSkipCollapsed(true);
        this.startState = 3;
    }

    @Override
    protected void onStart() {
        super.onStart();
        BottomSheetBehavior<FrameLayout> bottomSheetBehavior = this.behavior;
        if (bottomSheetBehavior != null && bottomSheetBehavior.getState() == 5) {
            this.behavior.setState(4);
        }
        BottomSheetBehavior<FrameLayout> bottomSheetBehavior2 = this.behavior;
        if (bottomSheetBehavior2 != null) {
            bottomSheetBehavior2.setState(this.startState);
        }
    }

    @Override
    public void cancel() {
        BottomSheetBehavior<FrameLayout> behavior = getBehavior();
        if (!this.dismissWithAnimation || behavior.getState() == 5) {
            super.cancel();
        } else {
            behavior.setState(5);
        }
    }

    public BottomSheetBehavior<FrameLayout> getBehavior() {
        if (this.behavior == null) {
            ensureContainerAndBehavior();
        }
        return this.behavior;
    }

    private FrameLayout ensureContainerAndBehavior() {
        if (this.container == null) {
            FrameLayout frameLayout = (FrameLayout) View.inflate(getContext(), getDialogLayout(), null);
            this.container = frameLayout;
            BottomSheetBehavior<FrameLayout> bottomSheetBehaviorFrom = BottomSheetBehavior.from((FrameLayout) frameLayout.findViewById(R.id.design_bottom_sheet));
            this.behavior = bottomSheetBehaviorFrom;
            bottomSheetBehaviorFrom.addBottomSheetCallback(this.bottomSheetCallback);
            this.behavior.setHideable(this.cancelable);
        }
        return this.container;
    }

    private View wrapInBottomSheet(int i, View view, ViewGroup.LayoutParams layoutParams) {
        ensureContainerAndBehavior();
        CoordinatorLayout coordinatorLayout = (CoordinatorLayout) this.container.findViewById(R.id.coordinator);
        if (i != 0 && view == null) {
            view = getLayoutInflater().inflate(i, (ViewGroup) coordinatorLayout, false);
        }
        FrameLayout frameLayout = (FrameLayout) this.container.findViewById(R.id.design_bottom_sheet);
        FrameLayout frameLayout2 = (FrameLayout) getContentContainer();
        frameLayout2.removeAllViews();
        if (layoutParams == null) {
            frameLayout2.addView(view);
        } else {
            frameLayout2.addView(view, layoutParams);
        }
        coordinatorLayout.findViewById(R.id.touch_outside).setOnClickListener(new View.OnClickListener() {
            @Override
            public final void onClick(View view2) {
                CustomBottomSheetDialog.this.lambda$wrapInBottomSheet$0(view2);
            }
        });
        final View contentView = view;
        frameLayout.setOnTouchListener(new View.OnTouchListener() {
            @Override
            public final boolean onTouch(View view2, MotionEvent motionEvent) {
                return CustomBottomSheetDialog.this.lambda$wrapInBottomSheet$1(contentView, view2, motionEvent);
            }
        });
        return this.container;
    }

    public void lambda$wrapInBottomSheet$0(View view) {
        if (this.cancelable && this.dismissOnOverlayTap && isShowing()) {
            cancel();
        }
    }

    public boolean lambda$wrapInBottomSheet$1(View view, View view2, MotionEvent motionEvent) {
        if (motionEvent.getActionMasked() == 1 && this.cancelable && this.dismissOnOverlayTap && isShowing() && view != null && !isPointInsideCard(view, motionEvent.getRawX(), motionEvent.getRawY())) {
            cancel();
        }
        return true;
    }

    private static boolean isPointInsideCard(View view, float f, float f2) {
        int[] iArr = new int[2];
        view.getLocationOnScreen(iArr);
        int i = iArr[0];
        if (f >= i && f <= i + view.getWidth()) {
            int i2 = iArr[1];
            if (f2 >= i2 && f2 <= i2 + view.getHeight()) {
                return true;
            }
        }
        return false;
    }

    private static int getThemeResId(Context context, int i) {
        if (i != 0) {
            return i;
        }
        TypedValue typedValue = new TypedValue();
        if (context.getTheme().resolveAttribute(com.google.android.material.R.attr.bottomSheetDialogTheme, typedValue, true)) {
            return typedValue.resourceId;
        }
        return com.google.android.material.R.style.Theme_Design_Light_BottomSheetDialog;
    }
}
