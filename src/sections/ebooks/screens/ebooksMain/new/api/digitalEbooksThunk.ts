import {
    apiEndpoints,
    apiRequest,
    contentContracts,
    ebookContracts,
    errorMessage,
    isResponse,
} from '@mu-native/api'
import type { TEbookFilterParamsDto, TEbookSearchParamsDto } from '@mu-native/api'
import { sanitizeCommentBody } from '@mu-native/common'
import { showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { Screen } from '@mu-native/navigation'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { keys } from '../components/reviews/DigitalEbookRatingView'
import { DigitalEbookCategoryChunk } from '../stores/digital.ebooks.category.store'
import { DigitalEbookDetailsChunk } from '../stores/DigitalEbookDetailsStore'
import { DigitalEbookFavoritesChunk } from '../stores/DigitalEbookFavoritesStore'
import { DigitalEbookPurchasedChunk } from '../stores/DigitalEbookPurchasedStore.ts'
import { DigitalEbookReviewsChunk } from '../stores/DigitalEbookReviewsStore.ts'
import { DigitalEbooksSimilarChunk } from '../stores/DigitalEbooksSimilarStore.ts'
import { digitalEbooksStore } from '../stores/DigitalEbooksStore'

import { DigitalEbookFilters } from './digital.ebooks.models'

/** Selected filter ids per group, or `undefined` when nothing is selected. */
function gatherAllSelectedFilters(
    filters: DigitalEbookFilters['filters'],
): TEbookFilterParamsDto | undefined {
    let sendParams: TEbookFilterParamsDto | undefined
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys(filters)) {
        if (key === 'sort') {
            const selected = filters[key].find(s => s.selected)
            if (!sendParams && selected) sendParams = {}
            if (selected && sendParams) sendParams.sort = selected.type
            // eslint-disable-next-line no-continue
            continue
        }
        const ids = []
        // eslint-disable-next-line no-restricted-syntax
        for (const item of filters[key]) {
            // eslint-disable-next-line no-continue
            if (!item.selected) continue
            ids.push(item.id)
        }
        if (!sendParams && ids.length > 0) sendParams = {}
        if (ids.length > 0 && sendParams) sendParams[key] = ids
    }
    return sendParams
}

function mergeFilters(
    filters: DigitalEbookFilters['filters'],
    allSelected?: TEbookFilterParamsDto,
) {
    if (!allSelected) return
    // eslint-disable-next-line no-restricted-syntax
    for (const key of keys(filters)) {
        const selected = allSelected[key]
        // eslint-disable-next-line no-continue
        if (!selected) continue
        const items = filters[key]
        // eslint-disable-next-line no-restricted-syntax
        for (const item of items) {
            if ('type' in item) {
                item.selected = selected.includes(item.type)
            } else {
                item.selected = selected.includes(item.id)
            }
        }
    }
}

// Personalized section in the catalog feed; skipped when sourcing the
// non-personalized recommendation carousel.
const RECENTLY_VIEWED_SECTION = 'recently-viewed'

