import { memo, useEffect } from 'react'
import { batch } from 'react-redux'

import { marketingStoreChunk } from '@mu-native/marketing'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

export const RedirectLogicContainer = memo(() => {
    const [isPremiumRights] = useValues([marketingStoreChunk.props.getIsPremiumRights])
    const actions = useActions({
        setIsOpenScorePremiumModal: scoreStoreChunk.actions.setIsOpenScorePremiumModal,
        setIsOpenBuyScoreModal: scoreStoreChunk.actions.setIsOpenBuyScoreModal,
    })

    useEffect(() => {
        if (isPremiumRights) {
            batch(() => {
                actions.setIsOpenBuyScoreModal(true)
                actions.setIsOpenScorePremiumModal(false)
            })
        }
    }, [isPremiumRights])

    return null
})
