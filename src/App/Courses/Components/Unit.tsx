import React, { useEffect, useRef, useState } from 'react'
import {
    Animated,
    ImageStyle,
    StyleSheet,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'

import { AppText, brandColors, Icon } from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { translate } from '@mu-native/locale'

import { COLOR_GREY_500, COLOR_GREY_900 } from '../../constants/styles'
import type { TLesson, TProgress } from '../coursesTypes'

import Lesson from './lesson/Lesson'

// Generic unit names come from the backend in English; authored names are shown as-is.
const GENERIC_UNIT_NAME = /^unit\s+(\d+)$/i

const localizeUnitName = (name: string) => {
    const unitNumber = name.trim().match(GENERIC_UNIT_NAME)?.[1]
    return unitNumber ? translate('native.courses.unit', { number: unitNumber }) : name
}

const styles = StyleSheet.create({
    noUnitsContainer: {
        marginTop: 10,
    } as ViewStyle,
    container: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    titleContainer: {
        flexDirection: 'row',
        marginVertical: 10,
        flexShrink: 1,
        alignItems: 'center',
    } as ViewStyle,
    icon: {
        width: 16,
        height: 16,
        marginRight: 14,
        marginLeft: -1,
    } as ImageStyle,
    // eslint-disable-next-line react-native/no-color-literals
    circle: {
        width: 20,
        height: 20,
        borderRadius: 100,
        marginRight: 10,
        backgroundColor: brandColors.colorBackgroundDisabled,
    } as ViewStyle,
    lessonText: {
        // maxWidth: '86%',
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: COLOR_GREY_500,
    } as TextStyle,
    textDark: {
        color: COLOR_GREY_900,
    } as TextStyle,
    lessonTextBold: {
        width: '85%',
    } as TextStyle,
    dropdownContainer: {
        overflow: 'hidden',
    } as ViewStyle,
})

type TProps = {
    unit: { name: string; lessons: TLesson[]; id: number }
    isActive: boolean
    isExpanded: boolean
    index: number
    activeLesson: number
    progress: TProgress[]
    onUnitPress: (index: number, id: number) => void
    onLessonPress: (unitIndex: number, index: number, isAvailable: boolean) => void
    withoutDropdown?: boolean
}

const Unit = ({
    unit,
    isActive,
    isExpanded,
    index,
    activeLesson,
    progress,
    onUnitPress,
    onLessonPress,
    withoutDropdown,
}: TProps): React.ReactElement => {
    const { current: animated } = useRef<Animated.Value>(new Animated.Value(isActive ? 1 : 0))
    const [expanded, setExpanded] = useState(isExpanded)
    const [isCompleted, setIsCompleted] = useState(true)

    const expand = () => {
        onUnitPress(index, unit?.id)
        setExpanded(true)
        Animated.timing(animated, {
            toValue: 1,
            duration: 200,
            useNativeDriver: false,
        }).start()
    }

    const collapse = () => {
        setExpanded(false)
        Animated.timing(animated, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
        }).start()
    }

    useEffect(() => {
        if (!isExpanded) {
            collapse()
        }
    }, [isExpanded])
    const { name, lessons } = unit

    useEffect(() => {
        // eslint-disable-next-line no-restricted-syntax
        for (const lesson of lessons) {
            const isLessonCompleted = !!progress.find(
                (item: TProgress) => item.lesson_id === lesson.id && item.status === 2,
            )

            if (!isLessonCompleted) {
                setIsCompleted(false)
                break
            }
        }
    }, [])

    const { current: dropdownStyle } = useRef(
        StyleSheet.flatten([
            styles.dropdownContainer,
            {
                height: animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, unit.lessons.length * 34],
                }),
            },
        ]),
    )
    const { current: chevronStyle } = useRef({
        transform: [
            {
                rotate: animated.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                }),
            },
        ],
    })

    if (withoutDropdown) {
        return (
            <View style={styles.noUnitsContainer}>
                {lessons?.map((item: TLesson, lessonIndex: number) => (
                    <Lesson
                        key={item.id}
                        unitIndex={index}
                        lesson={item}
                        index={lessonIndex}
                        isActive={lessonIndex === activeLesson && isActive}
                        onPress={onLessonPress}
                        noMarginLeft
                    />
                ))}
            </View>
        )
    }

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={expanded ? collapse : expand}
                // disabled={isActive}
            >
                <View style={styles.titleContainer}>
                    {isCompleted ? (
                        <Icon source={checkmarkCircle} style={styles.icon} />
                    ) : (
                        <View style={styles.circle} />
                    )}
                    <AppText
                        font="f15w400"
                        style={
                            (isActive
                                ? styles.lessonTextBold
                                : StyleSheet.flatten([styles.lessonText, styles.textDark]),
                            { flexShrink: 1 })
                        }
                        numberOfLines={1}
                    >
                        {localizeUnitName(name)}
                    </AppText>
                </View>
                <Animated.View style={chevronStyle}>
                    <Icon source={chevronDown} tint={brandColors.contentPrimary} />
                </Animated.View>
            </TouchableOpacity>
            <Animated.View style={dropdownStyle}>
                {lessons?.map((item: TLesson, lessonIndex: number) => (
                    <Lesson
                        key={item.id}
                        unitIndex={index}
                        lesson={item}
                        index={lessonIndex}
                        isActive={lessonIndex === activeLesson && isActive}
                        onPress={onLessonPress}
                    />
                ))}
            </Animated.View>
        </>
    )
}

export default React.memo(Unit)
