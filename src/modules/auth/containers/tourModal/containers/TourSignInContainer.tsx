import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Keyboard,
    Platform,
    StyleSheet,
    type TextInputInstance,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated'

import { authStoreChunk, authThunks, authUrls } from '@mu-native/auth'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    layoutHelpers,
    MuseButton,
    openInAppBrowser,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import {
    ForgotPasswordLink,
    LoginInput,
    PasswordInput,
} from '../../../../../App/loginScreens/loginScreen/elements/ScreenLoginElements'
import reportEvent from '../../../../../App/Utils/Analytics'
import SentryUtils from '../../../../../App/Utils/Sentry'
import { TourAuthModalMode } from '../../../types/authTypes'

import { AuthSubTitleComponent } from './components/AuthSubTitleComponent'

const isPasswordAutofillDisabled =
    Platform.OS === 'ios' &&
    LaunchArguments.value<{ disablePasswordAutofill: boolean }>()?.disablePasswordAutofill

const styles = StyleSheet.create({
    contentContainer: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    errorText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(12),
        fontWeight: '400',
        color: colors.red700,
    },
    animatedContainer: {
        alignItems: 'flex-start',
        width: '100%',
        justifyContent: 'flex-start',
    },
    forgotPassword: {
        alignSelf: 'flex-start',
        marginTop: 0,
    },
    zeroHeight: { height: 0 },
})

export const TourSignInContainer = () => {
    const passwordRef = useRef<TextInputInstance>(null)

    const actions = useActions({
        setIsOpenTourAuthModal: authStoreChunk.actions.setIsOpenTourAuthModal,
        setTourEmail: authStoreChunk.actions.setTourEmail,
        createAccountTour: authThunks.createAccountTour,
        setErrorCustom: authStoreChunk.actions.setErrorCustom,
        setTourModalMode: authStoreChunk.actions.setTourModalMode,
        setStep: authStoreChunk.actions.setStep,
        login: authThunks.login,
    })
    const [error, isLoading, isModalInTour] = useValues([
        authStoreChunk.props.getError,
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getIsModalInTour,
    ])

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')
    const [isPasswordShown, setIsPasswordShown] = useState(false)

    const handlePasswordFocus = useCallback(() => {
        passwordRef?.current?.focus()
    }, [])

    useEffect(() => {
        if (error) actions.setErrorCustom(null)
    }, [actions, login])

    useEffect(() => {
        reportEvent(
            isModalInTour
                ? MetricaEvents.TOUR_AUTHENTICATION_EMAIL_SHOW
                : MetricaEvents.AUTHENTICATION_EMAIL_SHOW,
        )
    }, [])

    const handleClearLogin = useCallback(() => {
        setLogin('')
    }, [])

    const togglePasswordShown = useCallback(() => setIsPasswordShown(prevState => !prevState), [])

    const handleLogin = () => {
        actions.login({ login, password, type: 'login' })

        // A trick to prevent iOS's heurestics-based Save Password sheet. Only for e2e tests.
        if (isPasswordAutofillDisabled) {
            setPassword('')
        }
    }

    const onSignUpPress = useCallback(() => {
        Keyboard.dismiss()
        requestAnimationFrame(() => {
            actions.setTourModalMode(TourAuthModalMode.SIGN_UP)
        })
    }, [actions])

    const handleForgotPassword = useCallback(() => {
        try {
            reportEvent(MetricaEvents.LANDING_LOG_IN_CLICK, { value: 'forgot_password' })
            openInAppBrowser(authUrls.forgotPassword)
        } catch (error) {
            SentryUtils.sendMessage('forgotPassword', error)
        }
    }, [])

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.contentContainer} accessible={false}>
                <Animated.View entering={FadeIn.duration(600)} style={styles.animatedContainer}>
                    <AppText
                        style={globalStyles.mb8}
                        font="f24w600"
                        rawText={translate('native.screen_tour.login_muse_title')}
                        adaptiveSize
                    />
                    <AuthSubTitleComponent isSignIn onPressTitle={onSignUpPress} />
                    <Animated.Text
                        layout={LinearTransition.duration(700)}
                        style={[styles.errorText, !error && styles.zeroHeight]}
                    >
                        {error && !['email', 'login', 'google', 'facebook'].includes(error) ? error : translate('native.alerts.login_error.message')}
                    </Animated.Text>
                    <Animated.View
                        style={globalStyles.fullWidth}
                        layout={LinearTransition.duration(700)}
                    >
                        <LoginInput
                            testID="Email input"
                            placeholder="native.screen_login.login_placeholder"
                            login={login}
                            inputRef={passwordRef as any}
                            setLogin={setLogin}
                            clearLogin={handleClearLogin}
                            isError={!!error}
                            onSubmitEditing={handlePasswordFocus}
                            borderFocused={brandColors.additionalDefault}
                            backgroundInputColor={brandColors.backgroundDefault}
                            borderColor={brandColors.contentTertiary}
                            // https://github.com/facebook/react-native/issues/39411#issuecomment-1744962420
                        />
                        <PasswordInput
                            testID="Password input"
                            inputRef={passwordRef as any}
                            password={password}
                            setPassword={setPassword}
                            isShownPassword={isPasswordShown}
                            showPassword={togglePasswordShown}
                            isError={false}
                            borderFocused={brandColors.additionalDefault}
                            backgroundInputColor={brandColors.backgroundDefault}
                            borderColor={brandColors.contentTertiary}
                        />
                        <ForgotPasswordLink
                            containerStyle={styles.forgotPassword}
                            onPress={handleForgotPassword}
                        />
                        <MuseButton
                            testID="Sign in button"
                            disabled={!login || !password}
                            onPress={handleLogin}
                            isLoading={isLoading}
                            title={translate('native.screen_login.login_button_title')}
                        />
                    </Animated.View>
                </Animated.View>
            </View>
        </TouchableWithoutFeedback>
    )
}
