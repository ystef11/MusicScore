import { apiRequest, uploadedContracts } from '@mu-native/api'

import MSScore from '../Model/MSScore'
import { TSortParams } from '../Utils/Sort'

interface GetUserScoresParams {
    page?: number
    sort?: TSortParams
    perPage?: number
    searchText: string | undefined | null
}

export default {
    async performGetUserScoresRequest(
        userId: number,
        {
            page = 1,
            sort = { kind: 'date_updated', order: 'desc' },
            searchText,
            perPage = 15,
        }: GetUserScoresParams,
    ) {
        const { data, pagination } = await apiRequest(uploadedContracts.list, {
            params: {
                user_id: userId,
                page,
                sort: `${sort.kind}_${sort.order}`,
                text: searchText ?? undefined,
                'per-page': perPage,
            },
        })

        const scores = MSScore.processUserScoresSourceData(data)
        return { scores, ...pagination }
    },
    async deleteUserScoreRequest(scoreId: string | number) {
        await apiRequest(uploadedContracts.remove, { params: { id: scoreId } })
    },
}
