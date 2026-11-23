import React from 'react'
import { Platform } from 'react-native'
import { WebFavoritesLogin } from './WebFavoritesLogin'

import { useActions, useValues } from '@ug/store'

import { authStoreChunk, getIsAuthorized } from '../store/authStoreChunk'

import { AuthModalComponent } from './AuthModalComponent.tsx'

export const AuthModalContainer = React.memo(() => {
    const actions = useActions({ setIsVisible: authStoreChunk.actions.setIsVisible })
    const [isVisible, isAuth, tourOpen] = useValues([authStoreChunk.props.getIsVisible, getIsAuthorized, authStoreChunk.props.getIsOpenTourAuthModal])

    const closeModal = () => {
        actions.setIsVisible(false)
    }

    if (!isVisible || tourOpen) return null
    if (Platform.OS === 'android' && !isAuth) return <WebFavoritesLogin close={closeModal} />
    return <AuthModalComponent isAuth={isAuth} closeModalAction={closeModal} />
})
