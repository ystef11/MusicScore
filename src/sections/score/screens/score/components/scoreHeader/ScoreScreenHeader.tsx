import React, { useCallback, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors } from '@mu-native/ds'
import { AutoScrollModal, AutoScrollModalSettings, marketingStoreChunk } from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { Orientation, OrientationType } from '@mu-native/system'
import { xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import { ScoreHeaderButtons } from './ScoreHeaderButtons'
import { platform } from '@mu-native/common'

const styles = StyleSheet.create({
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.transparent,
    },
})

export const ScoreScreenHeader = React.memo(({ isScoreLoaded }: { isScoreLoaded: boolean }) => {
    const navigation = useNavigation()

    const [isAutoScrollSettingsModalVisible, isAutoScrollOfferVisible] = useValues([
        marketingStoreChunk.props.getIsAutoScrollSettingsModalVisible,
        scoreStoreChunk.props.getIsAutoScrollOfferVisible,
    ])

    const actions = useActions({
        setIsFullScreen: scoreStoreChunk.actions.setIsFullScreen,
        setIsAutoScrollSettingsModalVisible:
            marketingStoreChunk.actions.setIsAutoScrollSettingsModalVisible,
        togglePlay: scoreThunks.toggleScorePlay,
        setIsAutoScrollOfferVisible: scoreStoreChunk.actions.setIsAutoScrollOfferVisible,
    })

    const onCloseAutoScrollModal = useCallback(() => actions.setIsAutoScrollOfferVisible(false), [])

    const onOpenAutoScrollSettingsModal = useCallback(
        () => actions.setIsAutoScrollSettingsModalVisible(true),
        [],
    )
    const onCloseAutoScrollSettingsModal = useCallback(
        () => actions.setIsAutoScrollSettingsModalVisible(false),
        [],
    )

    const prevOrientation = useRef<OrientationType | null>(null)
    useEffect(() => {
        const listener = (orientation: OrientationType) => {
            if (
                platform.isTablet ||
                orientation === 'UNKNOWN' ||
                prevOrientation.current === 'UNKNOWN'
            ) {
                prevOrientation.current = orientation
                return
            }

            actions.setIsAutoScrollOfferVisible(false)
            onCloseAutoScrollSettingsModal()
        }

        Orientation.addDeviceOrientationListener(listener)

        return () => {
            Orientation.removeDeviceOrientationListener(listener)
        }
    }, [actions, onCloseAutoScrollSettingsModal])

    const onClose = useCallback(async () => {
        xtz.stop()
        actions.setIsFullScreen(false)
        navigation.goBack()
    }, [actions, navigation])

    return (
        <View style={styles.floatingHeader} pointerEvents="box-none">
            <AutoScrollModal
                isVisible={isAutoScrollOfferVisible}
                onClose={onCloseAutoScrollModal}
                openSettingsModal={onOpenAutoScrollSettingsModal}
                onPlay={actions.togglePlay}
            />
            <AutoScrollModalSettings
                isVisible={isAutoScrollSettingsModalVisible}
                onClose={onCloseAutoScrollSettingsModal}
            />
            <ScoreHeaderButtons onClose={onClose} isLoaded={isScoreLoaded} />
        </View>
    )
})
