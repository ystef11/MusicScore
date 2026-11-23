package com.sheet2;

import android.app.Activity;
import android.content.Context;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewParent;
import android.view.ViewStructure;
import android.view.accessibility.AccessibilityEvent;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ReactPointerEventsView;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ViewProps;
import com.facebook.react.uimanager.events.EventDispatcher;
import java.util.ArrayList;
import java.util.List;
import kotlin.Lazy;
import kotlin.LazyKt;
import kotlin.Result;
import kotlin.ResultKt;
import kotlin.Unit;
import kotlin.collections.CollectionsKt;
import kotlin.jvm.functions.Function0;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.internal.DefaultConstructorMarker;
import kotlin.jvm.internal.Intrinsics;

public class AppFittedSheet extends ViewGroup implements LifecycleEventListener, ReactPointerEventsView {

    public static final Companion INSTANCE = new Companion(null);
    private int _backgroundColor;
    private String centerAnimation;
    private CenteredSheetDialog centeredDialog;
    private float collapsedHeight;
    private View dialogOverlayView;
    private boolean dismissOnOverlayTap;
    private boolean dismissable;
    private StateWrapper fabricStateWrapper;

    private final Lazy footerPresenter;
    private final String fragmentTag;
    private View inlineOverlayView;

    private final Lazy inlinePresenter;
    private boolean isSystemUILight;
    private DialogRootViewGroup mHostView;
    private float maxWidth;
    private float overlayOpacity;
    private final PointerEvents pointerEvents;
    private String presentationStyle;
    private boolean stacked;
    private float topLeftRightCornerRadius;
    private boolean useInlinePresentation;

    @Override
    public void addChildrenForAccessibility(ArrayList<View> outChildren) {
    }

    @Override
    public boolean dispatchPopulateAccessibilityEvent(AccessibilityEvent event) {
        return false;
    }

    @Override
    public void onHostPause() {
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
    }

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public AppFittedSheet(Context context) {
        super(context);
        Intrinsics.checkNotNullParameter(context, "context");
        this.pointerEvents = PointerEvents.NONE;
        this.stacked = true;
        this.fragmentTag = "CCBottomSheet-" + System.currentTimeMillis();
        this.mHostView = new DialogRootViewGroup(context);
        this.dismissable = true;
        this.dismissOnOverlayTap = true;
        this.overlayOpacity = -1.0f;
        this.presentationStyle = "bottom";
        this.centerAnimation = "fade";
        this.inlinePresenter = LazyKt.lazy(new Function0() {
            @Override
            public final Object invoke() {
                return AppFittedSheet.inlinePresenter_delegate$lambda$3(AppFittedSheet.this);
            }
        });
        this.footerPresenter = LazyKt.lazy(new Function0() {
            @Override
            public final Object invoke() {
                return AppFittedSheet.footerPresenter_delegate$lambda$4(AppFittedSheet.this);
            }
        });
        this.mHostView.setOnSheetLayoutChanged(new Function0() {
            @Override
            public final Object invoke() {
                return AppFittedSheet._init_$lambda$5(AppFittedSheet.this);
            }
        });
    }

    @Override
    public PointerEvents getPointerEvents() {
        return this.pointerEvents;
    }

    public final DialogRootViewGroup getMHostView() {
        return this.mHostView;
    }

    public final void setMHostView(DialogRootViewGroup dialogRootViewGroup) {
        Intrinsics.checkNotNullParameter(dialogRootViewGroup, "<set-?>");
        this.mHostView = dialogRootViewGroup;
    }

    public final boolean getDismissable() {
        return this.dismissable;
    }

    public final void setDismissable(boolean z) {
        this.dismissable = z;
        getInlinePresenter().setDismissable(z);
    }

    public final boolean getDismissOnOverlayTap() {
        return this.dismissOnOverlayTap;
    }

    public final void setDismissOnOverlayTap(boolean z) {
        this.dismissOnOverlayTap = z;
    }

    public final float getOverlayOpacity() {
        return this.overlayOpacity;
    }

