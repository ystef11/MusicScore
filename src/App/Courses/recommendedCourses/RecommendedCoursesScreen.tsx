import { useLayoutEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import { NavHeader } from '../../Components/NavHeader/NavHeader.tsx'
import { CourseList } from '../Containers/CourseList.tsx'
import { loadCourses, loadMoreCourses } from '../coursesActionsAsync.ts'

import { recommendedCoursesStoreChunk } from './recommendedCoursesStoreChunk.ts'

export const RecommendedCoursesScreen = () => {
    const navigation = useAppNavigation()

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return (
                    <NavHeader
                        headerTitle={translate('native.screen_explore.recommended_courses')}
                        noNotifications
                    />
                )
            },
        })
    }, [])

    const actions = useActions({ loadCourses, loadMoreCourses })

    const onRefresh = () => {
        actions.loadCourses(recommendedCoursesStoreChunk)
    }

    const onLoadMore = () => {
        actions.loadMoreCourses(recommendedCoursesStoreChunk)
    }

    return (
        <View style={styles.container}>
            <CourseList
                storeChunk={recommendedCoursesStoreChunk}
                onRefresh={onRefresh}
                onLoadMore={onLoadMore}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
})
