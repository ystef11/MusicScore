import { StyleSheet, View } from 'react-native'

import { AuthModalStep, authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { colors, LinearGradient, MuseButton, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../constants/MetricaEvents'
import reportEvent from '../../Utils/Analytics'

type TProps = {
    feed?: boolean
}

const gradientColors = ['rgba(255, 255, 255, 0)', '#FFF']
const NoAuthBlock = ({ feed }: TProps) => {
    const insets = useAppSafeArea()
    const actions = useActions({
        setIsVisible: authStoreChunk.actions.setIsVisible,
        setStep: authStoreChunk.actions.setStep,
    })
    const [isAuthorized] = useValues([getIsAuthorized])

    const handleOpenLoginAuthModal = () => {
        reportEvent(MetricaEvents.PROFILE_LOG_IN_CLICK)
        actions.setStep(AuthModalStep.WelcomeModal)
        actions.setIsVisible(true)
    }
    const handleOpenCreateAuthModal = () => {
        reportEvent(MetricaEvents.PROFILE_SIGN_UP_CLICK)
        actions.setStep(AuthModalStep.CreateAccount)
        actions.setIsVisible(true)
        // appEventsEmitter.emit('presentForceLogout')
    }

    const label = feed
        ? translate('native.signInToGetUpdates')
        : translate('native.settings_screen.sing_up_button')

    if (isAuthorized) return null

    return (
        <>
            <View style={expStyles.bottomSpace} />
            <View style={expStyles.container}>
                <LinearGradient style={expStyles.blur} colors={gradientColors} />
                <View style={[expStyles.wrapper, { paddingBottom: insets.bottom }]}>
                    <MuseButton title={label} onPress={handleOpenCreateAuthModal} />
                    <MuseButton
                        type="tertiaryUnderlined"
                        title={translate('native.settings_screen.login_you_account_button')}
                        style={expStyles.text}
                        onPress={handleOpenLoginAuthModal}
                    />
                </View>
            </View>
        </>
    )
}

const expStyles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
    },
    wrapper: {
        paddingTop: 4,
        paddingHorizontal: 20,
        backgroundColor: colors.white,
        width: '100%',
    },
    text: {
        marginTop: 16,
        marginBottom: 8,
    },
    blur: {
        width: '100%',
        height: 48,
    },
    bottomSpace: {
        height: 120,
        width: '100%',
        backgroundColor: colors.white,
    },
})

export default NoAuthBlock
