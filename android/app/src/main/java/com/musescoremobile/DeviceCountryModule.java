package com.musescoremobile;

import android.telephony.TelephonyManager;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

public class DeviceCountryModule extends ReactContextBaseJavaModule {
    public boolean hasConstants() {
        return true;
    }

    public DeviceCountryModule(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public String getName() {
        return "DeviceCountryModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        String countryCodeFromTelephonyManager = getCountryCodeFromTelephonyManager();
        if (countryCodeFromTelephonyManager == null) {
            countryCodeFromTelephonyManager = getCountryCodeFromConfiguration();
        }
        HashMap map = new HashMap();
        map.put("countryCode", countryCodeFromTelephonyManager);
        return Collections.unmodifiableMap(map);
    }

    protected String getCountryCodeFromTelephonyManager() {
        ReactApplicationContext reactApplicationContext = getReactApplicationContext();
        if (reactApplicationContext == null) {
            return null;
        }
        try {
            String networkCountryIso = ((TelephonyManager) reactApplicationContext.getSystemService("phone")).getNetworkCountryIso();
            if (networkCountryIso.isEmpty()) {
                return null;
            }
            return networkCountryIso;
        } catch (Exception unused) {
            return null;
        }
    }

    protected String getCountryCodeFromConfiguration() {
        ReactApplicationContext reactApplicationContext = getReactApplicationContext();
        if (reactApplicationContext == null) {
            return null;
        }
        try {
            String country = reactApplicationContext.getResources().getConfiguration().locale.getCountry();
            return country.equals("419") ? "UN" : country;
        } catch (Exception unused) {
            return null;
        }
    }
}
