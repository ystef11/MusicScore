package com.sheet2;

import android.view.View;
import com.behavior.BottomSheetBehavior;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.ReactStylesDiffMap;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.ViewManagerDelegate;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.viewmanagers.SheetViewManagerDelegate;
import com.facebook.react.viewmanagers.SheetViewManagerInterface;
import kotlin.jvm.internal.Intrinsics;

@ReactModule(name = Sheet2ViewManager.NAME)
public final class Sheet2ViewManager extends ViewGroupManager<Sheet2View> implements SheetViewManagerInterface<Sheet2View> {
    public static final String NAME = "SheetView";
    private final ViewManagerDelegate<Sheet2View> mDelegate;

    @Override
    public void setUniqueId(Sheet2View view, String value) {
        Intrinsics.checkNotNullParameter(view, "view");
    }

    @Override
    public void setWindowLevel(Sheet2View view, String value) {
        Intrinsics.checkNotNullParameter(view, "view");
    }

    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public Sheet2ViewManager(ReactApplicationContext reactContext) {
        super(reactContext);
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
        this.mDelegate = new SheetViewManagerDelegate(this);
    }

    @Override
    protected ViewManagerDelegate<Sheet2View> getDelegate() {
        return this.mDelegate;
    }

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    public Sheet2View createViewInstance(ThemedReactContext context) {
        Intrinsics.checkNotNullParameter(context, "context");
        return new Sheet2View(context);
    }

    @Override
    public void dismissSheet(Sheet2View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) "==========dismissSheet");
        view.dismiss();
    }

    @Override
    public void setDismissable(Sheet2View view, boolean value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setDismissable " + value));
        view.setDismissable(value);
    }

    @Override
    public void setMaxWidth(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setMaxWidth " + value));
        view.setMaxWidth(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public void setMaxHeight(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setMaxHeight " + value));
        view.getMHostView().setSheetMaxHeightSize(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public void setMinHeight(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setMinHeight " + value));
        view.getMHostView().setSheetMinHeightSize(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public void setTopLeftRightCornerRadius(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setTopLeftRightCornerRadius " + value));
        view.setTopLeftRightCornerRadius(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public void setIsSystemUILight(Sheet2View view, boolean value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setIsSystemUILight " + value));
        view.setSystemUILight(value);
    }

    @Override
    public void setPassScrollViewReactTag(Sheet2View view, String value) {
        View viewFindView;
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setPassScrollViewReactTag " + value));
        if (value == null || (viewFindView = BottomSheetBehavior.findView(view.getMHostView())) == null) {
            return;
        }
        view.setNewNestedScrollView(viewFindView);
    }

    @Override
    public void setSheetBackgroundColor(Sheet2View view, Integer value) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.set_backgroundColor(value != null ? value.intValue() : 0);
    }

    @Override
    public void setUseInlinePresentation(Sheet2View view, boolean value) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.setUseInlinePresentation(value);
    }

    @Override
    public void setPresentationStyle(Sheet2View view, String value) {
        Intrinsics.checkNotNullParameter(view, "view");
        if (value == null) {
            value = "bottom";
        }
        view.setPresentationStyle(value);
    }

    @Override
    public void setCenterAnimation(Sheet2View view, String value) {
        Intrinsics.checkNotNullParameter(view, "view");
        if (value == null) {
            value = "fade";
        }
        view.setCenterAnimation(value);
    }

    @Override
    public void setDismissOnOverlayTap(Sheet2View view, boolean value) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.setDismissOnOverlayTap(value);
    }

    @Override
    public void setOverlayOpacity(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.setOverlayOpacity((float) value);
    }

    @Override
    public void setCollapsedHeight(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.setCollapsedHeight(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public void setCalculatedHeight(Sheet2View view, double value) {
        Intrinsics.checkNotNullParameter(view, "view");
        System.out.println((Object) ("==========setCalculatedHeight " + value));
        view.getMHostView().setVirtualHeight(PixelUtil.INSTANCE.dpToPx(value));
    }

    @Override
    public int getChildCount(Sheet2View parent) {
        Intrinsics.checkNotNullParameter(parent, "parent");
        return parent.reactChildCount$react_native_sheet2_release();
    }

    @Override
    public View getChildAt(Sheet2View parent, int index) {
        Intrinsics.checkNotNullParameter(parent, "parent");
        return parent.reactChildAt$react_native_sheet2_release(index);
    }

    @Override
    public void onDropViewInstance(Sheet2View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        super.onDropViewInstance(view);
        view.onDropInstance$react_native_sheet2_release();
    }

    @Override
    public void onAfterUpdateTransaction(Sheet2View view) {
        Intrinsics.checkNotNullParameter(view, "view");
        super.onAfterUpdateTransaction(view);
        System.out.println((Object) "==========onAfterUpdateTransaction");
        view.showOrUpdate();
    }

    @Override
    public Object updateState(Sheet2View view, ReactStylesDiffMap props, StateWrapper stateWrapper) {
        Intrinsics.checkNotNullParameter(view, "view");
        view.setFabricStateWrapper$react_native_sheet2_release(stateWrapper);
        return super.updateState(view, props, stateWrapper);
    }

    @Override
    public void addEventEmitters(ThemedReactContext reactContext, Sheet2View view) {
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
        Intrinsics.checkNotNullParameter(view, "view");
        EventDispatcher eventDispatcherForReactTag = UIManagerHelper.getEventDispatcherForReactTag(reactContext, view.getId());
        if (eventDispatcherForReactTag != null) {
            view.setEventDispatcher(eventDispatcherForReactTag);
        }
    }
}
