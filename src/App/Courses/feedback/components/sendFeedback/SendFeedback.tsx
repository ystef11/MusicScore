import { useState } from 'react'
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { colors, CommonTouchable, icons, KeyboardSpacer, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import type { TCourseDetailsDynamicStoreChunk } from '@mu-native/course-details'
import { isIOS } from '../../../../Utils/Platform.ts'
import { sendFeedback } from '../../../coursesActionsAsync'

const feedbackArray = [
    icons.feedback1,
    icons.feedback2,
    icons.feedback3,
    icons.feedback4,
    icons.feedback5,
]

type TStars = {
    rating: number
    onPress: (index: number) => void
}

const Stars = ({ rating, onPress }: TStars) => (
    <View style={styles.starsContainer}>
        {feedbackArray?.map((item, index) => (
            <CommonTouchable
                key={index.toString()}
                onPress={() => onPress(index)}
                style={[styles.starsWrapper, rating === index ? styles.wrapperColor : {}]}
            >
                <Image style={styles.star} source={item} />
            </CommonTouchable>
        ))}
    </View>
)

const FirstTitle = () => (
    <Text style={styles.title}>{translate('native.courses.share_your_thoughts')}</Text>
)
const SecondTitle = () => (
    <Text style={styles.subtitle}>{translate('native.courses.what_do_you_think_about_platform')}</Text>
)
const Subtitle = () => (
    <Text style={styles.subtitleExp}>{translate('native.courses.are_you_enjoying')}</Text>
)

export const SendFeedback = (params: {
    setStep: (step: 0 | 1 | 2) => void
    courseDetailsChunk: TCourseDetailsDynamicStoreChunk
    feedbackParams: {
        lessonId: number
        contentId: number
        source: string
    }
    userRating: number | undefined
}) => {
    const actions = useActions({
        sendFeedback,
        setIsVisible: authStoreChunk.actions.setIsVisible,
        setModalAction: authStoreChunk.actions.setModalAction,
    })
    const [rating, setRating] = useState(params.userRating ?? -1)
    const [isAuthorized] = useValues([getIsAuthorized])
    const [feedback, setFeedback] = useState('')

    const handleSendFeedback = () => {
        const feedbackPayload = {
            rating: rating + 1,
            feedback_suggest: feedback,
            feedbackParams: params.feedbackParams,
        }

        if (!isAuthorized) {
            actions.setIsVisible(true)
            actions.setModalAction(() =>
                actions.sendFeedback(params.courseDetailsChunk, feedbackPayload, params.setStep),
            )
            return
        }
        actions.sendFeedback(params.courseDetailsChunk, feedbackPayload, params.setStep)
    }
    const isButtonDisabled = rating === -1 && feedback?.length < 1
    const buttonStyle = StyleSheet.flatten([
        styles.button,
        isButtonDisabled ? styles.buttonDisabled : {},
    ])
    const buttonTitleStyle = StyleSheet.flatten([
        styles.buttonTitle,
        isButtonDisabled ? styles.buttonTitleDisabled : {},
    ])

    return (
        <>
            <FirstTitle />
            <SecondTitle />
            <Stars rating={rating} onPress={setRating} />
            <Subtitle />
            <TextInput
                style={[styles.feedback, styles.feedbackContainer]}
                multiline
                textAlignVertical="top"
                placeholder={translate('native.courses.what_could_be_done_better')}
                placeholderTextColor="#94A0B0"
                onChangeText={setFeedback}
                value={feedback}
                blurOnSubmit
            />
            <TouchableOpacity
                style={buttonStyle}
                disabled={isButtonDisabled}
                onPress={handleSendFeedback}
            >
                <Text style={buttonTitleStyle}>{translate('native.courses.send_feedback')}</Text>
            </TouchableOpacity>
            <KeyboardSpacer
                handleAndroid
                defaultBottomSpacing={isIOS ? staticSafeArea().bottom : 16}
                openedSpacing={8}
            />
        </>
    )
}

const styles = StyleSheet.create({
    title: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
        color: colors.text900,
        marginBottom: 4,
    },
    starsWrapper: {
        width: 60,
        height: 60,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrapperColor: {
        backgroundColor: colors.grayDisabled,
    },
    starsContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
        marginBottom: 10,
    },
    star: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: colors.text900,
    },
    feedbackContainer: {
        height: 112,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: colors.gray200,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginTop: 12,
    },
    feedback: {
        paddingVertical: 0,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: colors.text900,
    },
    button: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginTop: 16,
        backgroundColor: colors.link,
    },
    buttonDisabled: {
        backgroundColor: colors.grayDisabled,
    },
    buttonTitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: colors.white,
    },
    buttonTitleDisabled: {
        color: colors.text400,
    },

    subtitleExp: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: colors.text900,
    },
})
