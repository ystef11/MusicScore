import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

type TReviewAppModuleState = {
    dontShowTillDate: number
    requestedReviewAt: number | null
}

export const reviewAppStoreChunk = createExtendedStoreChunk<TReviewAppModuleState>({
    storeKey: 'reviewApp',
    treeKey: 'modules',
})({
    initialState: {
        dontShowTillDate: 0,
        requestedReviewAt: null,
    },
    persist: ['dontShowTillDate', 'requestedReviewAt'],
    actions: {
        requestAndHide: ({ days }: { days: number }) => {
            return {
                dontShowTillDate: Date.now() + 1000 * 60 * 60 * 24 * days,
                requestedReviewAt: Date.now(),
            }
        },
        nullify: () => {
            return {
                dontShowTillDate: 0,
                requestedReviewAt: null,
            }
        },
    },
})

export const needToAskAppReview = createSelector(
    reviewAppStoreChunk.props.getDontShowTillDate,
    dontShowTillDate => Date.now() > dontShowTillDate,
)
