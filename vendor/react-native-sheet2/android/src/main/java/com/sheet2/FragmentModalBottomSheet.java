package com.sheet2;

import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.Window;
import android.widget.FrameLayout;

import com.facebook.react.devsupport.StackTraceHelper;
import com.google.android.material.bottomsheet.BottomSheetDialogFragment;
import java.lang.ref.WeakReference;
import kotlin.Unit;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.internal.DefaultConstructorMarker;
import kotlin.jvm.internal.Intrinsics;

public final class FragmentModalBottomSheet extends BottomSheetDialogFragment {

    public static final Companion INSTANCE = new Companion(null);
    private static WeakReference<Window> presentedWindow;
    private boolean dismissAll;
    private boolean dismissOnOverlayTap;
    private boolean dismissable;
    private boolean isSystemUILight;
    private ViewGroup modalView;
    private Function1<? super Boolean, Unit> onDismiss;
    private ViewGroup overlayHost;
    private float overlayOpacity;
    private View overlayView;

    public FragmentModalBottomSheet() {
        this.dismissable = true;
        this.dismissOnOverlayTap = true;
        this.overlayOpacity = -1.0f;
    }

    public final boolean getDismissAll() {
        return this.dismissAll;
    }

    public final void setDismissAll(boolean z) {
        this.dismissAll = z;
    }

    /* JADX WARN: 'this' call moved to the top of the method (can break code semantics) */
    public FragmentModalBottomSheet(ViewGroup modalView, boolean z, boolean z2, float f, boolean z3, Function1<? super Boolean, Unit> onDismiss) {
        this();
        Intrinsics.checkNotNullParameter(modalView, "modalView");
        Intrinsics.checkNotNullParameter(onDismiss, "onDismiss");
        this.modalView = modalView;
        this.dismissable = z;
        this.dismissOnOverlayTap = z2;
        this.overlayOpacity = f;
        this.isSystemUILight = z3;
        this.onDismiss = onDismiss;
    }

    public static final class Companion {
        public Companion(DefaultConstructorMarker defaultConstructorMarker) {
            this();
        }

        private Companion() {
        }

        public final WeakReference<Window> getPresentedWindow() {
            return FragmentModalBottomSheet.presentedWindow;
        }

        public final void setPresentedWindow(WeakReference<Window> weakReference) {
            FragmentModalBottomSheet.presentedWindow = weakReference;
        }
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        Intrinsics.checkNotNullParameter(inflater, "inflater");
        ViewGroup viewGroup = this.modalView;
        if (viewGroup == null) {
            dismissAllowingStateLoss();
            return null;
        }
        return viewGroup;
    }

    @Override
    public Dialog onCreateDialog(Bundle savedInstanceState) {
        Window window;
        setCancelable(this.dismissable);
        CustomBottomSheetDialog customBottomSheetDialog = new CustomBottomSheetDialog(requireContext(), R.style.AppBottomSheetDialog);
        customBottomSheetDialog.setSheetBackgroundColor(0);
        customBottomSheetDialog.dismissOnOverlayTap = this.dismissOnOverlayTap;
        if (this.overlayOpacity >= 0.0f && (window = customBottomSheetDialog.getWindow()) != null) {
            window.setDimAmount(this.overlayOpacity);
        }
        Window window2 = customBottomSheetDialog.getWindow();
        if (window2 != null) {
            presentedWindow = new WeakReference<>(window2);
            UtilsKt.setStatusBarStyle(window2, this.isSystemUILight);
            if (this.isSystemUILight) {
                UtilsKt.setSystemUIColor(window2, -1);
            } else {
                UtilsKt.setSystemUIColor(window2, -16777216);
            }
        }
        return customBottomSheetDialog;
    }

    @Override
    public void onStart() {
        super.onStart();
        attachOverlayView();
    }

    public final void setOverlayView(View view) {
        if (Intrinsics.areEqual(this.overlayView, view)) {
            return;
        }
        detachOverlayView();
        this.overlayView = view;
        attachOverlayView();
    }

    private final void attachOverlayView() {
        Window window;
        View view = this.overlayView;
        if (view == null) {
            return;
        }
        Dialog dialog = getDialog();
        View decorView = (dialog == null || (window = dialog.getWindow()) == null) ? null : window.getDecorView();
        ViewGroup viewGroup = decorView instanceof ViewGroup ? (ViewGroup) decorView : null;
        if (viewGroup == null) {
            return;
        }
        detachOverlayHost();
        ViewParent parent = view.getParent();
        ViewGroup viewGroup2 = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        SheetTreeLog.INSTANCE.log(view.getContext(), "dialog.attachOverlay", "overlay=" + SheetTreeLog.INSTANCE.tag(view) + " from=" + SheetTreeLog.INSTANCE.tag(viewGroup2) + " fromChildren=" + SheetTreeLog.INSTANCE.childTags(viewGroup2));
        if (viewGroup2 != null) {
            viewGroup2.removeView(view);
        }
        Context context = viewGroup.getContext();
        Intrinsics.checkNotNullExpressionValue(context, "getContext(...)");
        DialogPassThroughFrameLayout dialogPassThroughFrameLayout = new DialogPassThroughFrameLayout(context);
        dialogPassThroughFrameLayout.setLayoutParams(new ViewGroup.LayoutParams(-1, -1));
        dialogPassThroughFrameLayout.setClickable(false);
        dialogPassThroughFrameLayout.setFocusable(false);
        view.setLayoutParams(new FrameLayout.LayoutParams(-1, -1));
        dialogPassThroughFrameLayout.addView(view);
        viewGroup.addView(dialogPassThroughFrameLayout);
        dialogPassThroughFrameLayout.bringToFront();
        this.overlayHost = dialogPassThroughFrameLayout;
    }

    private final void detachOverlayHost() {
        ViewGroup viewGroup = this.overlayHost;
        ViewParent parent = viewGroup != null ? viewGroup.getParent() : null;
        ViewGroup viewGroup2 = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup2 != null) {
            viewGroup2.removeView(this.overlayHost);
        }
        this.overlayHost = null;
    }

    private final void detachOverlayView() {
        detachOverlayHost();
        View view = this.overlayView;
        ViewParent parent = view != null ? view.getParent() : null;
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(this.overlayView);
        }
    }

    public final void setNewNestedScrollView(View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        Dialog dialog = getDialog();
        Intrinsics.checkNotNull(dialog, "null cannot be cast to non-null type com.sheet2.CustomBottomSheetDialog");
        ((CustomBottomSheetDialog) dialog).setNewNestedScrollView(view);
    }

    public final void collapse() {
        Dialog dialog = getDialog();
        Intrinsics.checkNotNull(dialog, "null cannot be cast to non-null type com.sheet2.CustomBottomSheetDialog");
        ((CustomBottomSheetDialog) dialog).collapse();
    }

    public final void expand() {
        Dialog dialog = getDialog();
        Intrinsics.checkNotNull(dialog, "null cannot be cast to non-null type com.sheet2.CustomBottomSheetDialog");
        ((CustomBottomSheetDialog) dialog).expand();
    }

    @Override
    public void onDismiss(DialogInterface dialog) {
        Intrinsics.checkNotNullParameter(dialog, "dialog");
        super.onDismiss(dialog);
        detachOverlayView();
        this.overlayView = null;
        WeakReference<Window> weakReference = presentedWindow;
        if (weakReference != null) {
            weakReference.clear();
        }
        presentedWindow = null;
        Function1<? super Boolean, Unit> function1 = this.onDismiss;
        if (function1 != null) {
            function1.invoke(Boolean.valueOf(this.dismissAll));
        }
    }
}
