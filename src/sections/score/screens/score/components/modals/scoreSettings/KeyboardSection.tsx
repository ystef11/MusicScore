import { NativeModules, Platform } from 'react-native'
import React, { useEffect } from 'react'
import { dismissFittedSheet } from 'react-native-sheet2'

import { ListSectionHeader, BrandSwitcherListCell } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, sources } from '@mu-native/marketing'
import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import { checkPremiumThunk } from '../../../../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useCurrentScore } from '../../../hooks/useCurrentScore'

const KeyboardSection = () => {
    const score = useCurrentScore()
    const localPlayback = Platform.OS === 'android' && !!NativeModules.WebScoreSource && !score?.isPdf
    const [isKeyboardVisible, isPro] = useValues([
        scoreStoreChunk.props.getIsKeyboardVisible,
        marketingStoreChunk.props.getIsPro,
    ])
    const actions = useActions({
        setIsKeyboardVisible: scoreThunks.setIsKeyboardVisible,
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })

    useEffect(() => {
        if (!localPlayback && !isPro && !score?.isPurchased && isKeyboardVisible) actions.setIsKeyboardVisible(false)
    }, [localPlayback, isPro, score?.isPurchased])

    const onToggle = (visible: boolean) => {
        if (!localPlayback && !isPro && !score?.isPurchased) {
            dismissFittedSheet('scoreSettingsSheet')
            actions.setMarketingFields({
                source: sources.keyboard,
                featureText: 'marketing_text.keyboard',
                inAppForSale: score,
            })
            actions.checkPremiumThunk()
            return
        }

        reportEvent(RT_EVENTS.SCORE_SETTINGS_TOGGLE_KEYBOARD, getScoreMetaEvent(score))
        actions.setIsKeyboardVisible(visible)
    }

    return (
        <>
            <ListSectionHeader title={translate('native.hub_keyboard.title')} />
            <BrandSwitcherListCell
                title={translate('native.score.keyboard_title')}
                switchValue={isKeyboardVisible}
                onSwitchChange={onToggle}
                testID={scoreTestIds.scoreSettingsKeyboardToggle}
            />
        </>
    )
}

export default React.memo(KeyboardSection)
