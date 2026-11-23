import { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'

import { shazamTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    MuseButton,
    NativeBottomSheet,
    type NativeBottomSheetRef,
    SvgAsset,
    useAppSafeArea,
} from '@mu-native/ds'
import { soundWave } from '@mu-native/icons/soundWave'
import { translate } from '@mu-native/locale'
import { shazamStoreChunk } from '@mu-native/shazam'
import { check, openSettings, PERMISSIONS, request } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'

type Mode = 'briefing' | 'denied'

type Props = {
    onPermissionGranted: () => void
}

const SHEET_HEIGHT = 480

const MICROPHONE_PERMISSION = Platform.select({
    ios: PERMISSIONS.IOS.MICROPHONE,
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    default: PERMISSIONS.IOS.MICROPHONE,
})

export const ShazamBriefingSheet = forwardRef<NativeBottomSheetRef, Props>(
    ({ onPermissionGranted }, ref) => {
        const sheetRef = useRef<NativeBottomSheetRef>(null)
        const [mode, setMode] = useState<Mode>('briefing')
        const insets = useAppSafeArea()
        const [hasUsedShazam] = useValues([shazamStoreChunk.props.getHasUsedShazam])
        const { markUsed } = useActions({ markUsed: shazamStoreChunk.actions.markUsed })

        useImperativeHandle(
            ref,
            () => ({
                present: () => {
                    // First-time entry: always show the briefing, regardless of mic permission.
                    if (!hasUsedShazam) {
                        markUsed()
                        setMode('briefing')
                        reportEvent(MetricaEvents.SHAZAM_BRIEFING_VIEW, { mode: 'briefing' })
                        sheetRef.current?.present()
                        return
                    }
                    check(MICROPHONE_PERMISSION)
                        .then(status => {
                            if (status === 'granted') {
                                onPermissionGranted()
                                return
                            }
                            const nextMode = status === 'blocked' ? 'denied' : 'briefing'
                            setMode(nextMode)
                            reportEvent(MetricaEvents.SHAZAM_BRIEFING_VIEW, { mode: nextMode })
                            sheetRef.current?.present()
                        })
                        .catch(() => undefined)
                },
                dismiss: () => sheetRef.current?.dismiss(),
            }),
            [hasUsedShazam, markUsed, onPermissionGranted],
        )

        const onTapToListen = useCallback(async () => {
            reportEvent(MetricaEvents.SHAZAM_TAP_TO_LISTEN_CLICK)
            const status = await request(MICROPHONE_PERMISSION)
            reportEvent(MetricaEvents.SHAZAM_PERMISSION_RESULT, { status })
            if (status === 'granted') {
                sheetRef.current?.dismiss()
                onPermissionGranted()
            } else {
                setMode('denied')
            }
        }, [onPermissionGranted])

        const onOpenSettings = useCallback(() => {
            reportEvent(MetricaEvents.SHAZAM_OPEN_SETTINGS_CLICK)
            openSettings()
        }, [])

        const isDenied = mode === 'denied'

        return (
            <NativeBottomSheet
                ref={sheetRef}
                backgroundColor={brandColors.colorActionPrimaryDefault}
                minHeight={SHEET_HEIGHT}
                radius={0}
            >
                <View
                    testID={shazamTestIds.briefing.sheet}
                    style={{ paddingBottom: insets.bottom }}
                >
                    <View style={styles.body}>
                        <View style={styles.titleBlock}>
                            <AppText
                                style={styles.title}
                                rawText={translate(
                                    isDenied
                                        ? 'native.shazam.briefing.enable_microphone_title'
                                        : 'native.shazam.briefing.title',
                                )}
                                font="f44w400Accent"
                                brandColor="exceptionConstantLight"
                                textAlign="center"
                                lineHeight={40}
                            />
                            <AppText
                                rawText={translate(
                                    isDenied
                                        ? 'native.shazam.briefing.enable_microphone_description'
                                        : 'native.shazam.briefing.description',
                                )}
                                font="f15w400"
                                brandColor="exceptionConstantLight"
                                textAlign="center"
                                lineHeight={20}
                            />
                        </View>

                        <View style={styles.middleBlock}>
                            <CommonTouchable
                                onPress={onTapToListen}
                                disabled={isDenied}
                                testID={shazamTestIds.briefing.tapToListenButton}
                            >
                                <View
                                    style={[styles.bigButton, isDenied && styles.bigButtonDimmed]}
                                >
                                    <Icon
                                        source={soundWave}
                                        tint={
                                            isDenied
                                                ? brandColors.exceptionConstantLight
                                                : brandColors.contentPrimary
                                        }
                                        size={72}
                                    />
                                </View>
                            </CommonTouchable>
                            {!isDenied && (
                                <AppText
                                    rawText={translate('native.shazam.briefing.tap_to_listen')}
                                    font="f15w400"
                                    brandColor="exceptionConstantLight"
                                    textAlign="center"
                                    lineHeight={20}
                                />
                            )}
                        </View>

                        {isDenied && (
                            <MuseButton
                                style={styles.openSettings}
                                type="secondary"
                                title={translate('native.screen_omr.open_settings')}
                                onPress={onOpenSettings}
                            />
                        )}

                        <View style={styles.poweredBy}>
                            <AppText
                                rawText={translate('native.shazam.powered_by')}
                                font="f15w600"
                                brandColor="exceptionConstantLight"
                            />
                            <SvgAsset
                                type="ic_shazam_logo"
                                tint={brandColors.exceptionConstantLight}
                                width={100}
                                height={29}
                            />
                        </View>
                    </View>
                </View>
            </NativeBottomSheet>
        )
    },
)

const styles = StyleSheet.create({
    body: {
        paddingHorizontal: 20,
        paddingTop: 8,
        alignItems: 'center',
    },
    titleBlock: {
        width: '100%',
        gap: 8,
    },
    title: {
        letterSpacing: 0.5,
    },
    middleBlock: {
        alignItems: 'center',
        gap: 16,
    },
    bigButton: {
        width: 160,
        height: 160,
        marginTop: 40,
        borderRadius: 80,
        backgroundColor: brandColors.exceptionConstantLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bigButtonDimmed: {
        backgroundColor: brandColors.exceptionMultilayerLight,
    },
    openSettings: {
        alignSelf: 'center',
        marginTop: 40,
    },
    poweredBy: {
        marginTop: 40,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
})
