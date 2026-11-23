package com.musescoremobile;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class MainPackage implements ReactPackage {
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactApplicationContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactApplicationContext) {
        ArrayList arrayList = new ArrayList();
        arrayList.add(new NativeMd5Module(reactApplicationContext));
        arrayList.add(new WebScoreSourceModule(reactApplicationContext));
        arrayList.add(new GeneralModule(reactApplicationContext));
        arrayList.add(new AppUpdaterModule(reactApplicationContext));
        arrayList.add(new DeviceCountryModule(reactApplicationContext));
        arrayList.add(new SaveDocumentModule(reactApplicationContext));
        arrayList.add(new AppStartTimingModule(reactApplicationContext));
        return arrayList;
    }
}
