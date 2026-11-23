import { memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

import { npsTestIds } from '@mu/mu-mobile-test-id'
import { AppText, brandColors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { NPS_RATING_VALUES } from '../constants/npsConstants'

type TCellProps = {
    value: number
    isSelected: boolean
    onPress: (value: number) => void
}

const NpsRatingCell = memo(({ value, isSelected, onPress }: TCellProps) => (
    <Pressable
        testID={npsTestIds.ratingCell(value)}
        accessibilityRole="radio"
        accessibilityState={{ selected: isSelected }}
        style={[styles.cell, isSelected && styles.cellSelected]}
        onPress={() => onPress(value)}
    >
        <AppText
            font="f15w500"
            lineHeight={20}
            brandColor={isSelected ? 'exceptionConstantLight' : 'contentPrimary'}
            rawText={value}
        />
    </Pressable>
))

const NpsRatingCaption = ({ text }: { text: string }) => (
    <AppText
        font="f11w400"
        lineHeight={12}
        brandColor="contentSecondary"
        style={styles.caption}
        rawText={text}
    />
)

type TProps = {
    rating: number | null
    onChange: (rating: number) => void
}

export const NpsRatingScale = ({ rating, onChange }: TProps) => (
    <View style={styles.scale}>
        <View style={styles.cells} accessibilityRole="radiogroup">
            {NPS_RATING_VALUES.map(value => (
                <NpsRatingCell
                    key={value}
                    value={value}
                    isSelected={value === rating}
                    onPress={onChange}
                />
            ))}
        </View>
        <View style={styles.legend}>
            <NpsRatingCaption text={translate('native.nps.rating_min')} />
            <NpsRatingCaption text={translate('native.nps.rating_max')} />
        </View>
    </View>
)

const styles = StyleSheet.create({
    scale: {
        gap: 8,
    },
    cells: {
        flexDirection: 'row',
        gap: 4,
    },
    cell: {
        flex: 1,
        height: 36,
        borderRadius: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.backgroundInactive,
    },
    cellSelected: {
        backgroundColor: brandColors.contentPrimary,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    caption: {
        letterSpacing: 0.5,
    },
})
