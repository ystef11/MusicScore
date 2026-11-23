import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import { CustomScoreListScreen } from '../CustomScoreList/CustomScoreListScreen.tsx'
import { loadMoreHubScores } from '../exploreAsyncActions.ts'

import { newForYouStoreChunk } from './newForYouStoreChunk.ts'

export const NewForYouScoreListScreen = () => {
    const actions = useActions({
        loadScores: loadMoreHubScores,
    })

    const onLoadMore = () => {
        actions.loadScores(newForYouStoreChunk)
    }

    return (
        <CustomScoreListScreen
            storeChunk={newForYouStoreChunk}
            onLoadMore={onLoadMore}
            title={translate('native.screen_explore.new_for_you')}
            analyticsPlace="New for you"
        />
    )
}
