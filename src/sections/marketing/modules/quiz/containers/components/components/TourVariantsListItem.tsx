import { memo } from 'react'
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native'
import Animated, {
    FadeInDown,
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import { AppText, brandColors, colors, layout, layoutHelpers, replacerText } from '@mu-native/ds'
import { useActions } from '@ug/store'

import { getQuizTranslateString } from '../../../helpers/quizTranslateHelper.ts'
import { quizStoreChunk } from '../../../store/quizStoreChunk'
import { type TQuizItem } from '../../../types/quizTypes'

import { CheckItem } from './CheckItem'

const { getResponsiveSize } = layoutHelpers

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(16),
    },
    quizItemStyle: {
        borderRadius: 1,
        backgroundColor: brandColors.backgroundInactive,
    },
    quizBorderStyle: {
        borderWidth: 1,
        borderRadius: 1,
        marginHorizontal: platform.isTablet ? 0 : getResponsiveSize(layout.marginMd),
    },
    borderBottom: {
        borderBottomWidth: 1,
    },
    maxWidthTitle: { maxWidth: '80%' },
})

type TTourVariantsListItem = {
    isSelected: boolean
    item: TQuizItem
    index: number
    isMultiSelect: boolean
    customStyleContainer?: ViewStyle
    isLastItem: boolean
}

const TourVariantsListItemComponent = ({
    isSelected,
    item: { id, title: quizTitle, name, value },
    index,
    isMultiSelect,
    customStyleContainer = {},
    isLastItem,
}: TTourVariantsListItem) => {
    const actions = useActions({
        setTourQuizDataFlatItem: quizStoreChunk.actions.setTourQuizDataFlatItem,
    })
    const isNeedAnimated = index <= 12
    const title = quizTitle || name || value

    const onPressQuizItem = () => {
        actions.setTourQuizDataFlatItem({
            answerId: id,
            title,
            isMultiSelect,
        })
    }

    const progressChangeBorderColor = useDerivedValue(() =>
        withTiming(isSelected ? 1 : 0, { duration: 300 }),
    )

    const borderStyles = useAnimatedStyle(() => ({
        borderColor: interpolateColor(
            progressChangeBorderColor.value,
            [0, 1],
            [colors.transparent, colors.text900],
        ),
    }))

    return (
        <Animated.View
            style={[
                styles.quizBorderStyle,
                borderStyles,
                isLastItem && styles.borderBottom,
                customStyleContainer,
            ]}
            {...(isNeedAnimated && { entering: FadeInDown.duration(300).delay(index * 50 + 200) })}
        >
            <TouchableOpacity
                testID={tourTestIds.quizOption(index)}
                activeOpacity={0.85}
                onPress={onPressQuizItem}
                style={styles.quizItemStyle}
            >
                <View style={styles.container}>
                    {!!title && (
                        <AppText
                            adaptiveSize
                            font="f17w500"
                            style={styles.maxWidthTitle}
                            rawText={replacerText({
                                text: getQuizTranslateString(title),
                            })}
                        />
                    )}
                    <CheckItem isChecked={isSelected} />
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}

export default memo(TourVariantsListItemComponent)