    public final void setOverlayOpacity(float f) {
        this.overlayOpacity = f;
    }

    public final float getCollapsedHeight() {
        return this.collapsedHeight;
    }

    public final void setCollapsedHeight(float f) {
        this.collapsedHeight = f;
    }

    public final float getTopLeftRightCornerRadius() {
        return this.topLeftRightCornerRadius;
    }

    public final void setTopLeftRightCornerRadius(float f) {
        this.topLeftRightCornerRadius = f;
    }

    public final int get_backgroundColor() {
        return this._backgroundColor;
    }

    public final void set_backgroundColor(int i) {
        this._backgroundColor = i;
    }

    public final boolean getIsSystemUILight() {
        return this.isSystemUILight;
    }

    public final void setSystemUILight(boolean z) {
        this.isSystemUILight = z;
    }

    public final boolean getUseInlinePresentation() {
        return this.useInlinePresentation;
    }

    public final void setUseInlinePresentation(boolean z) {
        this.useInlinePresentation = z;
        this.mHostView.setInlineMode(z);
    }

    public final String getPresentationStyle() {
        return this.presentationStyle;
    }

    public final void setPresentationStyle(String value) {
        Intrinsics.checkNotNullParameter(value, "value");
        this.presentationStyle = value;
        this.mHostView.setCenteredPresentation(Intrinsics.areEqual(value, "center"));
    }

    public final String getCenterAnimation() {
        return this.centerAnimation;
    }

    public final void setCenterAnimation(String str) {
        Intrinsics.checkNotNullParameter(str, "<set-?>");
        this.centerAnimation = str;
    }

    public final StateWrapper getFabricStateWrapper() {
        return this.fabricStateWrapper;
    }

    public final void setFabricStateWrapper$react_native_sheet2_release(StateWrapper stateWrapper) {
        this.fabricStateWrapper = stateWrapper;
    }

    public final void pushContentOriginOffset$react_native_sheet2_release() {
        float fPxToDp;
        float fPxToDp2;
        StateWrapper stateWrapper = this.fabricStateWrapper;
        if (stateWrapper != null && isAttachedToWindow()) {
            int[] iArr = new int[2];
            getLocationInWindow(iArr);
            if (this.useInlinePresentation) {
                int[] iArr2 = new int[2];
                this.mHostView.getLocationInWindow(iArr2);
                fPxToDp = PixelUtil.INSTANCE.pxToDp(iArr2[0] - iArr[0]);
                fPxToDp2 = PixelUtil.INSTANCE.pxToDp(iArr2[1] - iArr[1]);
            } else {
                fPxToDp = PixelUtil.INSTANCE.pxToDp(-iArr[0]);
                fPxToDp2 = PixelUtil.INSTANCE.pxToDp(-iArr[1]);
            }
            WritableMap writableMapCreateMap = Arguments.createMap();
            writableMapCreateMap.putDouble("contentOriginOffsetX", fPxToDp);
            writableMapCreateMap.putDouble("contentOriginOffsetY", fPxToDp2);
            try {
                AppFittedSheet appFittedSheet = this;
                stateWrapper.updateState(writableMapCreateMap);
            } catch (Throwable th) {
            }
        }
    }

    private final InlineSheetPresenter getInlinePresenter() {
        return (InlineSheetPresenter) this.inlinePresenter.getValue();
    }

    static final InlineSheetPresenter inlinePresenter_delegate$lambda$3(AppFittedSheet appFittedSheet) {
        return new InlineSheetPresenter(appFittedSheet, appFittedSheet.mHostView);
    }

    private final InlineFooterPresenter getFooterPresenter() {
        return (InlineFooterPresenter) this.footerPresenter.getValue();
    }

    static final InlineFooterPresenter footerPresenter_delegate$lambda$4(AppFittedSheet appFittedSheet) {
        return new InlineFooterPresenter(appFittedSheet, appFittedSheet.mHostView);
    }

    static final Unit _init_$lambda$5(AppFittedSheet appFittedSheet) {
        appFittedSheet.pushContentOriginOffset$react_native_sheet2_release();
        return Unit.INSTANCE;
    }

