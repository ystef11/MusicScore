import { memo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import type { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'

import { Congratulations } from './components/Congratulations'
import { SendFeedback } from './components/sendFeedback/SendFeedback'
import { ThankYou } from './components/ThankYou'

export type CoursesFeedbackParams = {
    onDismiss: () => void
    courseDetailsChunk: TCourseDetailsDynamicStoreChunk
    params: {
        feedbackParams: {
            lessonId: number
            contentId: number
            source: string
        }
        feedbackStep: number
        userRating: number
    }
}

export const CoursesFeedback = memo((params: CoursesFeedbackParams) => {
    const [step, setStep] = useState<0 | 1 | 2>(0)
    return (
        <View style={styles.container}>
            {step === 0 && (
                <SendFeedback
                    setStep={setStep}
                    courseDetailsChunk={params.courseDetailsChunk}
                    {...params.params}
                />
            )}
            {step === 1 && (
                <Congratulations
                    onPress={setStep}
                    courseDetailsChunk={params.courseDetailsChunk}
                    key="congratulations"
                />
            )}
            {step === 2 && <ThankYou key="thank you" onDismiss={params.onDismiss} />}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
    },
})
