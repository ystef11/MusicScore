import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    globalStyles,
    layout,
    MuseButton,
    NativeBottomSheet,
    SheetTitle,
    useAppSafeArea,
} from '@mu-native/ds'
import { minus } from '@mu-native/icons/minus'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import { autogradeScreenThunks } from '../store/autogradeScreenThunkActions.ts'

const AutogradeNoteSizeContent = memo(() => {
    const inset = useAppSafeArea({ bottom: 32 })
    const { onZoomIn, onZoomOut, onZoomReset } = useActions({
        onZoomIn: autogradeScreenThunks.zoomIn,
        onZoomOut: autogradeScreenThunks.zoomOut,
        onZoomReset: autogradeScreenThunks.zoomReset,
    })

    return (
        <View
            style={{ paddingBottom: inset.bottom, paddingHorizontal: layout.baseMarginFromEdges }}
        >
            <SheetTitle
                title={translate('native.score_staff_measure_sheet_title')}
                subtitle={translate('native.score_staff_measure_sheet_description')}
            />
            <View style={styles.buttonsWrapper}>
                <MuseButton
                    haptic
                    onPress={onZoomIn}
                    type="secondary"
                    title={translate('native.base_reduce')}
                    startIcon={minus}
                    style={globalStyles.flex1}
                />
                <MuseButton
                    haptic
                    onPress={onZoomOut}
                    type="secondary"
                    title={translate('native.base_enlarge')}
                    startIcon={plus}
                    style={globalStyles.flex1}
                />
            </View>
            <MuseButton
                haptic
                onPress={onZoomReset}
                type="secondary"
                title={translate('native.base_set_default_size')}
                style={styles.resetButton}
            />
        </View>
    )
})

export const AutogradeNoteSizeSheet = memo(() => (
    <NativeBottomSheet name="autogradeZoomSheet">
        <AutogradeNoteSizeContent />
    </NativeBottomSheet>
))

const styles = StyleSheet.create({
    buttonsWrapper: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    resetButton: {
        marginTop: 8,
    },
})
