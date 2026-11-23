import { RefObject, useEffect, useState } from 'react'
import { type ViewInstance } from 'react-native'

import { Rect, Tooltip } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { navigationStoreChunk, Screen } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../App/constants/scoreAnalytic'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../hooks/useCurrentScore'

const stepContentMap = {
    0: {
        title: () => translate('native.score_onboarding.tap_fullscreen'),
        body: () => translate('native.score_onboarding.tap_fullscreen_desc'),
        footer: '1/4',
        button: () => translate('native.score_onboarding.next_button'),
    },
    1: {
        title: () => translate('native.score_onboarding.change_notation_size'),
        body: () => translate('native.score_onboarding.change_notation_size_desc'),
        footer: '2/4',
        button: () => translate('native.score_onboarding.next_button'),
    },
    2: {
        title: () => translate('native.score_onboarding.toggle_cursor'),
        body: () => translate('native.score_onboarding.toggle_cursor_desc'),
        footer: '3/4',
        button: () => translate('native.score_onboarding.next_button'),
    },
    3: {
        title: () => translate('native.score_onboarding.long_press_to_move'),
        body: () => translate('native.score_onboarding.long_press_to_move_desc'),
        footer: '4/4',
        button: () => translate('native.score_onboarding.got_it_button'),
    },
} as const

const viewEventMap = {
    0: RT_EVENTS.SCORE_ONBOARDING_STEP_1_VIEW,
    1: RT_EVENTS.SCORE_ONBOARDING_STEP_2_VIEW,
    2: RT_EVENTS.SCORE_ONBOARDING_STEP_3_VIEW,
    3: RT_EVENTS.SCORE_ONBOARDING_STEP_4_VIEW,
}

type Props = {
    step: 0 | 1 | 2 | 3
    anchor?: Rect | RefObject<ViewInstance | null>
}

export const ScoreOnboardingContainer = ({ step, anchor }: Props) => {
    const score = useCurrentScore()
    const [onboardingStep, isScoreLoaded, currentScreen, firstSessionStep] = useValues([
        scoreStoreChunk.props.getVisibleOnboardingStep,
        scoreStoreChunk.props.getIsSuccessLoading,
        navigationStoreChunk.props.getCurrentScreenName,
        scoreStoreChunk.props.getFirstSessionOnboardingStep,
    ])
    const actions = useActions({
        setOnboarded: scoreStoreChunk.actions.setOnboarded,
        setOnboardingStep: scoreStoreChunk.actions.setVisibleOnboardingStep,
    })
    const [visible, setVisible] = useState(onboardingStep === step && isScoreLoaded)

    useEffect(() => {
        const visible = onboardingStep === step && isScoreLoaded

        setTimeout(() => {
            setVisible(visible)
        }, 300)

        if (visible) {
            reportEvent(viewEventMap[onboardingStep], getScoreMetaEvent(score))
        }
    }, [onboardingStep, isScoreLoaded])

    const onClose = () => {
        actions.setOnboarded(true)
        reportEvent(RT_EVENTS.SCORE_ONBOARDING_EXIT_CLICK, getScoreMetaEvent(score))
    }

    const onPressNext = () => {
        setVisible(false)
        reportEvent(RT_EVENTS.SCORE_ONBOARDING_NEXT_CLICK, getScoreMetaEvent(score))
    }

    const onCloseComplete = () => {
        reportEvent(RT_EVENTS.SCORE_ONBOARDING_EXIT_CLICK, getScoreMetaEvent(score))
        if (step < 3) {
            actions.setOnboardingStep((step + 1) as 1 | 2 | 3)
        } else {
            actions.setOnboarded(true)
        }
    }

    const { title, body, button } = stepContentMap[step]

    const isFirstSessionOnboardingPending = firstSessionStep !== null

    if (
        !isFirstSessionOnboardingPending &&
        onboardingStep === step &&
        isScoreLoaded &&
        currentScreen === Screen.score
    ) {
        return (
            <Tooltip
                visible={visible}
                anchor={anchor}
                title={title()}
                body={body()}
                currentStep={step}
                buttonText={button()}
                dataLength={4}
                onClose={onClose}
                onButtonPress={onPressNext}
                onCloseComplete={onCloseComplete}
            />
        )
    }

    return null
}
