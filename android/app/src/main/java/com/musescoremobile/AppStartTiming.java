package com.musescoremobile;

import android.os.SystemClock;

public final class AppStartTiming {
    private static final long HEADLESS_START_THRESHOLD_MS = 60000;
    public static final AppStartTiming INSTANCE = new AppStartTiming();
    private static boolean activityStartMarked;
    private static volatile double nativeStartTime;
    private static volatile boolean wasHeadlessStart;

    private AppStartTiming() {
    }

    public final double getNativeStartTime() {
        return nativeStartTime;
    }

    public final boolean getWasHeadlessStart() {
        return wasHeadlessStart;
    }

    public final void markStart() {
        nativeStartTime = SystemClock.uptimeMillis();
    }

    public final synchronized void markActivityStart() {
        if (activityStartMarked) {
            return;
        }
        activityStartMarked = true;
        double dUptimeMillis = SystemClock.uptimeMillis();
        if (dUptimeMillis - nativeStartTime > 60000.0d) {
            nativeStartTime = dUptimeMillis;
            wasHeadlessStart = true;
        }
    }
}