    public final float getMaxWidth() {
        return this.maxWidth;
    }

    public final void setMaxWidth(float f) {
        this.maxWidth = f;
        this.mHostView.setSheetMaxWidthSize(f);
        if (getSheet() == null) {
            return;
        }
        DialogRootViewGroup dialogRootViewGroup = this.mHostView;
        dialogRootViewGroup.updateMaxWidth(dialogRootViewGroup.getSheetMaxWidthSize());
    }

    public final EventDispatcher getEventDispatcher() {
        return this.mHostView.getEventDispatcher();
    }

    public final void setEventDispatcher(EventDispatcher eventDispatcher) {
        this.mHostView.setEventDispatcher$react_native_sheet2_release(eventDispatcher);
    }

    private final AppCompatActivity getCurrentActivity() {
        Context context = getContext();
        ReactContext reactContext = context instanceof ReactContext ? (ReactContext) context : null;
        Activity currentActivity = reactContext != null ? reactContext.getCurrentActivity() : null;
        if (currentActivity instanceof AppCompatActivity) {
            return (AppCompatActivity) currentActivity;
        }
        return null;
    }

    private final FragmentModalBottomSheet findSheet(String name) {
        FragmentManager supportFragmentManager;
        AppCompatActivity currentActivity = getCurrentActivity();
        Fragment fragmentFindFragmentByTag = (currentActivity == null || (supportFragmentManager = currentActivity.getSupportFragmentManager()) == null) ? null : supportFragmentManager.findFragmentByTag(name);
        if (fragmentFindFragmentByTag instanceof FragmentModalBottomSheet) {
            return (FragmentModalBottomSheet) fragmentFindFragmentByTag;
        }
        return null;
    }

    private final FragmentModalBottomSheet getSheet() {
        return findSheet(this.fragmentTag);
    }

    @Override
    public void setId(int id) {
        super.setId(id);
        boolean z = this.useInlinePresentation;
        DialogRootViewGroup dialogRootViewGroup = this.mHostView;
        if (!z) {
            dialogRootViewGroup.setId(id);
        } else {
            dialogRootViewGroup.setId(-1);
        }
    }

