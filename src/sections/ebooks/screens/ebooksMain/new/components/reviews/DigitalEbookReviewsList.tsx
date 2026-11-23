import { memo, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import { layout } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { DigitalEbookReviewModel } from '../../api/digital.ebooks.models.ts'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { useDigitalEbookReviewsChunk } from '../../stores/DigitalEbookReviewsStore.ts'

import { DigitalEbookRatingView } from './DigitalEbookRatingView.tsx'
import { DigitalEbookReviewsListEmpty } from './DigitalEbookReviewsListEmpty.tsx'
import { DigitalEbookReviewsListFooter } from './DigitalEbookReviewsListFooter.tsx'
import { DigitalEbookReviewsListHeader } from './DigitalEbookReviewsListHeader.tsx'
import { DigitalEbookReviewsListItem } from './DigitalEbookReviewsListItem.tsx'

export const DigitalEbookReviewsList = memo(() => {
    const chunk = useDigitalEbookReviewsChunk()
    const [reviews] = useValues([chunk.props.getReviews])
    const actions = useActions({
        toggleLikeReview: digitalEbooksThunk.toggleLikeReview,
        deleteReview: digitalEbooksThunk.deleteReview,
        presentAuth: authStoreChunk.actions.presentAuthModal,
    })

    const onLikePress = useCallback(
        async (reviewId: number, isLiked: boolean, setLiking: (value: boolean) => void) => {
            const isAuthorized = getStoreValue(getIsAuthorized)

            const like = async () => {
                try {
                    setLiking(true)
                    await actions.toggleLikeReview(reviewId, isLiked, chunk)
                } finally {
                    setLiking(false)
                }
            }

            if (!isAuthorized) actions.presentAuth(like)
            if (isAuthorized) like()
        },
        [actions, chunk],
    )

    const onDeletePress = useCallback(
        async (reviewId: number) => {
            actions.deleteReview(reviewId, chunk)
        },
        [actions, chunk],
    )

    const renderItem = useCallback(
        (info: ListRenderItemInfo<DigitalEbookReviewModel>) => {
            return (
                <DigitalEbookReviewsListItem
                    onDeletePress={onDeletePress}
                    onLikePress={onLikePress}
                    item={info.item}
                />
            )
        },
        [onLikePress, onDeletePress],
    )

    return (
        <>
            <FlatList
                ListHeaderComponent={
                    <>
                        <DigitalEbookRatingView />
                        <DigitalEbookReviewsListHeader />
                    </>
                }
                contentContainerStyle={
                    reviews.length === 0 ? styles.contentContainer2 : styles.contentContainer
                }
                initialNumToRender={reviews.length}
                data={reviews}
                ListEmptyComponent={DigitalEbookReviewsListEmpty}
                renderItem={renderItem}
            />
            <DigitalEbookReviewsListFooter />
        </>
    )
})

const styles = StyleSheet.create({
    contentContainer: {
        rowGap: 16,
        marginTop: 20,
        paddingBottom: 10,
        marginHorizontal: layout.baseMarginFromEdges,
    },

    contentContainer2: {
        rowGap: 16,
        marginTop: 20,
        marginHorizontal: layout.baseMarginFromEdges,
        flex: 1,
    },
})
