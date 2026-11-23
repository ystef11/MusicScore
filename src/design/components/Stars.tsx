import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { star } from '@mu-native/icons/star'

import { layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

import Icon from './Icon/Icon'

export interface IStarProps {
    userRating: number | null
    onRate?: (index: number) => void
    subtitled?: boolean
    customContainerStyle?: StyleProp<ViewStyle>
}

export const Stars = memo(({ userRating, onRate, subtitled, customContainerStyle }: IStarProps) => {
    const stars = Array.from(new Array(5), (item, index) => {
        const onRatePress = () => onRate?.(index + 1)
        const isFilled = !userRating || userRating >= index + 1

        return (
            <CommonTouchable onPress={onRatePress} key={index}>
                <Icon
                    source={star}
                    tint={isFilled ? brandColors.additionalRating : brandColors.formDisabled}
                />
            </CommonTouchable>
        )
    })
    const containerStyle = subtitled ? styles.starSubtitledContainer : styles.starContainer
    return (
        <View style={[containerStyle, !!customContainerStyle && customContainerStyle]}>
            {stars}
        </View>
    )
})

const styles = StyleSheet.create({
    starSubtitledContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: layout.marginSm,
        paddingVertical: layout.marginMd,
        width: '100%',
        maxWidth: 320,
        alignSelf: 'center',
    },
    starContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: layout.marginSm,
    },
    starSubtitled: {
        width: 36,
        height: 36,
        marginVertical: layout.marginSm,
        alignSelf: 'center',
    },
    smallStar: {
        width: 16,
        height: 16,
        marginVertical: 2,
        marginHorizontal: 0,
    },
    star: {
        width: 24,
        height: 24,
        marginVertical: layout.marginSm,
        marginHorizontal: layout.marginSm,
    },
})
