import { searchStoreChunk } from '@mu-native/search'
import { checkConnectionSafely } from '@mu-native/system'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import MetricaEvents from '../../../constants/MetricaEvents'
import { getScoreMetaEvent } from '../../../constants/scoreAnalytic'
import { MSScoreT } from '../../../Model/MSScore'
import { doFetchScores } from '../../../Services/SearchProvider'
import reportEvent from '../../../Utils/Analytics'

const cancelSearch = (chunk: TUniversalScoreListDynamicStoreChunk) => async (dispatch: any) => {
    try {
        reportEvent(MetricaEvents.SEARCH_CANCEL, { ui: 'scores' })

        dispatch(searchStoreChunk.actions.setSearchTerm(''))
        dispatch(chunk.actions.setScores([]))
        dispatch(chunk.actions.resetPagination())
        dispatch(doFetchScores(chunk))
    } catch (error) {
        console.log('cancelSearch ERROR', error)
    }
}

const search =
    (
        chunk: TUniversalScoreListDynamicStoreChunk,
        searchTerm: string,
        no_search_correction: boolean | undefined = undefined,
    ) =>
    async (dispatch: any) => {
        try {
            if (searchTerm) {
                reportEvent(MetricaEvents.SEARCH_SUCCESS, { text: searchTerm || '', ui: 'scores' })
                dispatch(searchStoreChunk.actions.addToSearchHistory(searchTerm.trim()))
            }

            dispatch(searchStoreChunk.actions.setSearchTerm(searchTerm))
            dispatch(chunk.actions.setScores([]))
            await dispatch(doFetchScores(chunk, 1, false, no_search_correction))
        } catch (error) {
            console.log('search ERROR', error)
        }
    }

const onScoreItemPress =
    (
        score: MSScoreT,
        eventParams?: {
            'params.key': string[]
            'params.str_value': string[]
            'params.value': any[]
        },
    ) =>
    async () => {
        if (!checkConnectionSafely()) return
        reportEvent(
            MetricaEvents.SCORE_CLICK,
            getScoreMetaEvent(score, score?.isOfficial, eventParams ?? { place: 'Explore' }),
        )
    }

export const screenExploreThunks = {
    get cancelSearch() {
        return cancelSearch
    },
    get search() {
        return search
    },
    onScoreItemPress,
}
