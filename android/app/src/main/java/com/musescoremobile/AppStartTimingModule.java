package com.musescoremobile;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import java.util.Map;
import kotlin.TuplesKt;
import kotlin.collections.MapsKt;
import kotlin.jvm.internal.Intrinsics;

public final class AppStartTimingModule extends ReactContextBaseJavaModule {
    /* JADX WARN: 'super' call moved to the top of the method (can break code semantics) */
    public AppStartTimingModule(ReactApplicationContext reactContext) {
        super(reactContext);
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
    }

    @Override
    public String getName() {
        return "AppStartTiming";
    }

    @Override
    public Map<String, Object> getConstants() {
        return MapsKt.mapOf(TuplesKt.to("nativeStartTime", Double.valueOf(AppStartTiming.INSTANCE.getNativeStartTime())), TuplesKt.to("wasHeadlessStart", Boolean.valueOf(AppStartTiming.INSTANCE.getWasHeadlessStart())));
    }
}
