import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import {
    AppText,
    globalStyles,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    staticSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useSheetPresentable } from '@mu-native/system'
import { useActions } from '@ug/store'

export const ForcedLogoutContainer = memo(() => {
    const { isPresent, setPresent, sheetRef } = useSheetPresentable('presentForceLogout')
    const actions = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
    })

    if (!isPresent) return null

    const onDismiss = () => setPresent(false)
    const onHide = () => sheetRef.current?.dismiss()
    const onSignIn = () => {
        setTimeout(() => actions.setIsVisible(true), 200)
        onHide()
    }

    return (
        <NativeBottomSheet ref={sheetRef} onDismiss={onDismiss} rootViewStyle={styles.container}>
            <AppText
                font="f24w600"
                adaptiveSize
                brandColor="contentPrimary"
                rawText={translate('native.force.logout.title')}
                style={globalStyles.mb4}
            />
            <AppText
                font="f15w400"
                rawText={translate('native.force.logout.message')}
                adaptiveSize
                brandColor="contentSecondary"
                style={globalStyles.mb32}
            />
            <MuseButton
                haptic={false}
                title={translate('native.screen_login.login_button_title')}
                onPress={onSignIn}
                style={styles.bottomButton}
            />
        </NativeBottomSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
    },
  bottomButton: {
      marginBottom: staticSafeArea().bottom
  }
})
