package com.sheet2;

import android.app.Activity;
import android.view.ViewGroup;
import android.view.Window;
import androidx.appcompat.app.AppCompatActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import java.util.Iterator;
import java.util.Map;
import kotlin.TuplesKt;
import kotlin.collections.MapsKt;
import kotlin.jvm.internal.Intrinsics;

public final class SheetModule extends NativeSheetSpec {
    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public SheetModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
    }

    @Override
    protected Map<String, Object> getTypedExportedConstants() {
        return getInitialWindowMetrics();
    }

    private final Map<String, Object> getInitialWindowMetrics() {
        Window window;
        Activity currentActivity = getReactApplicationContext().getCurrentActivity();
        ViewGroup viewGroup = (ViewGroup) ((currentActivity == null || (window = currentActivity.getWindow()) == null) ? null : window.getDecorView());
        if (viewGroup == null) {
            return MapsKt.emptyMap();
        }
        EdgeInsets safeAreaInsets = SafeAreaUtilsKt.getSafeAreaInsets(viewGroup);
        if (safeAreaInsets == null) {
            return MapsKt.emptyMap();
        }
        return MapsKt.mapOf(TuplesKt.to("insets", SafeAreaUtilsKt.edgeInsetsToJavaMap(safeAreaInsets)));
    }

    @Override
    public WritableMap viewportSize() {
        return Arguments.createMap();
    }

    @Override
    public WritableArray getTreeLog() {
        WritableArray writableArrayCreateArray = Arguments.createArray();
        Iterator<?> it = SheetTreeLog.INSTANCE.snapshot().iterator();
        while (it.hasNext()) {
            writableArrayCreateArray.pushString((String) it.next());
        }
        return writableArrayCreateArray;
    }

    @Override
    public void dismissAll() {
        getReactApplicationContext().runOnUiQueueThread(new Runnable() {
            @Override
            public final void run() {
                SheetModule.dismissAll$lambda$2(SheetModule.this);
            }
        });
    }

    static final void dismissAll$lambda$2(SheetModule sheetModule) {
        Activity currentActivity = sheetModule.getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            AppFittedSheet.INSTANCE.dismissAll((AppCompatActivity) currentActivity);
        }
    }

    @Override
    public void dismissPresented() {
        getReactApplicationContext().runOnUiQueueThread(new Runnable() {
            @Override
            public final void run() {
                SheetModule.dismissPresented$lambda$4(SheetModule.this);
            }
        });
    }

    static final void dismissPresented$lambda$4(SheetModule sheetModule) {
        Activity currentActivity = sheetModule.getReactApplicationContext().getCurrentActivity();
        if (currentActivity != null) {
            AppFittedSheet.INSTANCE.dismissPresented((AppCompatActivity) currentActivity);
        }
    }
}
