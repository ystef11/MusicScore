import { memo, useEffect } from 'react'

import { getStoreValue } from '@mu-native/common'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { searchStoreChunk } from '@mu-native/search'
import { systemStoreChunk } from '@mu-native/system'
import { useValues } from '@ug/store'

import reportEvent from '../../../../Utils/Analytics.ts'

import { EmptyListWithTrendingScores } from './EmptyListWithTrendingScores.tsx'

export const NewEmptyList = memo(() => {
    const [network] = useValues([systemStoreChunk.props.getNetwork])
    const isOffline = network?.isConnected === false

    useEffect(() => {
        if (!isOffline) {
            reportEvent(RT_EVENTS.SEARCH_NO_RESULTS_PAGE_VIEW, {
                screen: 'SearchNoResults',
                search_session_text: getStoreValue(searchStoreChunk.props.getSearchTerm),
            })
        }
    }, [])

    return <EmptyListWithTrendingScores />
})