export const digitalEbooksThunk = {
    fetchInitial() {
        return async (dispatch: any) => {
            try {
                const response = await apiRequest(ebookContracts.sections)
                dispatch(digitalEbooksStore.actions.setEbooks(response))
                dispatch(digitalEbooksStore.actions.setUiListResult({ type: 'feed' }))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchInitial.error]', e)
            } finally {
                dispatch(digitalEbooksStore.actions.setIsInitialLoading(false))
            }
        }
    },

    searchEbooks(params?: { isFetchingMore?: boolean }) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            const chunk = digitalEbooksStore
            try {
                const isDidEndReached = chunk.props.getDidSearchEndReached(getState())
                if (isDidEndReached) return
                const isFetching = chunk.props.getIsSearchFetchingMore(getState())
                if (isFetching) return
                dispatch(chunk.actions.setIsSearchFetchingMore(params?.isFetchingMore ?? false))

                dispatch(chunk.actions.setIsSearching(true))
                const filters = chunk.props.getFilters(getState())
                const searchText = chunk.props.getSearchText(getState())
                const selectedFilters = filters
                    ? gatherAllSelectedFilters(filters.filters)
                    : undefined
                if (!selectedFilters && !searchText) return

                if (!(params?.isFetchingMore ?? false)) {
                    dispatch(digitalEbooksStore.actions.setUiListResult({ type: 'searching' }))
                }

                const perPage = 20
                const page = chunk.props.getSearchPage(getState())
                const sendParams: TEbookSearchParamsDto = {
                    ...selectedFilters,
                    text: searchText,
                    'per-page': perPage,
                    page,
                }

                const response = await apiRequest(ebookContracts.search, { params: sendParams })
                const isEndReached =
                    response.ebooks.length === 0 || response.ebooks.length < perPage
                dispatch(chunk.actions.setSearchPage(page + 1))
                const ebooks = chunk.props.getSearchEbooksResult(getState())
                const newData = [...ebooks, ...response.ebooks]
                dispatch(
                    digitalEbooksStore.actions.setUiListResult({ type: 'search', data: newData }),
                )
                dispatch(chunk.actions.setSearchEbooksResult(newData))
                dispatch(chunk.actions.setDidSearchEndReached(isEndReached))
            } catch (e) {
                dispatch(
                    digitalEbooksStore.actions.setUiListResult({ type: 'searchEmpty', data: [] }),
                )
                console.log('🍓[DigitalEbooksApi.searchEbooks.error]', e)
            } finally {
                dispatch(chunk.actions.setIsSearching(false))
                if (chunk.props.getIsSearchFetchingMore(getState()))
                    dispatch(chunk.actions.setIsSearchFetchingMore(false))
            }
        }
    },

    fetchInitialFilters(isInitial: boolean) {
        return async (dispatch: any) => {
            try {
                dispatch(digitalEbooksStore.actions.setIsLoadingFilters(isInitial))
                const response = await apiRequest(ebookContracts.filterOptions, { params: {} })
                const filters = {
                    total_count: response.total_count,
                    filter_types: response.filter_types,
                    filters: response.filters,
                }
                dispatch(digitalEbooksStore.actions.setFilters({ ...filters }))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchInitialFilters.error]', e)
            } finally {
                dispatch(digitalEbooksStore.actions.setIsLoadingFilters(false))
            }
        }
    },

    updateFilterItem: (params?: { id: string; type: keyof DigitalEbookFilters['filters'] }) => {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                if (params) {
                    dispatch(digitalEbooksStore.actions.setIsUpdatingFilter(true))
                    dispatch(digitalEbooksStore.actions.updateFilterSelected(params))
                }
                let filters = digitalEbooksStore.props.getFilters(getState())
                const searchText = digitalEbooksStore.props.getSearchText(getState())
                const selectedFilters = filters
                    ? gatherAllSelectedFilters(filters.filters)
                    : undefined
                dispatch(digitalEbooksStore.actions.setHasAnySelectedFilter(!!selectedFilters))
                const sendParams: TEbookSearchParamsDto = {
                    ...selectedFilters,
                    ...(searchText && { text: searchText }),
                }

                const response = await apiRequest(ebookContracts.filterOptions, {
                    params: sendParams,
                })
                mergeFilters(response.filters, selectedFilters)
                filters = {
                    ...filters,
                    total_count: response.total_count,
                    filter_types: response.filter_types,
                    filters: response.filters,
                }
                dispatch(digitalEbooksStore.actions.setFilters({ ...filters }))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.updateFilterItem.error]', e)
            } finally {
                dispatch(digitalEbooksStore.actions.setIsUpdatingFilter(false))
                dispatch(digitalEbooksStore.actions.setIsLoadingFilters(false))
            }
        }
    },

    fetchCategory(chunk: DigitalEbookCategoryChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const isDidEndReached = chunk.props.getDidEndReached(getState())
                if (isDidEndReached) return
                const isFetchingMore = chunk.props.getIsFetchingMore(getState())
                if (isFetchingMore) return
                const isInitialLoading = chunk.props.getIsInitialLoading(getState())
                if (!isInitialLoading) dispatch(chunk.actions.setIsFetchingMore(true))

                const perPage = 20
                const page = chunk.props.getPage(getState())
                const response = await apiRequest(ebookContracts.sectionInfo, {
                    params: {
                        uri: chunk.props.getCategoryId(getState()),
                        page,
                        'per-page': perPage,
                    },
                })
                const isEndReached = response.data.length === 0 || response.data.length < perPage
                const ebooks = chunk.props.getEbooks(getState())
                dispatch(chunk.actions.setEbooks([...ebooks, ...response.data]))
                dispatch(chunk.actions.setPage(page + 1))
                dispatch(chunk.actions.setDidEndReached(isEndReached))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchCategory.error]', e)
                dispatch(chunk.actions.setDidEndReached(true))
            } finally {
                if (chunk.props.getIsFetchingMore(getState()))
                    dispatch(chunk.actions.setIsFetchingMore(false))
                if (chunk.props.getIsInitialLoading(getState()))
                    dispatch(chunk.actions.setIsInitialLoading(false))
            }
        }
    },

    // Populates the category chunk from the non-personalized catalog feed so the
    // recommendation carousel renders even for accounts without ebook history
    // (where `most-popular-without-favorite` comes back empty). The section-list
    // endpoint only returns a small preview per section, so we use it to discover
    // the first non-personalized section's uri, then fetch that section's full
    // contents via section/info.
    fetchRecommendedSection(chunk: DigitalEbookCategoryChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const list = await apiRequest(ebookContracts.sections)
                const target = list.find(
                    section => section.uri !== RECENTLY_VIEWED_SECTION && section.data.length > 0,
                )
                if (!target) return

                dispatch(chunk.actions.setCategoryId(target.uri))
                const response = await apiRequest(ebookContracts.sectionInfo, {
                    params: { uri: target.uri, page: 1, 'per-page': 20 },
                })
                dispatch(chunk.actions.setEbooks(response.data))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchRecommendedSection.error]', e)
            } finally {
                dispatch(chunk.actions.setDidEndReached(true))
                if (chunk.props.getIsInitialLoading(getState()))
                    dispatch(chunk.actions.setIsInitialLoading(false))
            }
        }
    },

    fetchFavorites(chunk: DigitalEbookFavoritesChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            const searchText = chunk.props.getSearchText(getState())
            try {
                dispatch(chunk.actions.setIsLoadingMore(false))
                dispatch(chunk.actions.resetPagination())
                const response = await apiRequest(ebookContracts.favorites, {
                    params: { page: 1, text: searchText },
                })
                dispatch(chunk.actions.setState({ type: 'ebooks', data: response.ebooks }))
            } catch (e) {
                dispatch(
                    chunk.actions.setState({ type: searchText.length ? 'emptySearch' : 'empty' }),
                )
                console.log('🍓[DigitalEbooksApi.fetchFavorites.error]', e)
            } finally {
                dispatch(chunk.actions.setIsSearching(false))
            }
        }
    },

    fetchMoreFavorites(chunk: DigitalEbookFavoritesChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const endReached = chunk.props.getDidReachedEnd(getState())
                const loadMore = chunk.props.getIsLoadingMore(getState())
                if (endReached || loadMore) return
                dispatch(chunk.actions.setIsLoadingMore(true))
                const searchText = chunk.props.getSearchText(getState())
                const page = chunk.props.getPage(getState()) + 1
                const response = await apiRequest(ebookContracts.favorites, {
                    params: { page, text: searchText },
                })
                if (response.ebooks.length === 0) {
                    dispatch(chunk.actions.setDidReachedEnd(true))
                }
                dispatch(chunk.actions.setIsLoadingMore(false))
                dispatch(chunk.actions.setPage(page))
                const currentState = chunk.props.getState(getState())
                const data =
                    currentState.type === 'ebooks'
                        ? [...currentState.data, ...response.ebooks]
                        : response.ebooks
                dispatch(chunk.actions.setState({ type: 'ebooks', data }))
            } catch (e) {
                dispatch(chunk.actions.setDidReachedEnd(true))
                dispatch(chunk.actions.setIsLoadingMore(false))
                console.log('🍓[DigitalEbooksApi.fetchFavorites.error]', e)
            }
        }
    },

    fetchPurchased(chunk: DigitalEbookPurchasedChunk) {
        return async (dispatch: any) => {
            try {
                const response = await apiRequest(ebookContracts.purchased)
                dispatch(chunk.actions.setState({ type: 'ebooks', data: response.ebooks }))
            } catch (e: any) {
                if (isResponse(e) && e.status === 404) {
                    dispatch(chunk.actions.setState({ type: 'ebooks', data: [] }))
                } else {
                    dispatch(chunk.actions.setState({ type: 'error', data: e.toString() }))
                    console.log('🍓[DigitalEbooksApi.fetchPurchased.error]', e)
                }
            }
        }
    },

    fetchDetails(chunk: DigitalEbookDetailsChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const ebookId = chunk.props.getEbookId(getState())
                const response = await apiRequest(ebookContracts.info, { params: { id: ebookId } })
                const ebook = response
                const isEbookRights = marketingStoreChunk.props.getIsEbookRights(getState())
                dispatch(chunk.actions.setBilling(response.billing))
                dispatch(chunk.actions.setEbook(ebook))
                dispatch(chunk.actions.setHasFullAccess(isEbookRights || response.has_access))
                dispatch(chunk.actions.setSimilarEbooks(response.similarEbooks))
                dispatch(chunk.actions.setIsFavorite(response.is_favorite))
                dispatch(chunk.actions.setIsRated(!!response.rating.user_rating))
                dispatch(chunk.actions.setRating(response.rating))
                dispatch(digitalEbooksStore.actions.updateRecentlyViewed(ebook))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchDetails.error]', e)
            } finally {
                if (chunk.props.getIsInitialLoading(getState()))
                    dispatch(chunk.actions.setIsInitialLoading(false))
            }
        }
    },

    toggleFavorite(chunk: DigitalEbookDetailsChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                dispatch(chunk.actions.setIsUpdatingFavorite(true))
                const { id } = chunk.props.getEbook(getState())
                const isFavorite = chunk.props.getIsFavorite(getState())
                if (isFavorite) {
                    reportEvent(MetricaEvents.SONGBOOK_UN_FAVORITE_CLICK, {
                        screen: Screen.ebookDetails,
                        songbook_id: id,
                    })
                    await apiRequest(ebookContracts.removeFavorite, { params: { id } })
                    showAlertNotification({
                        text: translate('native.ebooks.removed_from_favorite'),
                    })
                } else {
                    reportEvent(MetricaEvents.SONGBOOK_FAVORITE_CLICK, {
                        screen: Screen.ebookDetails,
                        songbook_id: id,
                    })
                    await apiRequest(ebookContracts.addFavorite, { payload: { id } })
                    showAlertNotification({ text: translate('native.ebooks.added_to_favorite') })
                }
                dispatch(chunk.actions.setIsFavorite(!isFavorite))
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e) })
                }
                console.log('🍓[DigitalEbooksApi.toggleFavorite.error]', e)
            } finally {
                dispatch(chunk.actions.setIsUpdatingFavorite(false))
            }
        }
    },

    removeBookFromFavorite(id: string) {
        return async () => {
            try {
                reportEvent(MetricaEvents.SONGBOOK_UN_FAVORITE_CLICK, {
                    screen: Screen.ebookDetails,
                    songbook_id: id,
                })
                await apiRequest(ebookContracts.removeFavorite, { params: { id } })
                const text = translate('native.ebooks.removed_from_favorite')
                showAlertNotification({ text })
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e) })
                }
                console.log('🍓[DigitalEbooksApi.toggleFavorite.error]', e)
            }
        }
    },

    rateBook(rating: number, chunk: DigitalEbookDetailsChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                dispatch(chunk.actions.setIsUpdatingRating(true))
                const { id } = chunk.props.getEbook(getState())
                await apiRequest(ebookContracts.rate, { payload: { id, rating } })
                showAlertNotification({ text: translate('native.ebooks.rate_success') })

                dispatch(chunk.actions.updateUserRating(rating))
                return true
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e) })
                }
                console.log('🍓[DigitalEbooksApi.rateBook.error]', e)
                return false
            } finally {
                dispatch(chunk.actions.setIsUpdatingRating(false))
            }
        }
    },

    fetchReviews(chunk: DigitalEbookReviewsChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const ebook_id = chunk.props.getEbookId(getState())
                const response = await apiRequest(ebookContracts.comments, { params: { ebook_id } })
                dispatch(chunk.actions.setResponse(response))
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.fetchReviews.error]', e)
            } finally {
                dispatch(chunk.actions.setIsInitialLoading(false))
            }
        }
    },

    deleteReview(id: number, chunk: DigitalEbookReviewsChunk) {
        return async (dispatch: any) => {
            try {
                dispatch(chunk.actions.deleteReview(id))
                await apiRequest(ebookContracts.removeComment, { params: { id } })
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e), position: 'top' })
                }
                console.log('🍓[DigitalEbooksApi.deleteReview.error]', e)
            }
        }
    },

    createReview(id: string, body: string, chunk: DigitalEbookReviewsChunk) {
        return async (dispatch: any) => {
            try {
                const response = await apiRequest(ebookContracts.addComment, {
                    payload: { id, body: sanitizeCommentBody(body) },
                })
                dispatch(chunk.actions.addReview(response))
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e), position: 'top' })
                }
                console.log('🍓[DigitalEbooksApi.createReview.error]', e)
            }
        }
    },

    toggleLikeReview(reviewId: number, isLiked: boolean, chunk: DigitalEbookReviewsChunk) {
        return async (dispatch: any) => {
            try {
                const target = { object_id: reviewId, object: 'ebook_comment' } as const
                if (isLiked) {
                    await apiRequest(contentContracts.unlike, { params: target })
                } else {
                    await apiRequest(contentContracts.like, { payload: target })
                }
                dispatch(chunk.actions.toggleLike({ id: reviewId, isLiked: !isLiked }))
            } catch (e) {
                if (isResponse(e)) {
                    showAlertNotification({ text: await errorMessage(e) })
                }
                console.log('🍓[DigitalEbooksApi.toggleLikeReview.error]', e)
            }
        }
    },

    searchSuggestions(query: string) {
        return async (dispatch: any) => {
            try {
                query = query.toLowerCase()
                let baseUrl = apiEndpoints.ebookSuggestions
                baseUrl += `${query[0]}/`
                baseUrl += `${query.slice(0, 5)}.js`
                const response = await fetch(baseUrl)
                const json = await response.json()

                if (json.suggestions) {
                    dispatch(digitalEbooksStore.actions.setSuggestions(json.suggestions))
                } else {
                    dispatch(digitalEbooksStore.actions.setSuggestions([]))
                }
            } catch (e) {
                console.log('🍓[DigitalEbooksApi.searchSuggestions.error]', e)
            }
        }
    },

    fetchSimilar(chunk: DigitalEbooksSimilarChunk) {
        return async (dispatch: any, getState: (...args: Array<any>) => any) => {
            try {
                const page = chunk.props.getPage(getState())
                const ebook_id = chunk.props.getEbookId(getState())
                dispatch(chunk.actions.setIsFetchingMore(true))
                const response = await apiRequest(ebookContracts.similar, {
                    params: { page, ebook_id },
                })
                dispatch(chunk.actions.setNewState(response.items))
            } catch (e: any) {
                dispatch(chunk.actions.setState({ type: 'error', data: e.toString() }))
                console.log('🍓[DigitalEbooksApi.fetchSimilar.error]', e)
            }
        }
    },
}
