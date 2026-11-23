import { useEffect, useState } from 'react'
import { StyleSheet } from 'react-native'
import Reanimated, { FadeOut, SlideInDown } from 'react-native-reanimated'

import { AppText, brandColors, LottieView, MuseButton, SafeAreaView } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import autogradeService from '../services/autogradeService.ts'
import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: brandColors.backgroundDefault,
    },
    content: {
        maxWidth: 326,
        paddingTop: 62,
    },
    subtitle: {
        marginTop: 8,
    },
    button: {
        marginBottom: 16,
    },
    lottie: {
        flex: 1,
        maxHeight: 300,
        marginVertical: 16,
    },
})

export const AutogradeCalibrationOverlay = () => {
    const [status, result, isLoaded] = useValues([
        autogradeScreenStoreChunk.props.getCalibrationStatus,
        autogradeScreenStoreChunk.props.getCalibrationResult,
        autogradeScreenStoreChunk.props.getIsLoaded,
    ])
    const actions = useActions({
        setCalibrationStatus: autogradeScreenStoreChunk.actions.setCalibrationStatus,
    })

    const [ready, setReady] = useState(status === 'completed')

    useEffect(() => {
        if (status === 'completed' && result) {
            xtz.setMaeLatency(result)
        }
    }, [status, result])

    const onPress = async () => {
        if (status === 'completed') {
            setReady(true)
            return
        }

        const calibrationStarted = await autogradeService.startCalibration()
        if (calibrationStarted) {
            actions.setCalibrationStatus('calibrating')
        }
    }

    if (!isLoaded || ready) {
        return null
    }

    const buttonDisabled = status === 'calibrating'

    return (
        <Reanimated.View style={styles.container} entering={SlideInDown} exiting={FadeOut}>
            <SafeAreaView style={styles.content}>
                <AppText font="f44w400Accent" textAlign="center">
                    {translate('native.soundcheck')}
                </AppText>
                <AppText font="f17w400" textAlign="center" style={styles.subtitle}>
                    {translate('native.calibration_text')}
                </AppText>
                <LottieView
                    style={styles.lottie}
                    source={require('@mu-native/ds/images/lottie/autograde_soundcheck.json')}
                    // issue: https://github.com/lottie-react-native/lottie-react-native/issues/1307
                    speed={['calibrating', 'completed'].includes(status) ? 1 : 0}
                    autoPlay={status === 'calibrating'}
                    loop={false}
                />
                <MuseButton
                    type="primary"
                    style={styles.button}
                    title={
                        status === 'completed'
                            ? translate('native.shared_continue')
                            : translate('native.start_calibration')
                    }
                    disabled={buttonDisabled}
                    onPress={onPress}
                />
            </SafeAreaView>
        </Reanimated.View>
    )
}
