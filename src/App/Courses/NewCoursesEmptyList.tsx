import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout, useScrollableHeader } from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import { coursesTestIds } from '@mu/mu-mobile-test-id'
import { translate } from '@mu-native/locale'

export const NewCoursesEmptyList = memo(() => {
    const { contentPaddingTop } = useScrollableHeader()
    return (
        <View
            style={[styles.emptyContainer, { paddingTop: contentPaddingTop }]}
            testID={coursesTestIds.courseList}
        >
            <View testID={coursesTestIds.courseSearchEmptyState}>
                <Icon
                    source={search}
                    size={48}
                    style={{alignSelf: 'center'}}
                    tint={brandColors.contentPrimary}
                />
                <AppText
                    testID={coursesTestIds.courseSearchEmptyStateTitle}
                    rawText={translate('native.search.no.results')}
                    font="f15w500"
                    textAlign="center"
                    style={styles.title}
                />
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignSelf: 'center',
        width: layout.baseMaxWidth,
        alignItems: 'center',
        marginTop: 32,
    },

    title: {
        marginTop: 12,
        marginBottom: 8,
    },
})
