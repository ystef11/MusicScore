import { useCallback, useEffect } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated'

import { AppText, brandColors, globalStyles, layoutHelpers, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { EmailInput } from '../../../../../App/loginScreens/newAccountScreen/elements/ScreenNewAccountElements'
import reportEvent from '../../../../../App/Utils/Analytics'
import { authStoreChunk } from '../../../store/authStoreChunk'
import { authThunks } from '../../../store/authThunks'
import { TourAuthModalMode } from '../../../types/authTypes'

import { AuthSubTitleComponent } from './components/AuthSubTitleComponent'

const styles = StyleSheet.create({
    contentContainer: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    inputContainer: {
        width: '100%',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    passwordGenerateContainer: {
        backgroundColor: brandColors.additionalDefaultSubdued,
        padding: layoutHelpers.getResponsiveSizeExtended(12),
        marginTop: layoutHelpers.getResponsiveSizeExtended(4),
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
    },
    textPasswordGenerate: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        fontWeight: '400',
    },
    errorText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(12),
        fontWeight: '400',
    },
    animatedContainer: {
        alignItems: 'flex-start',
        width: '100%',
        minWidth: '100%',
    },
})

export const TourCreateAccountContainer = () => {
    const [email, error, isLoading, isModalInTour] = useValues([
        authStoreChunk.props.getTourEmail,
        authStoreChunk.props.getError,
        authStoreChunk.props.getIsLoginLoading,
        authStoreChunk.props.getIsModalInTour,
    ])
    const actions = useActions({
        setIsOpenTourAuthModal: authStoreChunk.actions.setIsOpenTourAuthModal,
        setTourEmail: authStoreChunk.actions.setTourEmail,
        createAccountTour: authThunks.createAccountTour,
        setErrorCustom: authStoreChunk.actions.setErrorCustom,
        setTourModalMode: authStoreChunk.actions.setTourModalMode,
    })

    const onClearEmail = () => {
        actions.setErrorCustom('')
        actions.setTourEmail('')
    }

    useEffect(() => {
        reportEvent(
            isModalInTour ? MetricaEvents.ACCOUNT_EMAIL_SHOW : MetricaEvents.NEW_ACCOUNT_EMAIL_SHOW,
        )
    }, [])

    const onSignInPress = useCallback(() => {
        Keyboard.dismiss()
        requestAnimationFrame(() => {
            actions.setTourModalMode(TourAuthModalMode.SIGN_IN)
        })
    }, [])

    return (
        <View style={styles.contentContainer}>
            <Animated.View entering={FadeIn.duration(600)} style={styles.animatedContainer}>
                <AppText
                    font="f24w600"
                    rawText={translate('native.screen_tour.create_account')}
                    style={globalStyles.mb8}
                    adaptiveSize
                />
                <AuthSubTitleComponent onPressTitle={onSignInPress} />
                <View style={styles.inputContainer}>
                    {!!error && (
                        <AppText oldColor="red700" style={styles.errorText} adaptiveSize>
                            {error}
                        </AppText>
                    )}
                    <Animated.View layout={LinearTransition.duration(700)}>
                        <EmailInput
                            email={email}
                            setEmail={actions.setTourEmail}
                            clearEmail={onClearEmail}
                            error={!!error}
                            onSubmitEditing={actions.createAccountTour}
                            placeholder={translate('native.screen_tour.enter_email')}
                            testID="Email input"
                        />
                        <View style={styles.passwordGenerateContainer}>
                            <AppText
                                style={styles.textPasswordGenerate}
                                brandColor="contentPrimary"
                                rawText={translate('native.screen_tour.generate_password')}
                                adaptiveSize
                            />
                        </View>
                    </Animated.View>
                </View>
                <MuseButton
                    testID="Create account button"
                    disabled={!email}
                    isLoading={isLoading}
                    title={translate('native.screen_tour.create_account')}
                    onPress={actions.createAccountTour}
                    style={globalStyles.fullWidth}
                />
            </Animated.View>
        </View>
    )
}
