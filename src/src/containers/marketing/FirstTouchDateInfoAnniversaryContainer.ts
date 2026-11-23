import { memo, useEffect } from 'react'

import { authStoreChunk } from '@mu-native/auth'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useValues, useActions } from '@ug/store'

export const FirstTouchDateInfoAnniversaryContainer = memo(() => {
    const [dataPaymentAccountCreated, currentUserProfileInfo] = useValues([
        marketingStoreChunk.props.getDataPaymentAccountCreated,
        authStoreChunk.props.getUserProfile,
    ])
    const actions = useActions(marketingStoreChunk.actions)

    useEffect(() => {
        const profileDateCreated =
            currentUserProfileInfo?.dateCreated &&
            parseInt(String(currentUserProfileInfo.dateCreated), 10)

        const quizDateCreated =
            dataPaymentAccountCreated && parseInt(dataPaymentAccountCreated.toString(), 10)

        const firstTouchDate =
            profileDateCreated && quizDateCreated
                ? Math.min(profileDateCreated, quizDateCreated)
                : quizDateCreated || profileDateCreated

        const firstTouchDateSource = (() => {
            if (firstTouchDate === profileDateCreated) return 'profile'
            if (firstTouchDate === quizDateCreated) return 'tour'
            return 'none'
        })()

        actions.setAnniversarySplashInfo({
            firstTouchDate: firstTouchDate || null,
            firstTouchDateSource,
            daysFromFirstTouch: firstTouchDate
                ? Math.floor((new Date().getTime() / 1000 - firstTouchDate) / 60 / 60 / 24)
                : 0,
        })
    }, [dataPaymentAccountCreated, currentUserProfileInfo])

    return null
})
