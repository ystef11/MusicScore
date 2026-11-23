import { RefObject, useState } from 'react'
import { type ViewInstance } from 'react-native'

import { PopoverPlacement, Tooltip } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

export const PracticeModeTooltip = ({ anchor }: { anchor: RefObject<ViewInstance | null> }) => {
    const [tooltipShown, onboarded, firstSessionStep] = useValues([
        scoreStoreChunk.props.getPracticeModeTooltipShown,
        scoreStoreChunk.props.getOnboarded,
        scoreStoreChunk.props.getFirstSessionOnboardingStep,
    ])
    const actions = useActions({
        setTooltipShown: scoreStoreChunk.actions.setPracticeModeTooltipShown,
    })
    // Same single-popover limit as in ScoreOnboardingContainer: wait for the first-session
    // walkthrough to finish before competing for the screen.
    const initialVisible = onboarded && !tooltipShown && firstSessionStep === null
    const [visible, setVisible] = useState(initialVisible)

    const onClose = () => {
        setVisible(false)
    }

    const onCloseComplete = () => {
        actions.setTooltipShown(true)
    }

    if (!initialVisible) return null

    return (
        <Tooltip
            visible={visible}
            anchor={anchor}
            title={translate('native.autograde.title')}
            body={translate('native.autograde.tooltip_body')}
            badgeText={translate('native.score.badge_new')}
            onClose={onClose}
            onRequestClose={onClose}
            onCloseComplete={onCloseComplete}
            placement={PopoverPlacement.LEFT}
        />
    )
}