    public final void showOrUpdate() {
        FragmentManager supportFragmentManager;
        String str;
        FragmentModalBottomSheet fragmentModalBottomSheetFindSheet;
        UiThreadUtil.assertOnUiThread();
        this.mHostView.setCornerRadius(this.topLeftRightCornerRadius);
        this.mHostView.setBackgroundColor(this._backgroundColor);
        if (Intrinsics.areEqual(this.presentationStyle, "center")) {
            CenteredSheetDialog centeredSheetDialog = this.centeredDialog;
            if (centeredSheetDialog == null || centeredSheetDialog == null || !centeredSheetDialog.isShowing()) {
                ViewParent parent = this.mHostView.getParent();
                ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
                if (viewGroup != null) {
                    viewGroup.removeView(this.mHostView);
                }
                AppCompatActivity currentActivity = getCurrentActivity();
                Context context = currentActivity != null ? currentActivity : getContext();
                Intrinsics.checkNotNull(context);
                CenteredSheetDialog centeredSheetDialog2 = new CenteredSheetDialog(context, this.mHostView, this.dismissable, Intrinsics.areEqual(this.centerAnimation, "slide"), new Function0() {
                    @Override
                    public final Object invoke() {
                        return AppFittedSheet.showOrUpdate$lambda$6(AppFittedSheet.this);
                    }
                });
                this.centeredDialog = centeredSheetDialog2;
                centeredSheetDialog2.show();
                post(new Runnable() {
                    @Override
                    public final void run() {
                        AppFittedSheet.this.pushContentOriginOffset$react_native_sheet2_release();
                    }
                });
                return;
            }
            return;
        }
        if (Intrinsics.areEqual(this.presentationStyle, "footer")) {
            getFooterPresenter().show();
            return;
        }
        if (this.useInlinePresentation) {
            if (getInlinePresenter().isShown()) {
                return;
            }
            getInlinePresenter().show(this.dismissable, this.dismissOnOverlayTap, this.overlayOpacity, (int) this.collapsedHeight, new Function0() {
                @Override
                public final Object invoke() {
                    return AppFittedSheet.showOrUpdate$lambda$8(AppFittedSheet.this);
                }
            });
            return;
        }
        if (getSheet() == null) {
            if (this.stacked && (str = (String) CollectionsKt.lastOrNull(AppFittedSheetKt.presentedSheets)) != null && (fragmentModalBottomSheetFindSheet = findSheet(str)) != null) {
                fragmentModalBottomSheetFindSheet.collapse();
            }
            FragmentModalBottomSheet fragmentModalBottomSheet = new FragmentModalBottomSheet(this.mHostView, this.dismissable, this.dismissOnOverlayTap, this.overlayOpacity, this.isSystemUILight, new Function1() {
                @Override
                public final Object invoke(Object obj) {
                    return AppFittedSheet.showOrUpdate$lambda$12(AppFittedSheet.this, ((Boolean) obj).booleanValue());
                }
            });
            AppCompatActivity currentActivity2 = getCurrentActivity();
            if (currentActivity2 == null || (supportFragmentManager = currentActivity2.getSupportFragmentManager()) == null) {
                return;
            }
            AppFittedSheetKt.safeShow(fragmentModalBottomSheet, supportFragmentManager, this.fragmentTag);
            fragmentModalBottomSheet.setOverlayView(this.dialogOverlayView);
            if (this.stacked) {
                if (AppFittedSheetKt.presentedSheets.contains(this.fragmentTag)) {
                    return;
                } else {
                    AppFittedSheetKt.presentedSheets.add(this.fragmentTag);
                }
            }
            post(new Runnable() {
                @Override
                public final void run() {
                    AppFittedSheet.this.pushContentOriginOffset$react_native_sheet2_release();
                }
            });
            return;
        }
        post(new Runnable() {
            @Override
            public final void run() {
                AppFittedSheet.this.pushContentOriginOffset$react_native_sheet2_release();
            }
        });
    }

    static final Unit showOrUpdate$lambda$6(AppFittedSheet appFittedSheet) {
        ViewParent parent = appFittedSheet.mHostView.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        if (viewGroup != null) {
            viewGroup.removeView(appFittedSheet.mHostView);
        }
        appFittedSheet.centeredDialog = null;
        AppFittedSheetKt.onSheetDismiss(appFittedSheet);
        return Unit.INSTANCE;
    }

    static final Unit showOrUpdate$lambda$8(AppFittedSheet appFittedSheet) {
        AppFittedSheetKt.onSheetDismiss(appFittedSheet);
        return Unit.INSTANCE;
    }

    static final Unit showOrUpdate$lambda$12(AppFittedSheet appFittedSheet, boolean z) {
        FragmentModalBottomSheet fragmentModalBottomSheetFindSheet;
        FragmentModalBottomSheet fragmentModalBottomSheetFindSheet2;
        ViewParent parent = appFittedSheet.mHostView.getParent();
        ViewGroup viewGroup = parent instanceof ViewGroup ? (ViewGroup) parent : null;
        SheetTreeLog.INSTANCE.log(appFittedSheet.getContext(), "sheet.detachHost", "host=" + SheetTreeLog.INSTANCE.tag(appFittedSheet.mHostView) + " parent=" + SheetTreeLog.INSTANCE.tag(viewGroup) + " parentChildren=" + SheetTreeLog.INSTANCE.childTags(viewGroup));
        if (viewGroup != null) {
            viewGroup.removeViewAt(0);
        }
        AppFittedSheetKt.onSheetDismiss(appFittedSheet);
        if (z) {
            if (appFittedSheet.stacked) {
                String str = (String) CollectionsKt.removeLastOrNull(AppFittedSheetKt.presentedSheets);
                if (Intrinsics.areEqual(str, appFittedSheet.fragmentTag)) {
                    str = (String) CollectionsKt.lastOrNull(AppFittedSheetKt.presentedSheets);
                }
                if (str != null && (fragmentModalBottomSheetFindSheet2 = appFittedSheet.findSheet(str)) != null) {
                    fragmentModalBottomSheetFindSheet2.setDismissAll(true);
                    fragmentModalBottomSheetFindSheet2.dismissAllowingStateLoss();
                }
            }
            return Unit.INSTANCE;
        }
        if (appFittedSheet.stacked) {
            String str2 = (String) CollectionsKt.removeLastOrNull(AppFittedSheetKt.presentedSheets);
            if (Intrinsics.areEqual(str2, appFittedSheet.fragmentTag)) {
                str2 = (String) CollectionsKt.lastOrNull(AppFittedSheetKt.presentedSheets);
            }
            if (str2 != null && (fragmentModalBottomSheetFindSheet = appFittedSheet.findSheet(str2)) != null) {
                fragmentModalBottomSheetFindSheet.expand();
            }
        }
        return Unit.INSTANCE;
    }

