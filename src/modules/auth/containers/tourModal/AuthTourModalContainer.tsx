import { CaptchaChallenge } from '../CaptchaChallenge'
import { Keyboard, Platform } from 'react-native'
import { WebFavoritesLogin } from '../WebFavoritesLogin'

import { KeyboardSpacer, NativeBottomSheet } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { authStoreChunk } from '../../store/authStoreChunk'
import { TourAuthModalMode } from '../../types/authTypes'

import { CloseBottomSheetContainer } from './containers/CloseBottomSheetContainer'
import { TourCreateAccountContainer } from './containers/TourCreateAccountContainer'
import { TourSignInContainer } from './containers/TourSignInContainer'

const AuthTourModalContainer = () => {
    const [tourModalMode, isOpenTourAuthModal, isRecaptchaShown] = useValues([
        authStoreChunk.props.getTourModalMode,
        authStoreChunk.props.getIsOpenTourAuthModal,
        authStoreChunk.props.getIsRecaptchaShown,
    ])
    const actions = useActions({
        setIsOpenTourAuthModal: authStoreChunk.actions.setIsOpenTourAuthModal,
        setIsRecaptchaShown: authStoreChunk.actions.setIsRecaptchaShown,
    })

    const onCloseTourModal = () => {
        if (Keyboard.isVisible()) Keyboard.dismiss()
        actions.setIsOpenTourAuthModal(false)
        actions.setIsRecaptchaShown(false)
    }

    if (!isOpenTourAuthModal) return null
    if (Platform.OS === 'android') return <WebFavoritesLogin close={onCloseTourModal} />

    return (
        <NativeBottomSheet presentOnMount onDismiss={onCloseTourModal}>
            {!isRecaptchaShown && tourModalMode === TourAuthModalMode.SIGN_UP && <TourCreateAccountContainer />}
            {!isRecaptchaShown && tourModalMode === TourAuthModalMode.SIGN_IN && <TourSignInContainer />}
            {isRecaptchaShown && <CaptchaChallenge />}
            <CloseBottomSheetContainer />
            <KeyboardSpacer handleAndroid />
        </NativeBottomSheet>
    )
}

export default AuthTourModalContainer
