package com.musescoremobile;

import android.content.Context;
import android.content.SharedPreferences;
import android.preference.PreferenceManager;
import android.provider.Settings;

import kotlin.jvm.JvmStatic;
import kotlin.jvm.internal.DefaultConstructorMarker;
import kotlin.jvm.internal.Intrinsics;

public final class GetClientId {

    public static final Companion INSTANCE = new Companion(null);
    private static final String storeIdKey = "ID_KEY";
    private static final String defaultValue = "";

    @JvmStatic
    public static final String getUniqueID() {
        return INSTANCE.getUniqueID();
    }

    public static final class Companion {
        public Companion(DefaultConstructorMarker defaultConstructorMarker) {
            this();
        }

        private Companion() {
        }

        @JvmStatic
        public final String getUniqueID() {
            SharedPreferences defaultSharedPreferences = PreferenceManager.getDefaultSharedPreferences(com.musescore.client.MainApplication.getAppContext());
            Intrinsics.checkNotNullExpressionValue(defaultSharedPreferences, "getDefaultSharedPreferences(...)");
            String element = defaultSharedPreferences.getString(GetClientId.storeIdKey, GetClientId.defaultValue);
            if (element == null) {
                element = GetClientId.defaultValue;
            }
            if (Intrinsics.areEqual(element, GetClientId.defaultValue)) {
                Context appContext = com.musescore.client.MainApplication.getAppContext();
                element = Settings.Secure.getString(appContext != null ? appContext.getContentResolver() : null, "android_id");
                while (element.length() < 16) {
                    element = "0" + ((Object) element);
                }
                SharedPreferences.Editor editorEdit = defaultSharedPreferences.edit();
                editorEdit.putString(GetClientId.storeIdKey, element);
                editorEdit.commit();
                Intrinsics.checkNotNullExpressionValue(element, "element");
            }
            return element;
        }
    }
}