    public final void setNewNestedScrollView(View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        FragmentModalBottomSheet sheet = getSheet();
        if (sheet != null) {
            sheet.setNewNestedScrollView(view);
        }
    }

    @Override
    public void dispatchProvideStructure(ViewStructure structure) {
        Intrinsics.checkNotNullParameter(structure, "structure");
        this.mHostView.dispatchProvideStructure(structure);
    }

    @Override
    public void addView(View child, int index) {
        Intrinsics.checkNotNullParameter(child, "child");
        UiThreadUtil.assertOnUiThread();
        SheetTreeLog.INSTANCE.log(getContext(), "sheet.addView", "child=" + SheetTreeLog.INSTANCE.tag(child) + " index=" + index + " self=" + SheetTreeLog.INSTANCE.tag(this) + " hostChildren=" + SheetTreeLog.INSTANCE.childTags(this.mHostView) + " inline=" + this.useInlinePresentation);
        boolean z = this.useInlinePresentation;
        if (z && index > 0) {
            this.inlineOverlayView = child;
            getInlinePresenter().setOverlayView(child);
        } else {
            if (!z && index > 0) {
                this.dialogOverlayView = child;
                FragmentModalBottomSheet sheet = getSheet();
                if (sheet != null) {
                    sheet.setOverlayView(child);
                    return;
                }
                return;
            }
            this.mHostView.addView(child, index);
        }
    }

    @Override
    public int getChildCount() {
        if (this.useInlinePresentation) {
            return 0;
        }
        return reactChildCount$react_native_sheet2_release();
    }

    @Override
    public View getChildAt(int index) {
        if (this.useInlinePresentation) {
            return null;
        }
        return reactChildAt$react_native_sheet2_release(index);
    }

    public final int reactChildCount$react_native_sheet2_release() {
        return this.mHostView.getChildCount() + (this.inlineOverlayView != null ? 1 : 0) + (this.dialogOverlayView == null ? 0 : 1);
    }

    public final View reactChildAt$react_native_sheet2_release(int index) {
        int childCount = this.mHostView.getChildCount();
        DialogRootViewGroup dialogRootViewGroup = this.mHostView;
        if (index < childCount) {
            return dialogRootViewGroup.getChildAt(index);
        }
        int childCount2 = index - dialogRootViewGroup.getChildCount();
        View view = this.inlineOverlayView;
        return (view == null || childCount2 != 0) ? this.dialogOverlayView : view;
    }

    @Override
    public void removeView(View child) {
        Intrinsics.checkNotNullParameter(child, "child");
        UiThreadUtil.assertOnUiThread();
        SheetTreeLog.INSTANCE.log(getContext(), "sheet.removeView", "child=" + SheetTreeLog.INSTANCE.tag(child) + " self=" + SheetTreeLog.INSTANCE.tag(this) + " hostChildren=" + SheetTreeLog.INSTANCE.childTags(this.mHostView));
        if (Intrinsics.areEqual(child, this.inlineOverlayView)) {
            this.inlineOverlayView = null;
            getInlinePresenter().setOverlayView(null);
        } else {
            if (Intrinsics.areEqual(child, this.dialogOverlayView)) {
                this.dialogOverlayView = null;
                FragmentModalBottomSheet sheet = getSheet();
                if (sheet != null) {
                    sheet.setOverlayView(null);
                    return;
                }
                return;
            }
            dismiss();
        }
    }

