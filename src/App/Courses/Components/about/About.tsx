import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import RenderHTML from 'react-native-render-html'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { device } from '@mu-native/common'
import { localizeFilterName, localizeInstrumentFilterOption, translate } from '@mu-native/locale'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import type { TCourse, TFilter, TFilters, TTopic } from '../../coursesTypes'

import { styles } from './styles'

type Props = {
    course: TCourse
    filters: TFilters | null
}

const About = ({ course, filters }: Props) => {
    const contentWidth = device.screenData.width - 32
    const { title } = styles

    useEffect(() => {
        reportEvent(MetricaEvents.COURSE_ABOUT_SHOW)
    }, [])

    const getLevel = () => {
        const name = filters?.level?.find((item: TFilter) => item.id === `${course.level}`)?.name
        return name ? localizeFilterName(name) : name
    }

    const getInstrument = () => {
        const name = filters?.instrument?.find(
            (item: TFilter) => item.id === `${course.instrument_id}`,
        )?.name
        return name ? localizeInstrumentFilterOption(name) : name
    }

    const getTopics = () =>
        course.topics?.map((item: TTopic) => localizeFilterName(item.name)).join(', ')

    const p = {
        marginHorizontal: 0,
        marginVertical: 8,
    }

    return (
        <View style={styles.container}>
            {course.requirements ? (
                <>
                    <Text style={styles.title}>
                        {translate('native.courses.what_will_you_learn')}
                    </Text>
                    <RenderHTML
                        source={{ html: course.requirements }}
                        contentWidth={contentWidth}
                        tagsStyles={{ p }}
                    />
                </>
            ) : null}
            <View style={styles.line} />
            <Text testID={coursesTestIds.courseDetails.aboutContent} style={styles.title}>
                {translate('native.courses.course_type')}
            </Text>
            <View style={styles.infoContainer}>
                <View style={styles.infoTitlesContainer}>
                    <Text style={StyleSheet.flatten([styles.text, styles.textLight])}>
                        {translate('native.common.label_with_colon', {
                            label: translate('native.courses.level'),
                        })}
                    </Text>
                    <Text style={StyleSheet.flatten([styles.text, styles.textLight])}>
                        {translate('native.common.label_with_colon', {
                            label: translate('native.courses.instrument'),
                        })}
                    </Text>
                    <Text style={StyleSheet.flatten([styles.text, styles.textLight])}>
                        {translate('native.common.label_with_colon', {
                            label: translate('native.courses.theme'),
                        })}
                    </Text>
                </View>
                <View style={styles.infoValuesContainer}>
                    <Text style={StyleSheet.flatten([styles.text, styles.textBold])}>
                        {getLevel()}
                    </Text>
                    <Text style={StyleSheet.flatten([styles.text, styles.textBold])}>
                        {getInstrument()}
                    </Text>
                    <Text style={StyleSheet.flatten([styles.text, styles.textBold])}>
                        {getTopics()}
                    </Text>
                </View>
            </View>
            <View style={styles.line} />
            <Text style={title}>{translate('native.courses.about_course')}</Text>
            <View>
                <RenderHTML
                    source={{ html: course.description }}
                    contentWidth={contentWidth}
                    tagsStyles={{
                        p,
                        b: {
                            fontWeight: 'bold',
                        },
                    }}
                />
            </View>
            <View style={styles.marginTop} />
        </View>
    )
}

export default React.memo(About)
