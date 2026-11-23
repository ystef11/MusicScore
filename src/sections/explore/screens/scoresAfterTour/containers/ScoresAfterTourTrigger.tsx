import { memo, useEffect, useState } from 'react'

import { abStoreChunk } from '@mu-native/ab'
import {
    ExperimentsMonetization,
    firstSessionFlowExperimentId,
    marketingStorage,
    useMonetizationExperiment,
} from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { getFirstTourInstrument } from '@mu-native/quiz'
import { searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

export const ScoresAfterTourTrigger = memo(() => {
    const { navigate } = useAppNavigation()
    const [tourInstrument, filterParams, experiments] = useValues([
        getFirstTourInstrument,
        searchStoreChunk.props.getFilterParams,
        abStoreChunk.props.getExperiments,
    ])
    const [isInitExperiment, setIsInitExperiment] = useState(false)

    const { variation } = useMonetizationExperiment(
        isInitExperiment,
        firstSessionFlowExperimentId,
        ExperimentsMonetization.firstSessionFlow,
    )
    const isShowModal = variation === 2 || variation === 3

    useEffect(() => {
        const isReady = !!tourInstrument && !!filterParams && !!experiments.length

        if (!isReady || !marketingStorage.get('isInitFlowSessionExp')) return

        marketingStorage.set('isInitFlowSessionExp', false)
        setIsInitExperiment(true)

        if (isShowModal) navigate(Screen.scoresAfterTour)
    }, [tourInstrument, filterParams, experiments])

    return null
})
