import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import { colors, icons, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../App/constants/MetricaEvents'
import reportEvent from '../../../App/Utils/Analytics'
import { ConsentTourComponent } from '../components/ConsentTourComponent'
import { AppleLoginButton } from '../components/social/AppleLoginButton'
import { FacebookLoginButton } from '../components/social/FacebookLoginButton'
import { GoogleLoginButton } from '../components/social/GoogleLoginButton'
import LoginButton from '../elements/LoginButton'
import { authStoreChunk } from '../store/authStoreChunk'
import { TourAuthModalMode } from '../types/authTypes'

const styles = StyleSheet.create({
    buttonsContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        justifyContent: 'center',
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
        alignSelf: 'center',
        backgroundColor: colors.white,
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(10),
    },
})
const TourCreateAccountBlockContainer = ({ isTour }: { isTour: boolean }) => {
    const actions = useActions({
        setIsOpenTourAuthModal: authStoreChunk.actions.setIsOpenTourAuthModal,
        setTourModalMode: authStoreChunk.actions.setTourModalMode,
    })

    const onPressOAuthButton = (type: string) => () => {
        reportEvent(
            isTour ? MetricaEvents.TOUR_AUTHENTICATION_CLICK : MetricaEvents.AUTHENTICATION_CLICK,
            { ui: type },
        )
    }

    const setIsOpenTourAuthModal = () => {
        actions.setTourModalMode(TourAuthModalMode.SIGN_IN)
        actions.setIsOpenTourAuthModal(true)
        onPressOAuthButton('email')()
    }

    return (
        <View style={styles.buttonsContainer}>
            <AppleLoginButton
                isRebrandingStyle
                onPress={onPressOAuthButton('apple')}
                source="sign_up"
            />
            <GoogleLoginButton
                isRebrandingStyle
                onPress={onPressOAuthButton('google')}
                source="sign_up"
            />
            <FacebookLoginButton
                isRebrandingStyle
                onPress={onPressOAuthButton('facebook')}
                source="sign_up"
            />
            <LoginButton
                isRebrandingStyle
                onPress={setIsOpenTourAuthModal}
                icon={icons.envelopeIcon}
                title={translate('native.screen_welcome.login')}
                isLoading={false}
                disabled={false}
                testID="Login with email button"
            />
            <ConsentTourComponent />
        </View>
    )
}

export default memo(TourCreateAccountBlockContainer)
