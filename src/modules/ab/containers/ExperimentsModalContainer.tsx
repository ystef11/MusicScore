import React, { useCallback } from 'react'
import { useActions, useValues } from '@ug/store'
import { abStoreChunk } from '../store/abStoreChunk'
import { setVariation } from '../store/abThunks'
import ExperimentsModalComponent from '../components/ExperimentsModalComponent'

const ExperimentsModalContainer = () => {
    const actions = useActions({ setVariation })

    const [experimentIndex, experiments] = useValues([
        abStoreChunk.props.getExperimentIndex,
        abStoreChunk.props.getExperiments,
    ])

    const handleSetVariation = useCallback((variation: number) => {
        actions.setVariation(variation)
    }, [])

    return (
        <ExperimentsModalComponent
            experiment={experiments[experimentIndex]}
            onSetVariation={handleSetVariation}
        />
    )
}

export default ExperimentsModalContainer
