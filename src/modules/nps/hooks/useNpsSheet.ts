import { useCallback, useEffect, useRef, useState } from 'react'

import { NativeBottomSheetRef, showAlertNotification } from '@mu-native/ds'
import { checkmarkCircle } from '@mu-native/icons/checkmarkCircle'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { appEventsEmitter, type TNpsSheetPayload } from '@mu-native/system'

import reportEvent from '../../../App/Utils/Analytics'
import { npsEventParams, type TNpsStep } from '../helpers/npsAnalytics'

export function useNpsSheet() {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [payload, setPayload] = useState<TNpsSheetPayload | undefined>()
    const [step, setStep] = useState<TNpsStep>('rating')
    const [rating, setRating] = useState<number | null>(null)
    const [feedback, setFeedback] = useState('')
    // A dismiss the comment submit asked for must not look like the user closing the sheet.
    const isDismissedBySubmit = useRef(false)

    useEffect(() => {
        if (payload) {
            sheetRef.current?.present()
            reportEvent(RT_EVENTS.NPS_SURVEY_SHOW, npsEventParams(payload.sessionNumber))
        }
        return appEventsEmitter.on('presentNpsSheet', next => {
            if (payload) return
            isDismissedBySubmit.current = false
            setStep('rating')
            setRating(null)
            setFeedback('')
            setPayload(next)
        })
    }, [payload])

    const onSubmitRating = useCallback(() => {
        if (!payload || rating === null) return

        reportEvent(
            RT_EVENTS.NPS_SURVEY_RATE_CLICK,
            npsEventParams(payload.sessionNumber, { nps_rating_score: rating }),
        )
        setStep('comment')
    }, [payload, rating])

    const onSubmitFeedback = useCallback(() => {
        const text = feedback.trim()
        if (!payload || rating === null || !text) return

        reportEvent(
            RT_EVENTS.NPS_SURVEY_COMMENT,
            npsEventParams(payload.sessionNumber, {
                nps_rating_score: rating,
                nps_feedback_text: text,
            }),
        )
        isDismissedBySubmit.current = true
        sheetRef.current?.dismiss()
    }, [feedback, payload, rating])

    const onDismiss = useCallback(() => {
        const bySubmit = isDismissedBySubmit.current
        isDismissedBySubmit.current = false
        setPayload(undefined)
        if (!payload) return

        if (bySubmit) {
            showAlertNotification({
                text: translate('native.nps.thanks'),
                icon: checkmarkCircle,
            })
            return
        }
        reportEvent(RT_EVENTS.NPS_SURVEY_CLOSE, npsEventParams(payload.sessionNumber, { step }))
    }, [payload, step])

    return {
        payload,
        step,
        rating,
        feedback,
        sheetRef,
        setRating,
        setFeedback,
        onSubmitRating,
        onSubmitFeedback,
        onDismiss,
    }
}
