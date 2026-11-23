import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { NativeBottomSheet, SheetTitle, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { TempoSection } from './TempoSection'

/**
 * Dedicated Tempo bottom sheet for the new Score Play View (MUP-13932), opened
 * from the "Tempo" control. The metronome controls live in their own sheet.
 */
export const TempoSheet = memo(
    ({
        maxWidth,
        centerOnTablet,
    }: {
        maxWidth?: number
        centerOnTablet?: boolean
    }) => {
    const inset = useAppSafeArea({ bottom: 32 })
    return (
        <NativeBottomSheet
            name="tempoSheet"
            maxWidth={maxWidth}
            centerOnTablet={centerOnTablet}
        >
            <SheetTitle title={translate('native.settings_extasy_screen.tempo_title')} />
            <View style={[styles.content, { paddingBottom: inset.bottom }]}>
                <TempoSection standalone />
            </View>
        </NativeBottomSheet>
    )
})
TempoSheet.displayName = 'TempoSheet'

const styles = StyleSheet.create({
    content: {
        paddingTop: 4,
    },
})
