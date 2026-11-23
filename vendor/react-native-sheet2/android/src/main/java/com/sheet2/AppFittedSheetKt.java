package com.sheet2;

import android.content.Context;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentTransaction;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.uimanager.UIManagerHelper;
import com.facebook.react.uimanager.events.EventDispatcher;
import java.util.ArrayList;
import java.util.List;
import kotlin.jvm.internal.Intrinsics;

public final class AppFittedSheetKt {
    static List<String> presentedSheets = new ArrayList();

    public static final void safeShow(Fragment fragment, FragmentManager manager, String str) {
        Intrinsics.checkNotNullParameter(fragment, "<this>");
        Intrinsics.checkNotNullParameter(manager, "manager");
        FragmentTransaction fragmentTransactionBeginTransaction = manager.beginTransaction();
        Intrinsics.checkNotNullExpressionValue(fragmentTransactionBeginTransaction, "beginTransaction(...)");
        fragmentTransactionBeginTransaction.add(fragment, str);
        fragmentTransactionBeginTransaction.commitNowAllowingStateLoss();
    }

    public static final void onSheetDismiss(AppFittedSheet appFittedSheet) {
        Intrinsics.checkNotNullParameter(appFittedSheet, "<this>");
        Context context = appFittedSheet.getContext();
        Intrinsics.checkNotNull(context, "null cannot be cast to non-null type com.facebook.react.bridge.ReactContext");
        EventDispatcher eventDispatcherForReactTag = UIManagerHelper.getEventDispatcherForReactTag((ReactContext) context, appFittedSheet.getId());
        int surfaceId = UIManagerHelper.getSurfaceId(appFittedSheet.getContext());
        if (eventDispatcherForReactTag != null) {
            eventDispatcherForReactTag.dispatchEvent(new SheetDismissEvent(surfaceId, appFittedSheet.getId()));
        }
    }
}
