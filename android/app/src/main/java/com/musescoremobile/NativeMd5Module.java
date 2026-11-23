package com.musescoremobile;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class NativeMd5Module extends ReactContextBaseJavaModule {
    private static final char[] HEX_ARRAY = "0123456789abcdef".toCharArray();
    private static final String MODULE_NAME = "NativeMD5";
    private static final String SALT = "renderTime";

    NativeMd5Module(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public String getName() {
        return MODULE_NAME;
    }

    @ReactMethod
    public void add(int i, int i2, Promise promise) {
        promise.resolve(Integer.valueOf(i + i2));
    }

    @ReactMethod
    public void getClientId(Promise promise) {
        promise.resolve(GetClientId.getUniqueID());
    }

    @ReactMethod
    public void getHash(String str, Promise promise) {
        try {
            promise.resolve(getHash(str, GetClientId.getUniqueID()));
        } catch (IllegalStateException e) {
            promise.reject("MD5_ERROR", "Failed to generate MD5 hash", e);
        }
    }

    public static String getHash(String str, String str2) {
        if (str == null) {
            str = "";
        }
        if (str2 == null) {
            str2 = "";
        }
        return digestToHex(md5(str2 + SALT + str));
    }

    public static String getHash2(String str, String str2) {
        return getHash(str, str2);
    }

    private static byte[] md5(String str) {
        try {
            return MessageDigest.getInstance("MD5").digest(str.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }

    private static String digestToHex(byte[] bArr) {
        StringBuilder sb = new StringBuilder(bArr.length * 2);
        for (byte b : bArr) {
            char[] cArr = HEX_ARRAY;
            sb.append(cArr[(b & 255) >>> 4]);
            sb.append(cArr[b & 15]);
        }
        return sb.toString();
    }
}
