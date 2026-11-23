import React, { useCallback } from 'react'

import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import ABScreenComponent from '../components/ABScreenComponent'
import { abStoreChunk } from '../store/abStoreChunk'
import { getExperiments } from '../store/abThunks'

import ExperimentsModalContainer from './ExperimentsModalContainer'

const ABScreenContainer = () => {
    const actions = useActions({
        getExperiments,
        setExperimentIndex: abStoreChunk.actions.setExperimentIndex,
        resetAllVariations: abStoreChunk.actions.resetAllVariations,
        setModalComponent: systemStoreChunk.actions.setPlainModalComponent,
        setModalVisibility: systemStoreChunk.actions.setIsPlainModalVisible,
    })

    const [experiments] = useValues([abStoreChunk.props.getExperiments])

    const handleResetExperiments = useCallback(() => {
        actions.getExperiments(2)
    }, [])

    const handleResetAllVariations = useCallback(() => {
        actions.resetAllVariations('')
    }, [])

    const handleOpenModal = React.useCallback((index: number) => {
        actions.setExperimentIndex(index)
        actions.setModalComponent(ExperimentsModalContainer)
        actions.setModalVisibility(true)
    }, [])

    return (
        <ABScreenComponent
            experiments={experiments}
            onOpenModal={handleOpenModal}
            onResetExperiants={handleResetExperiments}
            onResetAllVariations={handleResetAllVariations}
        />
    )
}

export default ABScreenContainer
