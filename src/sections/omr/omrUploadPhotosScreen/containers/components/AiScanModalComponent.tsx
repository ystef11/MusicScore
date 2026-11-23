import { memo, useEffect } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    DividerComponent,
    globalStyles,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    useSheetDismiss,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    cancelScanModalContainer: {
        justifyContent: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    dividerColor: {
        backgroundColor: brandColors.contentPrimary,
        marginBottom: 0,
    },
})

export const AiScanModalContent = memo(
    ({
        photos,
        isHadProAccessOffScores,
        setSourceScan,
    }: {
        photos: string[]
        isHadProAccessOffScores: boolean
        setSourceScan: () => void
    }) => {
        const close = useSheetDismiss()
        const { navigate } = useAppNavigation()

        const onPressFreeTrial = () => {
            setSourceScan()
            reportEvent('Temp Upload AI Scan Click', {
                value: 'sft',
            })
            close()
            navigate(Screen.screenLongLanding, {
                isOfficialScore: true,
                activePlanIndex: 0,
            })
        }

        const onPressScan = () => {
            setSourceScan()
            reportEvent('Temp Upload AI Scan Click', {
                value: 'continue',
            })
            close()
            navigate(Screen.screenLongLanding, {
                isOfficialScore: true,
            })
        }

        return (
            <View style={styles.cancelScanModalContainer}>
                <AppText
                    textAlign="center"
                    adaptiveSize
                    font="f44w400Accent"
                    rawText={translate('native.screen_omr.ai_scan_title')}
                    style={globalStyles.mb24}
                />
                <DividerComponent isShowOrTitle={false} customStyle={styles.dividerColor} />
                <ScrollView
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    style={globalStyles.flex1FullWidth}
                    contentContainerStyle={globalStyles.paddingVertical20}
                >
                    {!!photos.length &&
                        photos.map(path => (
                            <Image
                                key={path}
                                source={{ uri: path }}
                                style={{
                                    width: layoutHelpers.getResponsiveSizeExtended(80),
                                    height: layoutHelpers.getResponsiveSizeExtended(120),
                                }}
                            />
                        ))}
                </ScrollView>
                <DividerComponent
                    isShowOrTitle={false}
                    customStyle={[styles.dividerColor, globalStyles.mb16]}
                />
                <AppText
                    adaptiveSize
                    font="f17w400"
                    rawText={translate('native.screen_omr.ai_scan_description')}
                    style={globalStyles.mb24}
                />
                {!isHadProAccessOffScores && (
                    <MuseButton
                        onPress={onPressFreeTrial}
                        type="secondary"
                        title={translate('native.screen_omr.start_free_trial')}
                        style={[globalStyles.fullWidth, globalStyles.mb16]}
                    />
                )}
                <MuseButton
                    onPress={onPressScan}
                    title={translate('native.screen_omr.continue_to_scan')}
                    style={[globalStyles.fullWidth, globalStyles.mb16]}
                />
            </View>
        )
    },
)

export const AiScanModalComponent = () => {
    const [isOpenAiScanModalComponent, photos, isHadProAccessOffScores] = useValues([
        omrStoreChunk.props.getIsOpenAiScanModalComponent,
        omrStoreChunk.props.getPhotos,
        marketingStoreChunk.props.getIsHadProAccessOffScores,
    ])
    const actions = useActions({
        setIsOpenAiScanModalComponent: omrStoreChunk.actions.setIsOpenAiScanModalComponent,
        setSource: marketingStoreChunk.actions.setSource,
    })

    const onClose = () => {
        actions.setIsOpenAiScanModalComponent(false)
    }

    const setSourceScan = () => {
        actions.setSource(sources.scan)
    }

    useEffect(() => {
        if (isOpenAiScanModalComponent) {
            reportEvent('Temp Upload Step Show', {
                value: 'ai_scan_modal',
            })
        }
    }, [isOpenAiScanModalComponent])

    if (!isOpenAiScanModalComponent) return null

    return (
        <NativeBottomSheet presentOnMount onDismiss={onClose} dismissOnOverlayTap={false}>
            <AiScanModalContent
                photos={photos}
                isHadProAccessOffScores={isHadProAccessOffScores}
                setSourceScan={setSourceScan}
            />
        </NativeBottomSheet>
    )
}
