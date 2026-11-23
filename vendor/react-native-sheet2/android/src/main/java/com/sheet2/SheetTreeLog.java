package com.sheet2;

import android.content.Context;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import java.util.List;
import kotlin.Unit;
import kotlin.collections.ArrayDeque;
import kotlin.collections.CollectionsKt;
import kotlin.jvm.functions.Function1;
import kotlin.jvm.internal.Intrinsics;
import kotlin.ranges.RangesKt;

public final class SheetTreeLog {
    private static final int CAPACITY = 32;
    private static final String EVENT = "sheet2:tree";
    private static final String TAG = "Sheet2Tree";
    public static final SheetTreeLog INSTANCE = new SheetTreeLog();
    private static final ArrayDeque<String> entries = new ArrayDeque<>();

    private SheetTreeLog() {
    }

    public final void log(Context context, String op, String details) {
        Intrinsics.checkNotNullParameter(op, "op");
        Intrinsics.checkNotNullParameter(details, "details");
        String str = op + " " + details;
        ArrayDeque<String> arrayDeque = entries;
        synchronized (arrayDeque) {
            if (arrayDeque.size() == 32) {
                arrayDeque.removeFirst();
            }
            arrayDeque.addLast(str);
            Unit unit = Unit.INSTANCE;
        }
        Log.d(TAG, str);
        emit(context, str);
    }

    public final String tag(View view) {
        String strValueOf;
        return (view == null || (strValueOf = String.valueOf(view.getId())) == null) ? "-" : strValueOf;
    }

    public final String childTags(final ViewGroup parent) {
        if (parent == null) {
            return "-";
        }
        int childCount = parent.getChildCount();
        if (childCount == 0) {
            return "none";
        }
        return CollectionsKt.joinToString(RangesKt.until(0, childCount), ",", "", "", -1, "...", new Function1() {
            @Override
            public final Object invoke(Object obj) {
                return String.valueOf(parent.getChildAt(((Integer) obj).intValue()).getId());
            }
        });
    }

    public final List<String> snapshot() {
        List<String> list;
        ArrayDeque<String> arrayDeque = entries;
        synchronized (arrayDeque) {
            list = CollectionsKt.toList(arrayDeque);
        }
        return list;
    }

    private final void emit(Context context, String entry) {
        ReactContext reactContext = context instanceof ReactContext ? (ReactContext) context : null;
        if (reactContext != null && reactContext.hasActiveReactInstance()) {
            try {
                ((DeviceEventManagerModule.RCTDeviceEventEmitter) reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)).emit(EVENT, entry);
            } catch (Throwable th) {
                Log.d(TAG, "emit failed: " + th.getMessage());
            }
        }
    }
}
