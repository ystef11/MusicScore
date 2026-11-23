import { StyleSheet, ViewStyle } from 'react-native'

import { brandColors, icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import LoginButton from '../../elements/LoginButton'
import { useSocialAuth } from '../../hooks/useSocialAuth'
import { authStoreChunk } from '../../store/authStoreChunk'
import { TSocialButtonSource } from '../../types/authTypes'

type TGoogleLoginButton = {
    source: TSocialButtonSource
    onPress?: () => void
    isRebrandingStyle?: boolean
    style?: ViewStyle
    isOnlyShowIcon?: boolean
}

export const GoogleLoginButton = ({
    source,
    onPress,
    isRebrandingStyle,
    style,
    isOnlyShowIcon = false,
}: TGoogleLoginButton) => {
    const [isLoginLoading, authMethods, pendingAuthMethod] = useValues([
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getAuthMethods,
        authStoreChunk.props.getPendingAuthMethod,
    ])
    const authActions = useSocialAuth(source)

    const onPressButton = () => {
        onPress?.()
        authActions.onGoogleLoginPress()
    }

    return (
        <LoginButton
            {...(isRebrandingStyle && {
                style: [styles.backgroundColorAccent, style],
                textStyle: styles.textStyle,
                bgIcon: brandColors.backgroundDefault,
            })}
            isRebrandingStyle={isRebrandingStyle}
            isHidden={!authMethods.isGoogleAvailable}
            onPress={onPressButton}
            icon={icons.googleIcon}
            title={isOnlyShowIcon ? '' : translate('native.screen_welcome.google')}
            isLoading={isLoginLoading && pendingAuthMethod === 'google'}
            disabled={isLoginLoading}
        />
    )
}

const styles = StyleSheet.create({
    backgroundColorAccent: { borderWidth: 0 },
    textStyle: { color: brandColors.contentPrimary },
})
