import { TextStyle, ViewStyle } from 'react-native'

import appleAuth from '@invertase/react-native-apple-authentication'
import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import LoginButton from '../../elements/LoginButton'
import { useSocialAuth } from '../../hooks/useSocialAuth'
import { authStoreChunk } from '../../store/authStoreChunk'
import { TSocialButtonSource } from '../../types/authTypes'

type TAppleLoginButton = {
    source: TSocialButtonSource
    onPress?: () => void
    isRebrandingStyle?: boolean
    isOnlyShowIcon?: boolean
    style?: ViewStyle
    textStyle?: TextStyle
    tintColor?: string
}

export const AppleLoginButton = ({
    source,
    onPress,
    isRebrandingStyle = false,
    isOnlyShowIcon = false,
    style,
    textStyle,
    tintColor,
}: TAppleLoginButton) => {
    const [isLoginLoading, authMethods, pendingAuthMethod] = useValues([
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getAuthMethods,
        authStoreChunk.props.getPendingAuthMethod,
    ])
    const authActions = useSocialAuth(source)

    const onPressButton = () => {
        onPress?.()
        authActions.onAppleLoginPress()
    }

    return (
        <LoginButton
            style={style}
            isRebrandingStyle={isRebrandingStyle}
            isHidden={!(appleAuth.isSupported && authMethods.isAppleAvailable)}
            onPress={onPressButton}
            icon={icons.appleIcon}
            title={isOnlyShowIcon ? '' : translate('native.screen_welcome.apple')}
            isLoading={isLoginLoading && pendingAuthMethod === 'apple'}
            disabled={isLoginLoading}
            textStyle={textStyle}
            tintColor={tintColor}
        />
    )
}
