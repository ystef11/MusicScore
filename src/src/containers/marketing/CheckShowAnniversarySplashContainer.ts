import { memo, useEffect } from 'react'
import { useValues, useActions } from '@ug/store'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'

export const CheckShowAnniversarySplashContainer = memo(() => {
    const [isPro, lastShownDays, { daysFromFirstTouch }] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getLastShownDaysAnniversarySplash,
        marketingStoreChunk.props.getAnniversarySplashInfo,
    ])
    const { setIsNeedShowAnniversarySplash } = useActions(marketingStoreChunk.actions)

    useEffect(() => {
        const isNeedToShowAnniversarySplash =
            !isPro &&
            lastShownDays < marketingConstants.maxDaysToShowAnniversary &&
            (daysFromFirstTouch || 0) - lastShownDays >=
                marketingConstants.everyHowManyDaysShowAnniversary

        setIsNeedShowAnniversarySplash(isNeedToShowAnniversarySplash)
    }, [isPro, daysFromFirstTouch])

    return null
})
