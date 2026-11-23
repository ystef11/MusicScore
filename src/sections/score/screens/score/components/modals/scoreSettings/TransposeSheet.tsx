import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { NativeBottomSheet, SheetTitle, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { TranspositionSection } from './TranspositionSection'

/**
 * Dedicated Transpose bottom sheet for the new Score Play View (MUP-13932),
 * opened from the "±" control. Reuses {@link TranspositionSection}. The legacy
 * player still exposes transposition inside the general settings sheet.
 */
export const TransposeSheet = memo(
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
            name="transposeSheet"
            maxWidth={maxWidth}
            centerOnTablet={centerOnTablet}
        >
            <SheetTitle title={translate('native.score.transposition_title')} />
            <View style={[styles.content, { paddingBottom: inset.bottom }]}>
                <TranspositionSection standalone />
            </View>
        </NativeBottomSheet>
    )
})
TransposeSheet.displayName = 'TransposeSheet'

const styles = StyleSheet.create({
    content: {
        paddingTop: 4,
    },
})
