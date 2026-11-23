import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, colors, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    authSubTitleContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    signInText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
    },
    logInTextUnderline: {
        color: colors.blue600,
    },
    brandColor: {
        color: brandColors.additionalDefault,
    },
})

type TAlreadyHaveAccountComponentProps = {
    onPressTitle: () => void
    isSignIn?: boolean
}

export const AuthSubTitleComponent = memo(
    ({ onPressTitle, isSignIn = false }: TAlreadyHaveAccountComponentProps) => (
        <View style={styles.authSubTitleContainer}>
            <AppText
                adaptiveSize
                font="f15w500"
                style={styles.signInText}
                brandColor="contentSecondary"
                rawText={translate(
                    isSignIn
                        ? 'native.screen_login.has_account'
                        : 'native.screen_new_account.has_account',
                )}
            />
            <AppText
                adaptiveSize
                brandColor="accentPrimary"
                font="f15w500"
                testID="Login button"
                onPress={onPressTitle}
                style={styles.signInText}
            >
                {' '}
                {translate(
                    isSignIn
                        ? 'native.screen_new_account.title'
                        : 'native.settings_screen.login_button',
                )}
            </AppText>
        </View>
    ),
)
