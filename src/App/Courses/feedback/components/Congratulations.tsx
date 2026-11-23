import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import type { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { COLOR_BLUE_600, COLOR_WHITE, TEXT_COLOR_900 } from '../../../constants/styles'

export const Congratulations = memo(
    ({
        onPress,
        courseDetailsChunk,
    }: {
        onPress: (step: 0 | 1 | 2) => void
        courseDetailsChunk: TCourseDetailsDynamicStoreChunk
    }) => {
        const [courseInfo] = useValues([courseDetailsChunk.props.getCourseInfo])
        const courseName = courseInfo?.course.name

        return (
            <>
                <Text style={styles.title}>{translate('native.courses.congratulations')}</Text>
                <Text style={styles.description}>
                    {translate('native.courses.complete_course', { name: courseName || '' })}
                </Text>
                <Text style={styles.description}>
                    {translate('native.courses.your_impressions')}
                </Text>
                <TouchableOpacity style={styles.button} onPress={() => onPress(2)}>
                    <Text style={styles.buttonTitle}>
                        {translate('native.courses.send_feedback')}
                    </Text>
                </TouchableOpacity>
            </>
        )
    },
)

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        color: TEXT_COLOR_900,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: TEXT_COLOR_900,
        marginBottom: 8,
    },
    button: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginTop: 32,
        backgroundColor: COLOR_BLUE_600,
    },
    buttonTitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: COLOR_WHITE,
    },
})
