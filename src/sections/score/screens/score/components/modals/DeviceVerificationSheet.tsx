import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    AppText,
    globalStyles,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { useDeviceVerificationSheet } from '../../hooks/useDeviceVerificationSheet'

export const DeviceVerificationSheet = memo(() => {
    const { payload, isRetrying, sheetRef, onRetry, onLearnMore, onDismiss } =
        useDeviceVerificationSheet()
    const insets = useAppSafeArea({ bottom: 16 })

    if (!payload) return null

    return (
        <NativeBottomSheet
            ref={sheetRef}
            onDismiss={onDismiss}
            enablePanDownToClose={!isRetrying}
            rootViewStyle={styles.container}
        >
            <AppText
                font="f24w600"
                adaptiveSize
                brandColor="contentPrimary"
                rawText={translate('native.device_verification.title')}
                style={globalStyles.mb4}
            />
            <AppText
                font="f15w400"
                adaptiveSize
                brandColor="contentSecondary"
                rawText={translate('native.device_verification.message')}
                style={globalStyles.mb16}
            />
            <View style={[styles.buttons, { paddingBottom: insets.bottom }]}>
                {!!payload.retry && (
                    <MuseButton
                        title={translate('native.actions.retry')}
                        type="primary"
                        isLoading={isRetrying}
                        style={styles.button}
                        onPress={onRetry}
                    />
                )}
                <MuseButton
                    title={translate('native.device_verification.learn_more')}
                    type="secondary"
                    style={styles.button}
                    onPress={onLearnMore}
                />
            </View>
        </NativeBottomSheet>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
    },
    buttons: {
        width: '100%',
    },
    button: {
        width: '100%',
        marginVertical: 4,
    },
})
