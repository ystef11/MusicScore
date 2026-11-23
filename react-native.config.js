// Native SDKs unused by this application must not be compiled or autolinked.
const disabled = { platforms: { android: null, ios: null } }
module.exports = {
    dependencies: {
        '@xtz/muse-rn': disabled,
        // Google Play checkout is disabled in this recovered Android application.
        'react-native-iap': { platforms: { android: null } },
        '@react-native-firebase/crashlytics': disabled,
        'react-native-tracking-transparency': disabled,
    },
}
