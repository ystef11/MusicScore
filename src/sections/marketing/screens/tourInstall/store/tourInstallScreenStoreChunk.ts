import { TSources } from '@mu-native/marketing'
import { createExtendedStoreChunk } from '@ug/store'

import { TourSteps } from '../types/tourTypes'

type TTourInstallScreenState = {
    step: number
    userName: string
    routeName: string
    routeSource: TSources | null | undefined
    isLoadingDeepLinkAuth: boolean
    isShowDoubtModal: boolean
    isHideSkipAuthButton: boolean
    isShowTrialsModal: boolean
    isPausedBackgroundAnimation: boolean
}

const initialState = {
    step: TourSteps.FIRST_TOUR_SCREEN,
    userName: '',
    routeName: '',
    routeSource: null,
    isUpdateMode: false,
    isLoadingQuiz: false,
    isLoadingDeepLinkAuth: false,
    isShowDoubtModal: false,
    isHideSkipAuthButton: false,
    isShowTrialsModal: false,
    isPausedBackgroundAnimation: false,
}

export const tourInstallScreenStoreChunk = createExtendedStoreChunk<TTourInstallScreenState>({
    storeKey: 'tourInstall',
    treeKey: 'screens',
})({
    initialState,
    actions: {
        setPartialFieldsCustom: (marketingPartialsFields: Partial<TTourInstallScreenState>) => ({
            ...marketingPartialsFields,
        }),
        setNextStep: (_: undefined, { step }) => {
            return {
                step: step + 1,
            }
        },
        setPrevStep: (_: undefined, { step }) => {
            if (step === TourSteps.SET_NOTIFICATION_SCREEN) return { step }
            return {
                step: step - 1 <= TourSteps.NAME_INPUT_SCREEN ? step : step - 1,
            }
        },
    },
})
