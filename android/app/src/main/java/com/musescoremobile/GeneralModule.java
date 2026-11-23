package com.musescoremobile;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.musescore.client.BuildConfig;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;

public class GeneralModule extends ReactContextBaseJavaModule implements ActivityEventListener {
    private static final String E_LAYOUT_ERROR = "E_LAYOUT_ERROR";
    private static final int FILE_PICKER_REQUEST_CODE = 42;
    private static final String GOOGLE_USER_ID_EVENT_LOG = "GOOGLE_USER_ID_EVENT_LOG";
    private static final String REACT_CLASS = "GeneralModule";

    @Override
    public void onNewIntent(Intent intent) {
    }

    GeneralModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        reactApplicationContext.addActivityEventListener(this);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactMethod
    public void keepAwake(final boolean z) {
        UiThreadUtil.runOnUiThread(new Runnable() {
            @Override
            public final void run() {
                GeneralModule.this.lambda$keepAwake$0(z);
            }
        });
    }

    public void lambda$keepAwake$0(boolean z) {
        if (z) {
            if (getCurrentActivity() != null) {
                getCurrentActivity().getWindow().addFlags(128);
            }
        } else if (getCurrentActivity() != null) {
            getCurrentActivity().getWindow().clearFlags(128);
        }
    }

    @ReactMethod
    public void getGoogleUserId(Promise promise) {
        String string = getReactApplicationContext().getSharedPreferences("UGLicense", 0).getString(GOOGLE_USER_ID_EVENT_LOG, null);
        WritableMap writableMapCreateMap = Arguments.createMap();
        writableMapCreateMap.putString("googleUserId", string);
        try {
            promise.resolve(writableMapCreateMap);
        } catch (IllegalViewOperationException e) {
            promise.reject(E_LAYOUT_ERROR, e);
        }
    }

    @ReactMethod
    public void openPermisssionStorageSettings() {
        Intent intent = new Intent();
        intent.setAction("android.settings.APPLICATION_DETAILS_SETTINGS");
        intent.setData(Uri.fromParts("package", BuildConfig.APPLICATION_ID, null));
        if (getCurrentActivity() != null) {
            getCurrentActivity().startActivity(intent);
        }
    }

    @ReactMethod
    public void openFileManager(String str) {
        Intent intent = new Intent("android.intent.action.GET_CONTENT");
        intent.setDataAndType(Uri.parse(str), "*/*");
        intent.addCategory("android.intent.category.OPENABLE");
        if (getCurrentActivity() != null) {
            getCurrentActivity().startActivityForResult(intent, 42, null);
        }
    }

    @Override
    public void onActivityResult(Activity activity, int i, int i2, Intent intent) {
        if (i == 42) {
            if (i2 == -1 && intent != null) {
                Uri data = intent.getData();
                if (data != null) {
                    sendFilePathEvent(getPathFromUri(getReactApplicationContext(), data));
                    return;
                }
                return;
            }
            sendFilePathEvent(null);
        }
    }

    private void sendFilePathEvent(String str) {
        WritableMap writableMapCreateMap = Arguments.createMap();
        writableMapCreateMap.putString("filePath", str);
        ((DeviceEventManagerModule.RCTDeviceEventEmitter) getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)).emit("EventSendFilePathFromFileManager", writableMapCreateMap);
    }

    public static String getPathFromUri(Context context, Uri uri) {
        return com.musescoremobile.internal.OriginalFileImport.getPathFromUri(context, uri);
    }
}
