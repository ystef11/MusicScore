import { useEffect } from 'react'

import { marketingStoreChunk } from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

export const useReferralScoreLogic = () => {
    const [referralData] = useValues([marketingStoreChunk.props.getReferralData])
    const navigation = useAppNavigation()

    useEffect(() => {
        if (referralData?.score?.score_id) {
            navigation.navigate(Screen.loadScore, {
                scoreId: String(referralData.score.score_id),
                title: referralData.score.title,
            })
        }
    }, [])
}
