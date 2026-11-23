package com.sheet2;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;

public final class SheetDismissEvent extends Event<SheetDismissEvent> {
    public static final String EVENT_NAME = "onSheetDismiss";

    @Override
    public short getCoalescingKey() {
        return (short) 0;
    }

    @Override
    protected WritableMap getEventData() {
        return null;
    }

    public SheetDismissEvent(int i, int i2) {
        super(i, i2);
    }

    @Override
    public String getEventName() {
        return EVENT_NAME;
    }
}
