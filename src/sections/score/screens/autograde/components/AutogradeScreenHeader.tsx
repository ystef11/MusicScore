import { useCallback, useEffect, useState } from 'react'
import { BackHandler, StyleSheet, View } from 'react-native'
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    CommonTouchable,
    Icon,
    layoutHelpers,
    MuseButton,
    nativeDismissFittedSheet,
    nativePresentFittedSheet,
    useAppSafeArea,
} from '@mu-native/ds'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { close as closeIcon } from '@mu-native/icons/close'
import { crop } from '@mu-native/icons/crop'
import { zoomIn } from '@mu-native/icons/zoomIn'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import autogradeScreenStoreChunk, {
    getActivePart,
    getParts,
} from '../store/autogradeScreenStoreChunk.ts'
import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'
import { AutogradeState } from '../types/autogradeScreenAppTypes.ts'

import { AutogradeNoteSizeSheet } from './AutogradeNoteSizeModal.tsx'
import { AutogradePartSelectionSheet } from './AutogradePartSelectionModal.tsx'
import { AutogradePlaybackSpeedControls } from './AutogradePlaybackSpeedControls.tsx'

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        marginTop: 12,
        justifyContent: 'space-between',
    },
    centralButtons: {
        flexDirection: 'row',
        gap: 4,
    },
    centralContainer: {
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        zIndex: -1,
    },
    settingsButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
    },
    partSelector: {
        width: undefined,
        height: 44,
        justifyContent: 'center',
        backgroundColor: brandColors.backgroundHighlight,
        borderRadius: 100,
    },
})

export const AutogradeScreenHeader = () => {
    const navigation = useAppNavigation()

    const [
        state,
        isEnabledRangeSelection,
        playbackSpeed,
        isPlaying,
        activePart,
        parts,
        isFullscreen,
        score,
    ] = useValues([
        autogradeScreenStoreChunk.props.getState,
        autogradeScreenStoreChunk.props.getIsRangeSelectionEnabled,
        autogradeScreenStoreChunk.props.getPlaybackSpeed,
        autogradeScreenStoreChunk.props.getIsPlaying,
        getActivePart,
        getParts,
        autogradeScreenStoreChunk.props.getIsFullscreen,
        autogradeScreenStoreChunk.props.getScore,
    ])
    const actions = useActions({
        ...autogradeScreenStoreChunk.actions,
        setRangeSelectionEnabled: autogradeScreenThunks.setRangeSelectionEnabled,
    })

    const [showPlaybackSpeedControls, setShowPlaybackSpeedControls] = useState(false)

    useEffect(() => {
        setShowPlaybackSpeedControls(false)
        nativeDismissFittedSheet('autogradeZoomSheet')
        nativeDismissFittedSheet('autogradePartSheet')
    }, [isPlaying, state])

    const onGracefulClose = useCallback(() => {
        actions.setGracefullyClosingScreen(true)
        setTimeout(() => {
            navigation.goBack()
        }, 1500)
    }, [actions, navigation])

    useEffect(() => {
        const handler = BackHandler.addEventListener('hardwareBackPress', () => {
            onGracefulClose()
            return true
        })
        return () => {
            handler.remove()
        }
    }, [onGracefulClose])

    const hideControls = useCallback(() => {
        setShowPlaybackSpeedControls(false)
    }, [])

    const onCrop = useCallback(() => {
        hideControls()
        actions.setRangeSelectionEnabled(!isEnabledRangeSelection)
    }, [hideControls, actions, isEnabledRangeSelection])

    const onShowNoteSizeModal = useCallback(() => {
        hideControls()
        nativePresentFittedSheet('autogradeZoomSheet')
    }, [hideControls])

    const onSelectPart = useCallback(() => {
        hideControls()
        nativePresentFittedSheet('autogradePartSheet')
    }, [hideControls])

    const onShowPlaybackControls = useCallback(
        () => setShowPlaybackSpeedControls(value => !value),
        [],
    )

    const isRecording = state === AutogradeState.Recording

    const scale = useSharedValue(1)

    useEffect(() => {
        scale.value = withTiming(isFullscreen ? 0 : 1)
    }, [isFullscreen])

    const animStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        }
    })

    const { right, left } = useAppSafeArea({ right: 20, left: 20 })

    const isMultipart = parts.length > 1
    const insets = useAppSafeArea({ top: platform.isTablet ? 16 : 0 })

    if (isRecording) return null

    return (
        <View
            style={[StyleSheet.absoluteFill, { paddingTop: insets.top }]}
            pointerEvents="box-none"
        >
            <View style={[styles.row, { paddingRight: right, paddingLeft: left }]}>
                <Reanimated.View style={animStyle}>
                    <MuseButton type="secondary" startIcon={closeIcon} onPress={onGracefulClose} />
                </Reanimated.View>
                <Reanimated.View style={animStyle}>
                    <View style={styles.centralContainer}>
                        <View style={styles.centralButtons}>
                            <MuseButton type="secondary" startIcon={crop} onPress={onCrop} />
                            <MuseButton
                                type="secondary"
                                onPress={onShowPlaybackControls}
                                title={`${playbackSpeed.toFixed(1)}x`}
                            />
                            <MuseButton
                                startIcon={zoomIn}
                                type="secondary"
                                onPress={onShowNoteSizeModal}
                            />
                        </View>
                        <AutogradePlaybackSpeedControls
                            visible={showPlaybackSpeedControls}
                            onClose={hideControls}
                        />
                    </View>
                </Reanimated.View>
                <Reanimated.View style={animStyle}>
                    {!!activePart && (
                        <CommonTouchable
                            style={styles.partSelector}
                            onPress={onSelectPart}
                            disabled={!isMultipart}
                        >
                            <View style={styles.settingsButtonContent}>
                                <AppText
                                    font="f14w500"
                                    brandColor={isMultipart ? 'contentPrimary' : 'contentInactive'}
                                >
                                    {activePart.partName ||
                                        translate('native.score.part_number', {
                                            number: String((activePart as any).index + 1),
                                        })}
                                </AppText>
                                {isMultipart && (
                                    <Icon
                                        source={chevronDown}
                                        size={layoutHelpers.getResponsiveSizeExtended(16)}
                                        tint={colors.text900}
                                    />
                                )}
                            </View>
                        </CommonTouchable>
                    )}
                </Reanimated.View>
            </View>
            {showPlaybackSpeedControls && (
                <View style={styles.overlay} onTouchStart={hideControls} />
            )}
            <AutogradeNoteSizeSheet />
            <AutogradePartSelectionSheet />
        </View>
    )
}
