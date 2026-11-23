import { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { npsTestIds } from '@mu/mu-mobile-test-id'
import { brandColors, KeyboardSpacer, layout, NativeBottomSheet } from '@mu-native/ds'

import { useNpsSheet } from '../hooks/useNpsSheet'

import { NpsFeedbackStep } from './NpsFeedbackStep'
import { NpsRatingStep } from './NpsRatingStep'

const BOTTOM_PADDING = 8

export const NpsSheet = memo(() => {
    const {
        payload,
        step,
        rating,
        feedback,
        sheetRef,
        setRating,
        setFeedback,
        onSubmitRating,
        onSubmitFeedback,
        onDismiss,
    } = useNpsSheet()
    const insets = useSafeAreaInsets()

    if (!payload) return null

    return (
        <NativeBottomSheet
            ref={sheetRef}
            onDismiss={onDismiss}
            maxWidth={layout.maxSheetWidthCompact}
            centerOnTablet
            handleTestID={npsTestIds.sheetHandle}
        >
            <View style={styles.body} testID={npsTestIds.sheet}>
                {step === 'rating' ? (
                    <NpsRatingStep rating={rating} onChange={setRating} onSubmit={onSubmitRating} />
                ) : (
                    <NpsFeedbackStep
                        feedback={feedback}
                        onChange={setFeedback}
                        onSubmit={onSubmitFeedback}
                    />
                )}
                <KeyboardSpacer
                    handleAndroid
                    defaultBottomSpacing={BOTTOM_PADDING + insets.bottom}
                    openedSpacing={BOTTOM_PADDING}
                />
            </View>
        </NativeBottomSheet>
    )
})

const styles = StyleSheet.create({
    body: {
        width: '100%',
        paddingHorizontal: 20,
        paddingTop: 12,
        backgroundColor: brandColors.backgroundDefault,
    },
})
