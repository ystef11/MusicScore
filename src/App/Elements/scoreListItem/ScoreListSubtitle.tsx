import { useMemo } from 'react'
import { StyleSheet } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { getIsAuthorized } from '@mu-native/auth'
import { CarouselListTitle, layout, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

const styles = StyleSheet.create({
    subtitle: style.text({
        marginHorizontal: layout.baseMarginFromEdges,
        marginBottom: 16,
    }),
})

export const ScoreListSubtitle = () => {
    const [sort, isAuthorized] = useValues([
        searchStoreChunk.props.getSelectedSort,
        getIsAuthorized,
    ])

    const subtitle = useMemo(() => {
        if (isAuthorized) {
            return translate('native.screen_explore.selected_for_you')
        }

        const subtitleMap = {
            rating: translate('native.screen_explore.highest_rated_scores'),
            comment_count: translate('native.screen_explore.most_commented_scores'),
        } as const

        return sort && sort in subtitleMap
            ? subtitleMap[sort as keyof typeof subtitleMap]
            : translate('native.screen_explore.popular')
    }, [sort, isAuthorized])

    return (
        <CarouselListTitle
            style={styles.subtitle}
            text={subtitle}
            testID={isAuthorized ? scoreTestIds.selectedForYouTitle : undefined}
        />
    )
}
