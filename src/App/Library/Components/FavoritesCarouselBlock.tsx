import { memo } from 'react'
import { ListRenderItemInfo, StyleSheet } from 'react-native'

import { useScoreInfoScreenFeatureFlag } from '@mu-native/ab'
import { useOpenScorePlay } from '@mu-native/score'
import { CarouselList } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { libraryTestIds } from '@mu/mu-mobile-test-id'

import { ScoreListItem } from '../../Elements/scoreListItem/ScoreListItem'
import type { MSScoreT } from '../../Model/MSScore'
import { isTablet } from '../../Utils/Platform'

const keyExtractor = (item: { id: number }) => String(item.id)

type TProps = {
    favorites: MSScoreT[]
    openFavorites: () => void
    openScore?: (score: MSScoreT) => void
}

const ITEM_HEIGHT = isTablet ? 180 : 160

const getItemLayout = (_: unknown, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
})

export const FavoritesCarouselBlock = memo(({ favorites, openFavorites, openScore }: TProps) => {
    const openScorePlay = useOpenScorePlay()
    const showPlayShortcut = useScoreInfoScreenFeatureFlag()

    if ((favorites?.length ?? 0) === 0) return null

    const renderItem = ({ item }: ListRenderItemInfo<MSScoreT>) => {
        return (
            <ScoreListItem
                key={item?.id}
                score={item}
                onScorePress={openScore}
                onScorePlayPress={showPlayShortcut ? openScorePlay : undefined}
                variant="favorites"
            />
        )
    }

    return (
        <CarouselList
            testID={libraryTestIds.components.recentFavoritesCarousel}
            title={translate('native.library.recent_favorites')}
            onTitlePress={openFavorites}
            data={favorites}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            extraData={favorites.length}
            style={styles.carouselContent}
        />
    )
})

const styles = StyleSheet.create({
    carouselContent: {
        height: ITEM_HEIGHT,
    },
})
