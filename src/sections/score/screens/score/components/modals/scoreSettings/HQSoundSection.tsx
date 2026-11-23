import { NativeModules, Platform, Text } from 'react-native'
import { memo, useCallback } from 'react'
import { dismissFittedSheet } from 'react-native-sheet2'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { ListSectionHeader, BrandSwitcherListCell } from '@mu-native/ds'
import { hqSoundfontStoreChunk, hqSoundfontThunkActions } from '@mu-native/hq-soundfont'
import { translate } from '@mu-native/locale'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { getScoreMetaEvent } from '../../../../../../../App/constants/scoreAnalytic'
import { checkPremiumThunk } from '../../../../../../../App/Controllers/ScoreActionsController.ts'
import { MSScoreT } from '../../../../../../../App/Model/MSScore'
import reportEvent from '../../../../../../../App/Utils/Analytics'

const { sources } = marketingConstants

const SoundSwitcherCell = ({
    score,
    onShowPaymentModal,
}: {
    score: MSScoreT
    onShowPaymentModal: () => void
}) => {
    const [soundfontEnabled, isPro] = useValues([
        hqSoundfontStoreChunk.props.getIsEnabled,
        marketingStoreChunk.props.getIsPro,
    ])
    const actions = useActions({
        toggle: hqSoundfontThunkActions.toggleHQSoundfontEnabled,
    })

    const onToggle = useCallback(() => {
        reportEvent(`Settings: HQ-sound turn ${!soundfontEnabled ? 'on' : 'off'}`)
        reportEvent(
            soundfontEnabled
                ? RT_EVENTS.SCORE_SETTINGS_HQ_TOGGLE_OFF_CLICK
                : RT_EVENTS.SCORE_SETTINGS_HQ_TOGGLE_ON_CLICK,
            getScoreMetaEvent(score),
        )
        if (Platform.OS === 'android' || isPro || score?.isPurchased) {
            actions.toggle()
        } else {
            onShowPaymentModal()
        }
    }, [actions, isPro, onShowPaymentModal, score, soundfontEnabled])

    return (
        <BrandSwitcherListCell
            title={translate('native.score_details_sheet.sound')}
            subtitle={translate('native.score_details_sheet.sound.description')}
            switchValue={soundfontEnabled}
            onSwitchChange={onToggle}
            testID={scoreTestIds.scoreSettingsHqSoundToggle}
        />
    )
}

export const HQSoundSection = memo(() => {
    const [score, uri] = useValues([scoreStoreChunk.props.getCurrentScore, scoreStoreChunk.props.getScoreUri])
    const actions = useActions({
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
        checkPremiumThunk,
    })

    const onShowPaymentModal = useCallback(() => {
        dismissFittedSheet('scoreSettingsSheet')
        actions.setMarketingFields({
            source: sources.hqSound,
            featureText: 'marketing_text.hq_sound',
            inAppForSale: score,
        })
        actions.checkPremiumThunk()
    }, [score])

    if (!score) return null
    if (Platform.OS === 'android' && NativeModules.WebScoreSource && uri?.endsWith('.webscore')) {
        return <>
            <ListSectionHeader title={translate('native.score.hq_title')} />
            <Text style={{ paddingHorizontal: 20, paddingBottom: 12, color: '#665777' }}>Используется готовая аудиозапись партитуры. Смена банка инструментов для неё недоступна.</Text>
        </>
    }

    return (
        <>
            <ListSectionHeader title={translate('native.score.hq_title')} />
            <SoundSwitcherCell score={score} onShowPaymentModal={onShowPaymentModal} />
        </>
    )
})
