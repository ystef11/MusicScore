import { ViewStyle } from 'react-native'

import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import LoginButton from '../../elements/LoginButton'
import { useSocialAuth } from '../../hooks/useSocialAuth'
import { authStoreChunk } from '../../store/authStoreChunk'
import { TSocialButtonSource } from '../../types/authTypes'

type TFaceBookLoginButton = {
    source: TSocialButtonSource
    onPress?: () => void
    isRebrandingStyle?: boolean
    isOnlyShowIcon?: boolean
    style?: ViewStyle
}

export const FacebookLoginButton = ({
    source,
    onPress,
    isRebrandingStyle,
    isOnlyShowIcon = false,
    style,
}: TFaceBookLoginButton) => {
    const [isLoginLoading, authMethods, pendingAuthMethod] = useValues([
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getAuthMethods,
        authStoreChunk.props.getPendingAuthMethod,
    ])
    const authActions = useSocialAuth(source)

    const onPressButton = () => {
        onPress?.()
        authActions.onFacebookLoginPress()
    }

    return (
        <LoginButton
            style={style}
            isRebrandingStyle={isRebrandingStyle}
            isHidden={!authMethods.isFacebookAvailable}
            onPress={onPressButton}
            icon={icons.facebookIcon}
            title={isOnlyShowIcon ? '' : translate('native.screen_welcome.facebook')}
            isLoading={isLoginLoading && pendingAuthMethod === 'facebook'}
            disabled={isLoginLoading}
        />
    )
}
