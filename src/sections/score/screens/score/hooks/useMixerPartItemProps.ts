import { useCallback } from 'react'
import { Alert, NativeModules, Platform } from 'react-native'

import { wait } from '@mu-native/common'
import { nativeDismissFittedSheet, nativePresentFittedSheet, presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import {
    getCurrentScoreParts,
    getCurrentScoreSettings,
    scoreStoreChunk,
    scoreThunks,
    TScorePart,
} from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { checkPremiumThunk } from '../../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { getScoreMetaEvent } from '../helpers/scoreHelpers.ts'

const { sources } = marketingConstants

const useMixerPartItemProps = (item: TScorePart) => {
    const [isPro, score, parts, settings] = useValues([
        marketingStoreChunk.props.getIsPro,
        scoreStoreChunk.props.getCurrentScore,
        getCurrentScoreParts,
        getCurrentScoreSettings,
    ])

    const localPlayback = Platform.OS === 'android' && !!NativeModules.WebScoreSource && !score?.isPdf
    const { visiblePartIds, playablePartIds, partVolumeMap } = settings
    const isVisible = visiblePartIds.includes(item.id)
    const isPlayable = playablePartIds.includes(item.id)
    const allPlayable = playablePartIds.length === 0 || playablePartIds.length === parts.length

    const actions = useActions({
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
        togglePartPlayability: scoreThunks.togglePartPlayability,
        togglePartVisible: scoreThunks.togglePartVisibility,
        setAllPartsVisible: scoreThunks.setAllPartsVisible,
        setAllPartsPlayable: scoreThunks.setAllPartsPlayable,
        setSinglePartVisible: scoreThunks.setSinglePartVisible,
        setPartVolume: scoreThunks.setPartVolume,
        checkPremiumThunk,
    })

    const showPaymentModal = useCallback(() => {
        actions.setPartialFieldsCustom({
            source: sources.mixer,
            featureText: 'marketing_text.mixer',
            inAppForSale: score,
        })
        nativeDismissFittedSheet('mixerSheet')
        actions.checkPremiumThunk()
    }, [actions, score])

    const shouldPrevent = useCallback(() => {
        if (!localPlayback && !isPro && !score?.isPurchased) {
            showPaymentModal()
            return true
        }

        return false
    }, [localPlayback, isPro, showPaymentModal, score?.isPurchased])

    const onChangePlayability = useCallback(() => {
        // Soloing from an "all playable" state restricts playback to this part; otherwise
        // it toggles this part's membership in the playable set.
        const willBePlayable = allPlayable ? true : !isPlayable
        reportEvent(
            willBePlayable
                ? RT_EVENTS.SCORE_MIXER_PART_SOLO_ON_CLICK
                : RT_EVENTS.SCORE_MIXER_PART_SOLO_OFF_CLICK,
            getScoreMetaEvent(score),
        )
        if (shouldPrevent()) return

        reportEvent(
            willBePlayable
                ? RT_EVENTS.SCORE_MIXER_PART_SOLO_ON
                : RT_EVENTS.SCORE_MIXER_PART_SOLO_OFF,
            getScoreMetaEvent(score),
        )
        actions.togglePartPlayability(item.id)
        reportEvent(RT_EVENTS.MIXER_CHANGE_SOLO)
    }, [allPlayable, isPlayable, score, shouldPrevent, actions, item.id])

    const onChangeVisibility = useCallback(() => {
        reportEvent(
            isVisible
                ? RT_EVENTS.SCORE_MIXER_PART_VISIBILITY_OFF_CLICK
                : RT_EVENTS.SCORE_MIXER_PART_VISIBILITY_ON_CLICK,
            getScoreMetaEvent(score),
        )
        if (shouldPrevent()) return

        reportEvent(
            isVisible
                ? RT_EVENTS.SCORE_MIXER_PART_VISIBILITY_OFF
                : RT_EVENTS.SCORE_MIXER_PART_VISIBILITY_ON,
            getScoreMetaEvent(score),
        )
        actions.togglePartVisible(item.id)
    }, [isVisible, score, shouldPrevent, actions, item.id])

    const onPlayableLongPress = useCallback(async () => {
        if (shouldPrevent()) return

        // A native sheet can't stack on top of another native sheet, so the mixer must be
        // dismissed before the confirmation and re-presented after it.
        nativeDismissFittedSheet('mixerSheet')
        await wait(400)

        const id = await presentAlert({
            rawTitle: translate('native.screen_mixer.playability_all_parts'),
            buttons: [
                {
                    rawText: translate('native.search.submit_button'),
                    id: 'submit',
                    style: 'default',
                },
                {
                    rawText: translate('native.search.cancel_button'),
                    id: 'cancel',
                    style: 'cancel',
                },
            ],
        })

        if (id === 'submit') {
            actions.setAllPartsPlayable()
            reportEvent(RT_EVENTS.MIXER_LONG_PRESS_PLAYABLE)
        }

        // Same "no sheet on top of a sheet" rule as above, in reverse: the alert sheet is still
        // animating out right after it resolves.
        await wait(400)
        nativePresentFittedSheet('mixerSheet')
    }, [actions, shouldPrevent])

    const onVisibleLongPress = useCallback(() => {
        if (shouldPrevent()) return

        const hasHiddenParts = parts.slice(1).some((part: any) => !part.isVisible)
        const alertTitle = hasHiddenParts
            ? translate('native.screen_mixer.visibility_all_parts')
            : translate('native.screen_mixer.visibility_one_part')

        Alert.alert(alertTitle, '', [
            {
                text: translate('native.search.submit_button'),
                onPress: () => {
                    if (hasHiddenParts) {
                        actions.setAllPartsVisible()
                        reportEvent(RT_EVENTS.MIXER_LONG_PRESS_VISIBLE)
                    } else {
                        actions.setSinglePartVisible(item.id)
                        reportEvent(RT_EVENTS.MIXER_LONG_PRESS_SOLO)
                    }
                },
            },
            {
                text: translate('native.search.cancel_button'),
                style: 'cancel',
            },
        ])
    }, [shouldPrevent, parts, item.id, score?.id])

    const onChangeVolume = useCallback(
        (volume: number) => {
            reportEvent(RT_EVENTS.SCORE_VOLUME_SET_CLICK, getScoreMetaEvent(score))
            if (shouldPrevent()) return

            actions.setPartVolume(item.id, volume)
            reportEvent(RT_EVENTS.MIXER_CHANGE_VOLUME, { value: Math.round(volume * 100) })
        },
        [item.id, score, shouldPrevent, actions],
    )

    const itemVolume = partVolumeMap[item.id] ?? item.volume
    const volume = itemVolume > 1 ? itemVolume / 100 : itemVolume

    return {
        volume,
        isPlayable,
        isVisible,
        allPlayable,
        onPlayableLongPress,
        onVisibleLongPress,
        onChangePlayability,
        onChangeVisibility,
        onChangeVolume,
        onPreventAction: shouldPrevent,
        isPro,
    }
}

export default useMixerPartItemProps
