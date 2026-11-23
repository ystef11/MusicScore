import { useCallback } from 'react'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { billingThunks, marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk'
import { useDigitalEbookDetailsChunk } from '../stores/DigitalEbookDetailsStore'

export function useEbookPaywall() {
    const navigation = useAppNavigation()
    const chunk = useDigitalEbookDetailsChunk()
    const [hasFullAccess, ebook, billing, isEbookRights, ebookBalance, isAuth] = useValues([
        chunk.props.getHasFullAccess,
        chunk.props.getEbook,
        chunk.props.getBilling,
        marketingStoreChunk.props.getIsEbookRights,
        marketingStoreChunk.props.getEbookBalance,
        getIsAuthorized,
    ])
    const actions = useActions({
        setPartialFieldsCustomMarketing: marketingStoreChunk.actions.setPartialFieldsCustom,
        setIsShowTrustRatingModal: chunk.actions.setIsShowTrustRatingModal,
        buyEbookByCreditThunk: billingThunks.buyEbookByCreditThunk,
        fetchDetails: digitalEbooksThunk.fetchDetails,
        setIsVisible: authStoreChunk.actions.setIsVisible,
    })

    const presentPaywall = async () => {
        if (ebookBalance) {
            if (!isAuth) {
                actions.setIsVisible(true)
                return
            }
            await actions.buyEbookByCreditThunk({ ebookId: ebook.id })
            await actions.fetchDetails(chunk)

            return
        }
        actions.setPartialFieldsCustomMarketing({
            inAppForSale: {
                id: ebook.id,
                title: ebook.name,
                price: billing?.discountedPrice?.price,
            },
            source: marketingConstants.sources.ebooksPieceSale,
            featureText: 'marketing_text.ebook',
        })

        navigation.navigate(Screen.screenLongLanding, {
            planName: 'ebook',
            inAppItem: {
                id: ebook.id,
                title: ebook.name,
                price: billing?.discountedPrice?.price,
                previewImageUrl: ebook?.image_cover_url,
            },
        })
    }

    const presentPreReview = () => {
        navigation.push(Screen.ebooksPreReviewScreen)
    }

    const openPrePaywallScreen = useCallback(() => {
        navigation.push(Screen.ebooksPreReviewScreen)
        // actions.setIsShowTrustRatingModal(true)
    }, [navigation])

    return {
        presentPaywall,
        presentPreReview,
        isFullAccess: hasFullAccess || isEbookRights,
        openPrePaywallScreen,
        isHasCredit: ebookBalance > 0 && !(hasFullAccess || isEbookRights),
    }
}
