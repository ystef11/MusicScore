import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { CarouselListTitle, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    OffScoresBanner,
    RestoreSubscriptionBannerComponent,
    SubscriptionRecoverBanner,
} from '@mu-native/marketing'
import { useValues } from '@ug/store'

import { useScoreFiltersExp } from '../../../../../modules/ab/experiments/scoreFiltersExp.ts'
import { ScoreListSubtitle } from '../../../../Elements/scoreListItem/ScoreListSubtitle'
import { ScoreRecentlyViewed } from '../../../../Elements/scoreListItem/ScoreRecentlyViewed'
import { exploreScoreListStoreChunk } from '../../../exploreScoreListStoreChunk.ts'
import { HubList } from '../HubList/HubList'

type TScoreListHeaderProps = {
    isSearchActive: boolean
}

export const ScoreListHeader = memo(({ isSearchActive }: TScoreListHeaderProps) => {
    const [scores] = useValues([exploreScoreListStoreChunk.props.getScoresIds])
    const exp = useScoreFiltersExp()
    if (isSearchActive) {
        if (exp === 'A') return null
        return scores?.length > 0 ? (
            <CarouselListTitle style={styles.title} text={translate('native.filter.results')} />
        ) : null
    }

    return (
        <>
            <RestoreSubscriptionBannerComponent />
            <OffScoresBanner />
            <SubscriptionRecoverBanner />
            {exp === 'A' && <HubList />}
            <ScoreRecentlyViewed />
            {scores?.length > 0 && <ScoreListSubtitle />}
        </>
    )
})

const styles = StyleSheet.create({
    title: {
        marginHorizontal: layout.baseMarginFromEdges,
        marginTop: 11,
        marginBottom: 18,
    },
})
