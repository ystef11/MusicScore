import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    brandColors,
    CommonTouchable,
    Icon,
    layout,
    nativePresentFittedSheet,
    ProgressBar,
    useAppSafeArea,
} from '@mu-native/ds'
import { closeCompact } from '@mu-native/icons/closeCompact'
import { settings } from '@mu-native/icons/settings'
import { getCurrentPlaybackPercentPosition } from '@mu-native/score'
import { useValues } from '@ug/store'

type Props = {
    onClose: () => void
    isLandscape?: boolean
}

/**
 * Top bar of the new Score Play View: close (left), playback progress (center),
 * settings gear (right). Opens the reused general settings sheet.
 */
export const ScorePlayTopBar = memo(({ onClose, isLandscape }: Props) => {
    const insets = useAppSafeArea({ top: 12 })
    const [progress] = useValues([getCurrentPlaybackPercentPosition])

    const onOpenSettings = useCallback(() => nativePresentFittedSheet('scoreSettingsSheet'), [])

    return (
        <View
            style={[
                styles.container,
                { paddingTop: insets.top },
                // Edge-to-edge with a small inset in landscape (see ScorePlayScreen).
                isLandscape && styles.landscapePadding,
            ]}
        >
            <CommonTouchable style={styles.iconButton} onPress={onClose} isHapticEnabled>
                <Icon source={closeCompact} tint={brandColors.exceptionInverseLight} size={20} />
            </CommonTouchable>

            <View style={styles.progressWrapper}>
                <ProgressBar
                    progress={progress / 100}
                    width={null}
                    height={7}
                    borderWidth={0}
                    borderRadius={4}
                    color={brandColors.contentPrimary}
                    unfilledColor={brandColors.backgroundInactive}
                    style={styles.progress}
                />
            </View>

            <CommonTouchable style={styles.iconButton} onPress={onOpenSettings} isHapticEnabled>
                <Icon source={settings} tint={brandColors.exceptionInverseLight} size={20} />
            </CommonTouchable>
        </View>
    )
})
ScorePlayTopBar.displayName = 'ScorePlayTopBar'

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 16,
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingBottom: 8,
    },
    landscapePadding: {
        paddingHorizontal: 40,
    },
    // Center the progress bar and cap it at 330 so it doesn't stretch full-width
    // on tablets / in landscape (matches design). On phones the wrapper is
    // narrower than 330, so the bar still fills the available space.
    progressWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    progress: {
        width: '100%',
        maxWidth: 330,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.actionSecondaryDefault,
    },
})
