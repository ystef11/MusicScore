package com.musescore.client

import android.app.Application
import android.content.Context
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {
  companion object {
    private var appContext: Context? = null
    @JvmStatic fun getAppContext(): Context? = appContext
  }

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(com.musescoremobile.MainPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    appContext = applicationContext
    com.musescoremobile.AppStartTiming.INSTANCE.markStart()
    loadReactNative(this)
  }
}
