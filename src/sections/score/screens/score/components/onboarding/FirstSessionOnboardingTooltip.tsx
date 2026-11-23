import { memo, RefObject, useEffect, useState } from 'react'
import { type ViewInstance } from 'react-native'

import { PopoverPlacement, Tooltip } from '@mu-native/ds'
import { PlainLocaleKey, translate } from '@mu-native/locale'
import { scoreStoreChunk, scoreThunks, type TSpotlightRect } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'

import {
    FIRST_SESSION_ONBOARDING_STEPS,
    TOOLBAR_SURFACE_RADIUS,
    useFirstSessionOnboarding,
} from './useFirstSessionOnboarding'

const ANCHOR_SETTLE_MS = 300

type TStepConfig = {
    title: PlainLocaleKey
    body: PlainLocaleKey
    buttonText: PlainLocaleKey
    placement: PopoverPlacement
    isCircleSpotlight: boolean
}

const stepConfigMap: Record<0 | 1, TStepConfig> = {
    0: {
        title: 'native.score_onboarding.customize_view',
        body: 'native.score_onboarding.customize_view_desc',
        buttonText: 'native.score_onboarding.next_button',
        placement: PopoverPlacement.BOTTOM,
        isCircleSpotlight: false,
    },
    1: {
        title: 'native.score_onboarding.hear_score',
        body: 'native.score_onboarding.hear_score_desc',
        buttonText: 'native.score.play_button',
        placement: PopoverPlacement.TOP,
        isCircleSpotlight: true,
    },
}

/**
 * The play button's anchor is the wrapper around it, and the button carries `marginHorizontal: 16`
 * of its own — so the measured rect is ~68 wide for a 36 wide button. Take the smaller side as the
 * diameter and centre it, instead of trusting the width.
 */
const toSpotlight = (
    x: number,
    y: number,
    width: number,
    height: number,
    isCircle: boolean,
): TSpotlightRect => {
    if (!isCircle) return { x, y, width, height, radius: TOOLBAR_SURFACE_RADIUS }

    const size = Math.min(width, height)

    return {
        x: x + (width - size) / 2,
        y: y + (height - size) / 2,
        width: size,
        height: size,
        radius: size / 2,
    }
}

const onCloseComplete = () => undefined
const ignoreDismissRequest = () => undefined

type Props = {
    step: 0 | 1
    anchor: RefObject<ViewInstance | null>
}

export const FirstSessionOnboardingTooltip = memo(({ step, anchor }: Props) => {
    const {
        step: activeStep,
        isActive,
        isDismissibleFromAnyStep,
        goToNextStep,
        finish,
    } = useFirstSessionOnboarding()
    const [visible, setVisible] = useState(false)
    const [isPlaying] = useValues([scoreStoreChunk.props.getIsPlaying])
    const actions = useActions({
        setFirstSessionSpotlight: scoreStoreChunk.actions.setFirstSessionSpotlight,
        setPlaybackLocked: scoreStoreChunk.actions.setIsFirstSessionPlaybackLocked,
        togglePlay: scoreThunks.toggleScorePlay,
    })

    const isCurrent = isActive && activeStep === step

    useEffect(() => {
        if (!isCurrent) {
            setVisible(false)
            return undefined
        }

        const timeout = setTimeout(() => {
            // Published to the store because the dim is drawn by the screen, not from here — see
            // FirstSessionOnboardingSpotlight for why it cannot live in a modal of its own.
            anchor.current?.measureInWindow((x, y, width, height) =>
                actions.setFirstSessionSpotlight(
                    toSpotlight(x, y, width, height, stepConfigMap[step].isCircleSpotlight),
                ),
            )
            setVisible(true)
            reportEvent(MetricaEvents.ONBOARDING_AFTER_TOUR_TOOLTIP_SHOW, { value: step })
        }, ANCHOR_SETTLE_MS)

        return () => clearTimeout(timeout)
    }, [isCurrent, anchor])

    if (!isCurrent) return null

    const { title, body, buttonText, placement } = stepConfigMap[step]

    const onClose = () => {
        reportEvent(MetricaEvents.ONBOARDING_AFTER_TOUR_TOOLTIP_CLOSE, { value: step })
        finish()
    }

    const onButtonPress = () => {
        reportEvent(MetricaEvents.ONBOARDING_AFTER_TOUR_TOOLTIP_CLICK, { value: step })

        if (step === 0) {
            goToNextStep()
            return
        }

        finish()

        if (!isPlaying) actions.togglePlay()

        actions.setPlaybackLocked(true)
    }

    return (
        <Tooltip
            visible={visible}
            anchor={anchor}
            placement={placement}
            title={translate(title)}
            body={translate(body)}
            buttonText={translate(buttonText)}
            hideCloseButton={!isDismissibleFromAnyStep}
            currentStep={step}
            dataLength={FIRST_SESSION_ONBOARDING_STEPS}
            onClose={onClose}
            onRequestClose={ignoreDismissRequest}
            onButtonPress={onButtonPress}
            onCloseComplete={onCloseComplete}
        />
    )
})
