package com.sheet2;

import android.content.Context;
import android.view.MotionEvent;
import android.view.View;
import android.view.accessibility.AccessibilityNodeInfo;

import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.config.ReactFeatureFlags;
import com.facebook.react.uimanager.JSPointerDispatcher;
import com.facebook.react.uimanager.JSTouchDispatcher;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.RootView;
import com.facebook.react.uimanager.StateWrapper;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.views.view.ReactViewGroup;
import kotlin.Deprecated;
import kotlin.ReplaceWith;
import kotlin.jvm.internal.Intrinsics;

public class BaseRNView extends ReactViewGroup implements RootView {
    private EventDispatcher eventDispatcher;
    private boolean inlineMode;
    private JSPointerDispatcher jSPointerDispatcher;
    private final JSTouchDispatcher jSTouchDispatcher;
    private StateWrapper stateWrapper;
    private int viewHeight;
    private int viewWidth;

    public BaseRNView(Context context) {
        super(context);
        BaseRNView baseRNView = this;
        this.jSTouchDispatcher = new JSTouchDispatcher(baseRNView);
        if (ReactFeatureFlags.dispatchPointerEvents) {
            this.jSPointerDispatcher = new JSPointerDispatcher(baseRNView);
        }
    }

    @Override
    @Deprecated(message = "Use onChildStartedNativeGesture with a childView parameter.", replaceWith = @ReplaceWith(expression = "onChildStartedNativeGesture", imports = {}))
    public void onChildStartedNativeGesture(MotionEvent motionEvent) {
        onChildStartedNativeGesture(null, motionEvent);
    }

    public final StateWrapper getStateWrapper() {
        return this.stateWrapper;
    }

    public final void setStateWrapper$react_native_sheet2_release(StateWrapper stateWrapper) {
        this.stateWrapper = stateWrapper;
    }

    public final EventDispatcher getEventDispatcher() {
        return this.eventDispatcher;
    }

    public final void setEventDispatcher$react_native_sheet2_release(EventDispatcher eventDispatcher) {
        this.eventDispatcher = eventDispatcher;
    }

    public final boolean getInlineMode() {
        return this.inlineMode;
    }

    public final void setInlineMode(boolean z) {
        this.inlineMode = z;
    }

    private final ThemedReactContext getReactContext() {
        Context context = getContext();
        Intrinsics.checkNotNull(context, "null cannot be cast to non-null type com.facebook.react.uimanager.ThemedReactContext");
        return (ThemedReactContext) context;
    }

    @Override
    public void onInitializeAccessibilityNodeInfo(AccessibilityNodeInfo info) {
        Intrinsics.checkNotNullParameter(info, "info");
        super.onInitializeAccessibilityNodeInfo(info);
    }

    @Override
    protected void onSizeChanged(int w, int h, int oldw, int oldh) {
        super.onSizeChanged(w, h, oldw, oldh);
        this.viewWidth = w;
        this.viewHeight = h;
        updateState(w, h);
    }

    public final void updateState(int width, int height) {
        StateWrapper stateWrapper = this.stateWrapper;
        if (stateWrapper == null) {
            return;
        }
        float fPxToDp = PixelUtil.INSTANCE.pxToDp(width);
        float fPxToDp2 = PixelUtil.INSTANCE.pxToDp(height);
        WritableNativeMap writableNativeMap = new WritableNativeMap();
        writableNativeMap.putDouble("screenWidth", fPxToDp);
        writableNativeMap.putDouble("screenHeight", fPxToDp2);
        stateWrapper.updateState(writableNativeMap);
    }

    @Override
    public void handleException(Throwable t) {
        Intrinsics.checkNotNullParameter(t, "t");
        getReactContext().getReactApplicationContext().handleException(new RuntimeException(t));
    }

    @Override
    public boolean onInterceptTouchEvent(MotionEvent event) {
        Intrinsics.checkNotNullParameter(event, "event");
        if (!this.inlineMode) {
            dispatchTouchEventToJs(event, true);
        }
        return super.onInterceptTouchEvent(event);
    }

    @Override
    public boolean onTouchEvent(MotionEvent event) {
        Intrinsics.checkNotNullParameter(event, "event");
        if (this.inlineMode) {
            return super.onTouchEvent(event);
        }
        dispatchTouchEventToJs(event, false);
        super.onTouchEvent(event);
        return true;
    }

    @Override
    public void onChildStartedNativeGesture(View childView, MotionEvent ev) {
        EventDispatcher eventDispatcher;
        Intrinsics.checkNotNullParameter(ev, "ev");
        if (this.inlineMode || (eventDispatcher = this.eventDispatcher) == null) {
            return;
        }
        this.jSTouchDispatcher.onChildStartedNativeGesture(ev, eventDispatcher);
        JSPointerDispatcher jSPointerDispatcher = this.jSPointerDispatcher;
        if (jSPointerDispatcher != null) {
            jSPointerDispatcher.onChildStartedNativeGesture(childView, ev, eventDispatcher);
        }
    }

    @Override
    public void onChildEndedNativeGesture(View childView, MotionEvent ev) {
        Intrinsics.checkNotNullParameter(childView, "childView");
        Intrinsics.checkNotNullParameter(ev, "ev");
        if (this.inlineMode) {
            return;
        }
        EventDispatcher eventDispatcher = this.eventDispatcher;
        if (eventDispatcher != null) {
            this.jSTouchDispatcher.onChildEndedNativeGesture(ev, eventDispatcher);
        }
        JSPointerDispatcher jSPointerDispatcher = this.jSPointerDispatcher;
        if (jSPointerDispatcher != null) {
            jSPointerDispatcher.onChildEndedNativeGesture();
        }
    }

    @Override
    public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
        if (this.inlineMode) {
            super.requestDisallowInterceptTouchEvent(disallowIntercept);
        }
    }

    private final void dispatchTouchEventToJs(MotionEvent event, boolean isCapture) {
        EventDispatcher eventDispatcher = this.eventDispatcher;
        if (eventDispatcher != null) {
            this.jSTouchDispatcher.handleTouchEvent(event, eventDispatcher, getReactContext());
            JSPointerDispatcher jSPointerDispatcher = this.jSPointerDispatcher;
            if (jSPointerDispatcher != null) {
                jSPointerDispatcher.handleMotionEvent(event, eventDispatcher, isCapture);
            }
        }
    }
}
