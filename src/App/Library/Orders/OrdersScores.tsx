import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useOpenScore } from '@mu-native/score'
import { colors, layout, layoutHelpers, style, BrandAppLoader, useAppSafeArea } from '@mu-native/ds'
import {
    RestorePurchasesEmptyState,
    RestorePurchasesFooter,
    useRestoreLibraryPurchases,
} from '@mu-native/library-purchases'
import { CreditBalanceItemComponent, marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { checkConnectionSafely } from '@mu-native/system'
import {
    createUniversalScoreListDynamicStoreChunk,
    UniversalScoreListContext,
    useUniversalScoreListContext,
} from '@mu-native/universal-score-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'
import type { MSScoreT } from '../../Model/MSScore'
import MSFlashList, { ListLoaderComponent } from '../../MSComponents/MSFlashList'

import { loadMoreOrders, updateOrders } from './ordersScoresThunks'

const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        backgroundColor: colors.white,
    }),
    splashContainer: style.view({
        ...StyleSheet.absoluteFill,
        backgroundColor: colors.white,
        justifyContent: 'center',
    }),
    balanceItemWrapper: style.view({
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(14),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(0),
        marginBottom: -layoutHelpers.getResponsiveSizeExtended(18),
    }),
})

const OrdersCourses = () => {
    const openScore = useOpenScore()
    const insets = useAppSafeArea()
    const { updateOrdersThunk, loadMoreOrdersThunk, setScore, setSource } =
        useActions({
            updateOrdersThunk: updateOrders,
            loadMoreOrdersThunk: loadMoreOrders,
            setScore: marketingStoreChunk.actions.setInAppForSale,
            setSource: marketingStoreChunk.actions.setSource,
        })

    const scoreListChunk = useUniversalScoreListContext()

    const [ordersScoreIds, orderScoresMap, isLoading, currentPage, totalPages, totalItems] =
        useValues([
            scoreListChunk.props.getScoresIds,
            scoreListChunk.props.getScoresMap,
            scoreListChunk.props.getIsLoading,
            scoreListChunk.props.getCurrentPage,
            scoreListChunk.props.getTotalPages,
            scoreListChunk.props.getTotalItems,
        ])
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [refreshing, setRefreshing] = useState(false)

    const ordersScores = useMemo(() => {
        return ordersScoreIds.map(id => orderScoresMap[id]).filter(Boolean)
    }, [ordersScoreIds, orderScoresMap])

    useEffect(() => {
        ;(async () => {
            await updateOrdersThunk(scoreListChunk)
            setIsFirstLoad(false)
        })()
    }, [])

    useEffect(() => {
        setSource(marketingConstants.sources.pieceSaleOrdersBalance)
    }, [])

    const onLoadMore = useCallback(() => {
        loadMoreOrdersThunk(scoreListChunk)
    }, [loadMoreOrdersThunk, scoreListChunk])

    const onItemPress = (score: MSScoreT) => {
        setScore({
            id: score?.id,
            title: score?.title,
            isPurchased: score?.isPurchased,
        })
        openScore(score, {
            screen: 'SongBookScreen',
        })
    }

    const onRefresh = useCallback(async () => {
        if (!checkConnectionSafely()) return
        setRefreshing(true)
        try {
            await updateOrdersThunk(scoreListChunk)
        } finally {
            setRefreshing(false)
        }
    }, [scoreListChunk, updateOrdersThunk])

    const refreshPurchasedList = useCallback(async () => {
        await updateOrdersThunk(scoreListChunk)
    }, [scoreListChunk, updateOrdersThunk])
    const { isRestoring, isRestoreAvailable, restorePurchases } = useRestoreLibraryPurchases({
        currentCount: totalItems,
        refreshPurchasedList,
    })

    const listContentStyle = useMemo(
        () => ({
            paddingTop: 12,
            // Keep the restore footer clear of the screen edge / home indicator.
            paddingBottom: insets.bottom + layout.marginMd,
        }),
        [insets.bottom],
    )

    if (isLoading && isFirstLoad)
        return (
            <View style={styles.splashContainer}>
                <BrandAppLoader />
            </View>
        )

    if (!ordersScores?.length) {
        return (
            <View style={styles.container}>
                <RestorePurchasesEmptyState
                    isRestoring={isRestoring}
                    onRestorePress={restorePurchases}
                    showRestoreAction={isRestoreAvailable}
                />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <View style={styles.balanceItemWrapper}>
                <CreditBalanceItemComponent />
            </View>
            <MSFlashList
                scores={ordersScores}
                hasSearchFilter={false}
                onItemPress={onItemPress}
                enablePlayShortcut
                onRefresh={onRefresh}
                isLoading={isLoading}
                refreshing={refreshing}
                loadMore={onLoadMore}
                containerStyle={listContentStyle}
                ListFooterComponent={
                    <>
                        {!refreshing && isLoading && <ListLoaderComponent />}
                        {isRestoreAvailable && (
                            <RestorePurchasesFooter
                                isRestoring={isRestoring}
                                onRestorePress={restorePurchases}
                            />
                        )}
                    </>
                }
            />
        </View>
    )
}

const OrderCoursesContainer = () => {
    const { chunk } = useInjectDynamicStoreChunk('order_scores', key =>
        createUniversalScoreListDynamicStoreChunk(key, 0),
    )

    return (
        <UniversalScoreListContext.Provider value={chunk}>
            <OrdersCourses />
        </UniversalScoreListContext.Provider>
    )
}

export default OrderCoursesContainer
