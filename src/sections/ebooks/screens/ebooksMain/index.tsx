import { memo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'

import { StackNavigator, type TNavigatorParams, useAppRoute } from '@mu-native/navigation'
import { useNavHeader } from '@mu-native/navigation'
import { useInjectDynamicStoreChunk, useInjectStoreChunk } from '@ug/store'

import { isTablet } from '../../../../App/Utils/Platform'
import { ebooksScreens } from '../../../../src/navigation'

import { DigitalEbookModelFull } from './new/api/digital.ebooks.models'
import { DigitalBooksPreReview } from './new/components/DigitalBooksPreReview'
import { DigitalEbooksPromoView } from './new/components/DigitalEbooksPromoView'
import { DigitalEbookReviewsScreen } from './new/screens/DigitalEbookReviewsScreen'
import { DigitalEbooksCategoryScreen } from './new/screens/DigitalEbooksCategoryScreen'
import { DigitalEbooksDetailsScreen } from './new/screens/DigitalEbooksDetailsScreen'
import { DigitalEbooksFavoritesScreen } from './new/screens/DigitalEbooksFavoritesScreen'
import { DigitalEbooksMainScreen } from './new/screens/DigitalEbooksMainScreen'
import { DigitalEbooksPurchasedScreen } from './new/screens/DigitalEbooksPurchasedScreen'
import { DigitalEbooksSimilarScreen } from './new/screens/DigitalEbooksSimilarScreen'
import { DigitalEbookTabletDetailsScreen } from './new/screens/DigitalEbookTabletDetailsScreen'
import {
    createDigitalEbooksCategoryChunkStore,
    DigitalEbooksCategoryContext,
} from './new/stores/digital.ebooks.category.store'
import {
    createDetailsChunkStore,
    DigitalEbookDetailsContext,
} from './new/stores/DigitalEbookDetailsStore'
import {
    createDigitalEbookFavoritesChunkStore,
    DigitalEbookFavoritesContext,
} from './new/stores/DigitalEbookFavoritesStore'
import {
    createDigitalEbookPurchasedChunkStore,
    DigitalEbookPurchasedContext,
} from './new/stores/DigitalEbookPurchasedStore'
import {
    createDigitalEbookReviewsChunkStore,
    DigitalEbookReviewsContext,
} from './new/stores/DigitalEbookReviewsStore'
import {
    createDigitalEbooksSimilarChunkStore,
    DigitalEbooksSimilarContext,
} from './new/stores/DigitalEbooksSimilarStore'
import { digitalEbooksStore } from './new/stores/DigitalEbooksStore'

export { RecommendedDigitalEbooksCarousel } from './new/RecommendedDigitalEbooksCarousel'

type TEbooksMainScreenProps = {
    /** Overrides the search bar container style (e.g. tighter top padding). */
    searchBarStyle?: StyleProp<ViewStyle>
}

const NewDigitalEbooksMainScreen = memo(({ searchBarStyle }: TEbooksMainScreenProps) => {
    useInjectStoreChunk(digitalEbooksStore, 'screens')
    return <DigitalEbooksMainScreen searchBarStyle={searchBarStyle} />
})

export const EbooksMainScreen = ({ searchBarStyle }: TEbooksMainScreenProps = {}) => {
    return <NewDigitalEbooksMainScreen searchBarStyle={searchBarStyle} />
}

const DetailsScreen = () => {
    useNavHeader('', false, undefined, true)
    return (
        <>
            {!isTablet && <DigitalEbooksDetailsScreen />}
            {isTablet && <DigitalEbookTabletDetailsScreen />}
        </>
    )
}

export const EbooksPreReviewScreen = () => {
    return <DigitalBooksPreReview />
}

const EbooksReviewsScreen = () => {
    const params = useAppRoute<{
        ebookId: DigitalEbookModelFull['id']
    }>()

    const chunk = useInjectDynamicStoreChunk(
        `ebook_reviews_${params.ebookId}`,
        key => createDigitalEbookReviewsChunkStore(key, params.ebookId),
        'screens',
    )
    return (
        <DigitalEbookReviewsContext.Provider value={chunk.chunk}>
            <DigitalEbookReviewsScreen />
        </DigitalEbookReviewsContext.Provider>
    )
}

// stack used here for accessing useDigitalEbookDetailsChunk store on reivews page
const ebookDetailsStack: TNavigatorParams[] = [
    { name: ebooksScreens.ebookDetails, component: DetailsScreen },
    { name: ebooksScreens.ebooksReviewsScreen, component: EbooksReviewsScreen },
    { name: ebooksScreens.ebooksPreReviewScreen, component: EbooksPreReviewScreen },
]

const NewDigitalEbookDetailsScreen = memo(() => {
    const params = useAppRoute<{ id: string }>()
    const chunk = useInjectDynamicStoreChunk(
        `details_ebook_${params.id}`,
        key => createDetailsChunkStore(key, params.id),
        'screens',
    )

    return (
        <DigitalEbookDetailsContext.Provider value={chunk.chunk}>
            <StackNavigator screens={ebookDetailsStack} />
        </DigitalEbookDetailsContext.Provider>
    )
})

export const EbooksDetailsScreen = () => {
    return <NewDigitalEbookDetailsScreen />
}

export const EbooksCategoryScreen = () => {
    const params = useAppRoute<{ id: string }>()
    const chunk = useInjectDynamicStoreChunk(
        params.id,
        key => createDigitalEbooksCategoryChunkStore(key, params.id),
        'screens',
    )

    return (
        <DigitalEbooksCategoryContext.Provider value={chunk.chunk}>
            <DigitalEbooksCategoryScreen />
        </DigitalEbooksCategoryContext.Provider>
    )
}

export const EbooksFavoriteScreen = () => {
    const chunk = useInjectDynamicStoreChunk(
        'ebook_favorites',
        createDigitalEbookFavoritesChunkStore,
        'screens',
    )

    return (
        <DigitalEbookFavoritesContext.Provider value={chunk.chunk}>
            <DigitalEbooksFavoritesScreen />
        </DigitalEbookFavoritesContext.Provider>
    )
}

export const EbooksSimilarScreen = () => {
    const params = useAppRoute<{
        ebookId: DigitalEbookModelFull['id']
    }>()
    const chunk = useInjectDynamicStoreChunk(
        'ebook_similar',
        key => createDigitalEbooksSimilarChunkStore(key, params.ebookId),
        'screens',
    )

    return (
        <DigitalEbooksSimilarContext.Provider value={chunk.chunk}>
            <DigitalEbooksSimilarScreen />
        </DigitalEbooksSimilarContext.Provider>
    )
}

export const EbooksPurchasedScreen = () => {
    const chunk = useInjectDynamicStoreChunk(
        'ebook_purchased',
        createDigitalEbookPurchasedChunkStore,
        'screens',
    )

    return (
        <DigitalEbookPurchasedContext.Provider value={chunk.chunk}>
            <DigitalEbooksPurchasedScreen />
        </DigitalEbookPurchasedContext.Provider>
    )
}

export const EbooksDigitalPromoScreen = () => {
    return <DigitalEbooksPromoView />
}