    @Override
    public void removeViewAt(int index) {
        UiThreadUtil.assertOnUiThread();
        SheetTreeLog.INSTANCE.log(getContext(), "sheet.removeViewAt", "index=" + index + " self=" + SheetTreeLog.INSTANCE.tag(this) + " hostChildren=" + SheetTreeLog.INSTANCE.childTags(this.mHostView));
        if (this.useInlinePresentation && index >= this.mHostView.getChildCount() && this.inlineOverlayView != null) {
            this.inlineOverlayView = null;
            getInlinePresenter().setOverlayView(null);
        } else {
            if (!this.useInlinePresentation && index >= this.mHostView.getChildCount() && this.dialogOverlayView != null) {
                this.dialogOverlayView = null;
                FragmentModalBottomSheet sheet = getSheet();
                if (sheet != null) {
                    sheet.setOverlayView(null);
                    return;
                }
                return;
            }
            dismiss();
        }
    }

    public final void onDropInstance$react_native_sheet2_release() {
        Context context = getContext();
        Intrinsics.checkNotNull(context, "null cannot be cast to non-null type com.facebook.react.bridge.ReactContext");
        ((ReactContext) context).removeLifecycleEventListener(this);
        dismiss();
    }

    public final void dismiss() {
        UiThreadUtil.assertOnUiThread();
        CenteredSheetDialog centeredSheetDialog = this.centeredDialog;
        if (centeredSheetDialog != null) {
            if (centeredSheetDialog != null) {
                centeredSheetDialog.dismiss();
            }
            this.centeredDialog = null;
        } else if (Intrinsics.areEqual(this.presentationStyle, "footer")) {
            getFooterPresenter().dismiss();
            AppFittedSheetKt.onSheetDismiss(this);
        } else {
            if (this.useInlinePresentation) {
                InlineSheetPresenter.dismiss$default(getInlinePresenter(), false, false, 3, null);
                return;
            }
            FragmentModalBottomSheet sheet = getSheet();
            if (sheet != null) {
                sheet.dismissAllowingStateLoss();
            }
        }
    }

    @Override
    public void onHostResume() {
        showOrUpdate();
    }

    @Override
    public void onHostDestroy() {
        onDropInstance$react_native_sheet2_release();
    }

    public static final class Companion {
        public Companion(DefaultConstructorMarker defaultConstructorMarker) {
            this();
        }

        private Companion() {
        }

        public final void dismissAll(AppCompatActivity activity) {
            Intrinsics.checkNotNullParameter(activity, "activity");
            List<Fragment> fragments = activity.getSupportFragmentManager().getFragments();
            Intrinsics.checkNotNullExpressionValue(fragments, "getFragments(...)");
            Fragment fragment = (Fragment) CollectionsKt.lastOrNull((List) fragments);
            if (fragment instanceof FragmentModalBottomSheet) {
                FragmentModalBottomSheet fragmentModalBottomSheet = (FragmentModalBottomSheet) fragment;
                fragmentModalBottomSheet.setDismissAll(true);
                fragmentModalBottomSheet.dismissAllowingStateLoss();
            }
        }

        public final void dismissPresented(AppCompatActivity activity) {
            Intrinsics.checkNotNullParameter(activity, "activity");
            List<Fragment> fragments = activity.getSupportFragmentManager().getFragments();
            Intrinsics.checkNotNullExpressionValue(fragments, "getFragments(...)");
            Fragment fragment = (Fragment) CollectionsKt.lastOrNull((List) fragments);
            if (fragment instanceof FragmentModalBottomSheet) {
                ((FragmentModalBottomSheet) fragment).dismissAllowingStateLoss();
            }
        }
    }
}
