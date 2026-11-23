import { memo, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    DividerComponent,
    globalStyles,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    staticSafeArea,
    useSheetDismiss,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    cancelScanModalContainer: {
        justifyContent: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        width: '100%',
    },
    dividerColor: {
        backgroundColor: brandColors.contentPrimary,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(12),
    },
})

export const CancelScanModalContent = memo(
    ({
        cancelUploadCallback,
        isHadProAccessOffScores,
        setSourceScan,
    }: {
        setSourceScan: () => void
        cancelUploadCallback: () => void
        isHadProAccessOffScores: boolean
    }) => {
        const close = useSheetDismiss()
        const { pop } = useAppNavigation()
        const { navigate } = useAppNavigation()

        const onPresSft = () => {
            close()
        }

        return (
            <View
                style={[
                    styles.cancelScanModalContainer,
                    { paddingBottom: staticSafeArea().bottomWithAndroid },
                ]}
            >
                <AppText
                    textAlign="center"
                    adaptiveSize
                    font="f44w400Accent"
                    rawText={translate('native.screen_omr.cancel_upload_title')}
                    style={globalStyles.mb12}
                />
                <DividerComponent isShowOrTitle={false} customStyle={styles.dividerColor} />
                <AppText
                    adaptiveSize
                    font="f17w400"
                    style={globalStyles.mb12}
                    rawText={translate('native.screen_omr.cancel_upload_description')}
                />
                <DividerComponent
                    isShowOrTitle={false}
                    customStyle={[styles.dividerColor, globalStyles.mb16]}
                />
                <MuseButton
                    onPress={onPresSft}
                    title={
                        isHadProAccessOffScores
                            ? translate('native.screen_new_account.continue')
                            : translate('native.screen_omr.continue_upload')
                    }
                    style={[globalStyles.fullWidth, globalStyles.mb16]}
                />
                <MuseButton
                    onPress={() => {
                        close()
                        cancelUploadCallback()
                        pop(2)
                    }}
                    type="secondary"
                    title={translate('native.screen_omr.cancel_upload')}
                    style={globalStyles.fullWidth}
                />
            </View>
        )
    },
)

export const CancelScanModalComponent = ({ onClose }: { onClose: () => void }) => {
    const [isOpenCancelModal, setIsOpenCancelModal] = useState(true)
    const [isHadProAccessOffScores] = useValues([
        marketingStoreChunk.props.getIsHadProAccessOffScores,
    ])
    const actions = useActions({
        setPhotos: omrStoreChunk.actions.setPhotos,
        setSource: marketingStoreChunk.actions.setSource,
    })

    const onCloseModal = () => {
        onClose()
        setIsOpenCancelModal(false)
    }

    const setSourceScan = () => {
        actions.setSource(sources.scan)
    }

    const cancelUploadCallback = () => {
        actions.setPhotos([])
    }

    useEffect(() => {
        if (isOpenCancelModal) {
            reportEvent('Temp Upload Step Show', {
                value: 'cancel_ai_scan_modal',
            })
        }
    }, [isOpenCancelModal])

    if (!isOpenCancelModal) return null

    return (
        <NativeBottomSheet presentOnMount onDismiss={onCloseModal} dismissOnOverlayTap={false}>
            <CancelScanModalContent
                cancelUploadCallback={cancelUploadCallback}
                isHadProAccessOffScores={isHadProAccessOffScores}
                setSourceScan={setSourceScan}
            />
        </NativeBottomSheet>
    )
}
