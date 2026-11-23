import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
    StyleSheet,
    Text,
    type TextInputInstance,
    TouchableWithoutFeedback,
    View,
} from 'react-native'

import { platform } from '@mu-native/common'
import { colors, Input, layoutHelpers, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useNavigation } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import { NavHeader } from '../../../../../App/Components/NavHeader/NavHeader'
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import { showAlertNotification } from '../../../../../App/Elements/NewAlertNotifications'
import reportEvent from '../../../../../App/Utils/Analytics'
import { sendFeedbackThunk } from '../store/feedbackThunkActions'

const FeedbackPedalContainer = () => {
    const { setOptions } = useNavigation()
    const [feedbackText, setFeedbackText] = useState('')
    const actions = useActions({ sendFeedbackThunk })
    const feedbackRef = useRef<TextInputInstance>(null)
    const handlePasswordFocus = useCallback(() => {
        feedbackRef?.current?.blur()
    }, [])

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader headerTitle={translate('native.key_words.feedback')} noNotifications />
            ),
        })
    }, [])

    useEffect(() => {
        reportEvent(MetricaEvents.PROFILE_PEDAL_FEEDBACK_VIEW, {
            'quiz_answers.question': 'pedal feedback',
        })
    }, [])

    const sendFeedbackCallback = () => {
        setFeedbackText('')
        showAlertNotification({ title: translate('native.pedal.feedback.thanks') })
    }

    const sendFeedback = () => {
        actions.sendFeedbackThunk({
            feedbackData: {
                message: feedbackText,
                experiment_id: platform.isIos ? 3190 : 3187,
            },
            callback: sendFeedbackCallback,
        })
    }
    return (
        <TouchableWithoutFeedback onPress={handlePasswordFocus}>
            <View style={styles.feedbackPedalContainer}>
                <View style={styles.feedbackInputContainer}>
                    <Text style={styles.feedbackInfoText}>
                        {translate('native.pedal.feedback.description')}
                    </Text>
                    <Input
                        inputRef={feedbackRef as any}
                        multiline
                        onChangeText={setFeedbackText}
                        style={styles.feedbackInput}
                        placeholder={translate('native.pedal.feedback.placeholder')}
                        placeholderTextColor=""
                        value={feedbackText}
                    />
                </View>

                <MuseButton
                    onPress={sendFeedback}
                    title={translate('native.send_button')}
                    disabled={!feedbackText}
                    style={styles.sendButton}
                />
            </View>
        </TouchableWithoutFeedback>
    )
}

export default FeedbackPedalContainer

const styles = StyleSheet.create({
    feedbackPedalContainer: {
        flex: 1,
        backgroundColor: colors.white,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
    },
    feedbackInputContainer: {
        width: '100%',
        height: layoutHelpers.getResponsiveSizeExtended(300),
    },
    feedbackInput: {
        width: '100%',
        backgroundColor: colors.grayDisabled,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(12),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        borderRadius: 6,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(20),
    },
    feedbackInfoText: {
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(24),
    },

    sendButton: {
        alignSelf: 'flex-start',
    },
})
