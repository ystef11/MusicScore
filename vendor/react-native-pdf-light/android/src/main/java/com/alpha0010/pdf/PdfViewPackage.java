package com.alpha0010.pdf;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.List;
import java.util.concurrent.locks.ReentrantLock;

import kotlin.collections.CollectionsKt;
import kotlin.jvm.internal.Intrinsics;

public final class PdfViewPackage implements ReactPackage {
    private static final ReentrantLock pdfMutex = new ReentrantLock();

    @Override
    public NativeModule getModule(String str, ReactApplicationContext reactApplicationContext) {
        return ReactPackage.super.getModule(str, reactApplicationContext);
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
        return java.util.Arrays.asList(new NativeModule[]{new PdfUtilModule(reactContext, pdfMutex), new PagingPdfViewModule(reactContext), new ZoomablePdfScrollViewModule(reactContext)});
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        Intrinsics.checkNotNullParameter(reactContext, "reactContext");
        ReentrantLock reentrantLock = pdfMutex;
        return java.util.Arrays.asList(new ViewManager[]{new ZoomablePdfScrollViewManager(reentrantLock), new PagingPdfViewManager(reentrantLock)});
    }
}
