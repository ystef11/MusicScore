import { StyleSheet, View } from 'react-native'

import { npsTestIds } from '@mu/mu-mobile-test-id'
import { AppText, FormTextInput } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { NPS_FEEDBACK_MAX_LENGTH } from '../constants/npsConstants'

import { NpsStep } from './NpsStep'

type TProps = {
    feedback: string
    onChange: (feedback: string) => void
    onSubmit: () => void
}

export const NpsFeedbackStep = ({ feedback, onChange, onSubmit }: TProps) => (
    <NpsStep
        title={translate('native.nps.reason_title')}
        subtitle={translate('native.nps.reason_subtitle')}
        isSubmitDisabled={!feedback.trim()}
        submitTestID={npsTestIds.feedbackSubmitButton}
        onSubmit={onSubmit}
    >
        <View style={styles.field}>
            <FormTextInput
                multiline
                value={feedback}
                maxLength={NPS_FEEDBACK_MAX_LENGTH}
                placeholder={translate('native.nps.reason_placeholder')}
                textAlignVertical="top"
                style={styles.input}
                inputStyle={styles.inputText}
                testID={npsTestIds.feedbackInput}
                onChangeText={onChange}
            />
            <AppText
                font="f11w400"
                lineHeight={12}
                brandColor="contentTertiary"
                textAlign="right"
                style={styles.counter}
                rawText={`${feedback.length} / ${NPS_FEEDBACK_MAX_LENGTH}`}
            />
        </View>
    </NpsStep>
)

const styles = StyleSheet.create({
    field: {
        gap: 4,
    },
    input: {
        height: 96,
        alignItems: 'stretch',
    },
    inputText: {
        textAlignVertical: 'top',
    },
    counter: {
        letterSpacing: 0.5,
    },
})
