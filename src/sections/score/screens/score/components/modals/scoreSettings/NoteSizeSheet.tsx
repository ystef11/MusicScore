import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    brandColors,
    globalStyles,
    MuseButton,
    NativeBottomSheet,
    SheetTitle,
    useAppSafeArea,
    useSheetHorizontalInset,
} from '@mu-native/ds'
import { minus } from '@mu-native/icons/minus'
import { plus } from '@mu-native/icons/plus'
import { translate } from '@mu-native/locale'
import {
    DefaultNoteSize,
    getCurrentNoteSizeState,
    scoreStoreChunk,
    scoreThunks,
} from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

const LocalNoteSizeSheet = memo(() => {
    const inset = useAppSafeArea({ bottom: 32 })
    const sheetInset = useSheetHorizontalInset()
    const [noteSizeState, noteSize] = useValues([
        getCurrentNoteSizeState,
        scoreStoreChunk.props.getCurrentNoteSize,
    ])
    const actions = useActions({
        setNoteSize: scoreThunks.setNoteSize,
    })

    const { min: minNoteSize, max: maxNoteSize } = noteSizeState

    const onZoomIn = useCallback(() => {
        if (noteSize > minNoteSize) {
            const zoomValue = noteSize - 0.5
            actions.setNoteSize(zoomValue)
        }
    }, [noteSize, minNoteSize, actions])

    const onZoomOut = useCallback(() => {
        if (noteSize < maxNoteSize) {
            const zoomValue = noteSize + 0.5
            actions.setNoteSize(zoomValue)
        }
    }, [noteSize, maxNoteSize, actions])

    const onZoomReset = useCallback(() => {
        actions.setNoteSize(DefaultNoteSize)
    }, [actions])

    return (
        <View style={{ paddingBottom: inset.bottom, paddingHorizontal: sheetInset }}>
            <SheetTitle
                subtitle={translate('native.score_staff_measure_sheet_description')}
                title={translate('native.score_staff_measure_sheet_title')}
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

export const NoteSizeSheet = memo(
    ({ maxWidth, centerOnTablet }: { maxWidth?: number; centerOnTablet?: boolean }) => {
        return (
            <NativeBottomSheet name="zoomSheet" maxWidth={maxWidth} centerOnTablet={centerOnTablet}>
                <LocalNoteSizeSheet />
            </NativeBottomSheet>
        )
    },
)

const styles = StyleSheet.create({
    buttonsWrapper: {
        flexDirection: 'row',
        marginTop: 16,
        gap: 8,
    },
    button: {
        justifyContent: 'center',
        flex: 1,
        height: 44,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        borderWidth: 1,
        borderColor: brandColors.formDefault,
    },
    newButton: {
        justifyContent: 'center',
        flex: 1,
        height: 44,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        borderWidth: 1,
        borderColor: brandColors.formDefault,
    },
    tertiaryButton: {
        marginTop: 8,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    resetButton: {
        marginTop: 8,
    },
})
