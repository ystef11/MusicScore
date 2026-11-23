import { memo, useCallback } from 'react'
import { FlatList, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    Icon,
    layout,
    presentAlert,
    SkeletonLoaderWrapper,
} from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, marketingThunks } from '@mu-native/marketing'
import { scoreStoreChunk, useOpenScore } from '@mu-native/score'
import { checkConnectionSafely } from '@mu-native/system'
import { useActions } from '@ug/store'

import { toggleFavoriteAndRateScore } from '../../../../../App/Controllers/ScoreActionsController.ts'
import { ScoreListItem } from '../../../../../App/Elements/scoreListItem/ScoreListItem.tsx'
import { screenExploreThunks } from '../../../../../App/Explore/ScreenExplore/thunks/thunks.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'

type Props = {
    onClose: () => void
    searchTerm: string
    scores: MSScoreT[]
    isLoading: boolean
}

const keyExtractor = (score: MSScoreT) => String(score.id)
const skeletonRows = [0, 1, 2, 3, 4, 5]
const SKELETON_THUMBNAIL_SIZE = 90

const styles = StyleSheet.create({
    list: {
        flex: 1,
    },
    listContent: {
        flexGrow: 1,
        paddingBottom: 24,
        rowGap: 16,
    },
    empty: {
        flex: 1,
        alignSelf: 'center',
        width: layout.baseMaxWidth,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    emptyTitle: {
        marginTop: 12,
        marginBottom: 8,
    },
    emptyMessage: {
        marginTop: 8,
        lineHeight: 20,
    },
    skeleton: {
        rowGap: 16,
    },
    skeletonRow: {
        flexDirection: 'row',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    skeletonThumbnail: {
        width: SKELETON_THUMBNAIL_SIZE,
        height: SKELETON_THUMBNAIL_SIZE,
        backgroundColor: brandColors.backgroundInactive,
    },
    skeletonText: {
        flex: 1,
        marginStart: 8,
        rowGap: 4,
    },
    skeletonTitle: {
        width: '80%',
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    skeletonAuthor: {
        width: '50%',
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    skeletonDescription: {
        width: '65%',
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
})

const ScoresSkeleton = () => (
    <SkeletonLoaderWrapper style={styles.skeleton}>
        {skeletonRows.map(row => (
            <View key={row} style={styles.skeletonRow}>
                <View style={styles.skeletonThumbnail} />
                <View style={styles.skeletonText}>
                    <View style={styles.skeletonTitle} />
                    <View style={styles.skeletonAuthor} />
                    <View style={styles.skeletonDescription} />
                </View>
            </View>
        ))}
    </SkeletonLoaderWrapper>
)

const EmptyScores = memo(({ searchTerm }: { searchTerm: string }) => (
    <View style={styles.empty}>
        <Icon source={search} size={48} tint={brandColors.contentPrimary} />
        {!!searchTerm && (
            <AppText
                rawText={translate('native.search.no.results_for_query', {
                    query: `'${searchTerm}'`,
                })}
                font="f20w600"
                textAlign="center"
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.emptyTitle}
            />
        )}
        <AppText
            rawText={translate('native.search.empty')}
            font="f15w400"
            textAlign="center"
            style={styles.emptyMessage}
        />
    </View>
))

export const ScoresListContainer = memo(({ onClose, searchTerm, scores, isLoading }: Props) => {
    const openScore = useOpenScore()

    const actions = useActions({
        setInAppInfo: marketingStoreChunk.actions.setInAppForSale,
        onScoreItemPress: screenExploreThunks.onScoreItemPress,
        checkOpenScoreForSaleThunk: marketingThunks.checkOpenScoreForSaleThunk,
        toggleFavoriteAndRateScore,
        setFirstSessionOnboardingStep: scoreStoreChunk.actions.setFirstSessionOnboardingStep,
        setOnboarded: scoreStoreChunk.actions.setOnboarded,
    })

    const handleItemPress = useCallback(
        (score: MSScoreT) => {
            if (score?.score_blocked_by_country) {
                presentAlert({ rawTitle: translate('native.score.blocked.in.country') })
                return
            }

            actions.checkOpenScoreForSaleThunk({
                ui: 'Browse',
                score,
                callbackAfterCheck: () => {
                    if (!checkConnectionSafely()) {
                        return
                    }

                    if (!score?.isPdf) {
                        actions.setOnboarded(true)
                        actions.setFirstSessionOnboardingStep(0)
                    }
                    actions.onScoreItemPress(score, {
                        'params.key': ['place'],
                        'params.str_value': ['Browse first session modal'],
                        'params.value': [0],
                    })
                    onClose()
                    openScore(score)
                },
            })
        },
        [actions, openScore, onClose],
    )

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<MSScoreT>) => (
            <ScoreListItem score={item} onScorePress={handleItemPress} />
        ),
        [handleItemPress],
    )

    return (
        <FlatList
            style={styles.list}
            data={scores}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            extraData={scores.length}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
                isLoading ? <ScoresSkeleton /> : <EmptyScores searchTerm={searchTerm.trim()} />
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
        />
    )
})
