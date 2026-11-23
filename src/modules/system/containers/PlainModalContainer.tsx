import React, { useEffect, useCallback } from 'react'
import { useActions, useValues } from '@ug/store'
import { PlainModal } from '@mu-native/ds'
import { systemStoreChunk } from '../store/systemStoreChunk'

const PlainModalContainer = () => {
    const actions = useActions({
        setComponent: systemStoreChunk.actions.setPlainModalComponent,
        setVisibility: systemStoreChunk.actions.setIsPlainModalVisible,
    })

    const [isVisible, Component] = useValues([
        systemStoreChunk.props.getIsPlainModalVisible,
        systemStoreChunk.props.getPlainModalComponent,
    ])

    useEffect(() => {
        if (!isVisible) {
            actions.setComponent(null)
        }
    }, [isVisible])

    const handleClose = useCallback(() => {
        actions.setVisibility(false)
    }, [])

    return <PlainModal isVisible={isVisible} onClose={handleClose} Component={Component} />
}

export default PlainModalContainer
