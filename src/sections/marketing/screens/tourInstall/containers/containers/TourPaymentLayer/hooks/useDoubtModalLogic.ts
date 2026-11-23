import { useEffect } from 'react'

import { platform } from '@mu-native/common'
import { TPlanTypeTourInstall } from '@mu-native/marketing'
import { useActions } from '@ug/store'

import { tourInstallScreenStoreChunk } from '../../../../store/tourInstallScreenStoreChunk.ts'

let timerDoubtModal: ReturnType<typeof setTimeout>

export const useDoubtModalLogic = ({
    isShowTrialModal,
    isShowFeaturesLayer,
    isPaymentInProgress,
    currentSubscriptionsGroup,
}: {
    isShowTrialModal: boolean
    isShowFeaturesLayer: boolean
    isPaymentInProgress: boolean
    currentSubscriptionsGroup: TPlanTypeTourInstall
}) => {
    const actions = useActions({
        setIsShowDoubtModal: tourInstallScreenStoreChunk.actions.setIsShowDoubtModal,
    })

    useEffect(() => {
        if (!(platform.isAndroid && !isShowTrialModal && !isShowFeaturesLayer)) {
            if (timerDoubtModal) clearTimeout(timerDoubtModal)
            return () => null
        }

        if (!isPaymentInProgress && currentSubscriptionsGroup.includes('Doubt')) {
            timerDoubtModal = setTimeout(() => {
                actions.setIsShowDoubtModal(true)
            }, 8000)
        }

        if (isPaymentInProgress && timerDoubtModal) clearTimeout(timerDoubtModal)
        return () => {
            if (timerDoubtModal) clearTimeout(timerDoubtModal)
        }
    }, [isPaymentInProgress, isShowTrialModal, isShowFeaturesLayer])
}
