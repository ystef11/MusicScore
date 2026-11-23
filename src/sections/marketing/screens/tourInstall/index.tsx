import { useEffect, useState } from 'react'

import { TSources } from '@mu-native/marketing'
import { RouteProp, useRoute } from '@mu-native/navigation'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions } from '@ug/store'

import TourInstall from './containers/TourInstall'
import { tourInstallScreenStoreChunk } from './store/tourInstallScreenStoreChunk'
import { useLoadTourInstallScreenStore } from './store/useLoadTourInstallScreenStore'
import { TourSteps } from './types/tourTypes.ts'

type TTourRoute = {
    params: {
        step: number
        routeName: string
        source: TSources
    }
}

const PrepareTourData = () => {
    const { params } = useRoute<RouteProp<TTourRoute>>()
    const { step, routeName = '', source } = params || {}

    const actions = useActions({
        setPartialFieldsCustom: tourInstallScreenStoreChunk.actions.setPartialFieldsCustom,
        quizStoreSetPartialFieldsCustom: quizStoreChunk.actions.setPartialFieldsCustom,
    })

    const [isStoreUpdated, setIsStoreUpdated] = useState(false)

    useEffect(() => {
        if (step >= 0 || source || routeName) {
            actions.quizStoreSetPartialFieldsCustom({
                isUpdateMode: step === TourSteps.UPDATE_QUIZ_STEP,
            })
            actions.setPartialFieldsCustom({
                routeName,
                routeSource: source,
                ...(step >= 0 ? { step } : {}),
            })
        }

        setIsStoreUpdated(true)
    }, [])

    if (!isStoreUpdated) return null
    return <TourInstall />
}

export const TourInstallScreen = () => {
    useLoadTourInstallScreenStore()

    return <PrepareTourData />
}
