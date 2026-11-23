import { RefObject, useCallback, useEffect } from 'react'
import KeyEvent, { KeyEventProps } from 'react-native-keyevent'

import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { scoreStoreChunk, scoreThunks } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { checkPremiumThunk } from '../../../../../App/Controllers/ScoreActionsController.ts'
import reportEvent from '../../../../../App/Utils/Analytics'
import { TXTZContainer } from '../containers/XTZContainer.tsx'

import { useOnPressPlayHandler } from './useOnPressPlayHandler'
import { MSScoreT } from '../types/scoreTypes.ts'
import { RT_EVENTS } from '@mu-native/rt-analytics'

const { sources } = marketingConstants

export const usePedalListener = (
    score: MSScoreT | null,
    xtzRef: RefObject<TXTZContainer | null>,
) => {
    const { navigate } = useAppNavigation()
    const [isPro, pedalSettings, pageLayoutType] = useValues([
        marketingStoreChunk.props.getIsPro,
        scoreStoreChunk.props.getPedalSettings,
        scoreStoreChunk.props.getPageLayoutType,
    ])
    const actions = useActions({
        setPageLayoutType: scoreThunks.setPageLayoutType,
        setMarketingFields: marketingStoreChunk.actions.setPartialFieldsCustom,
        setNextPage: scoreThunks.setNextPage,
        setPrevPage: scoreThunks.setPrevPage,
        checkPremiumThunk,
    })

    const onPlay = useOnPressPlayHandler()
    const onAutoScroll = useCallback(() => {
        if (!score) return
        if (!isPro && !score.isPurchased) {
            actions.setMarketingFields({
                source: sources.autoScroll,
                inAppForSale: score,
                featureText: 'marketing_text.auto_scroll',
            })

            actions.checkPremiumThunk()

            return
        }

        reportEvent(RT_EVENTS.SCORE_AUTO_SCROLL_TURN, {
            value: pageLayoutType !== 'vertical' ? 'on' : 'off',
        })
        actions.setPageLayoutType('horizontal')
    }, [actions, isPro, navigate, pageLayoutType, score])

    useEffect(() => {
        KeyEvent.onKeyUpListener((event: KeyEventProps) => {
            const currentCode = event?.keyCode ? event?.keyCode?.toString() : event?.pressedKey

            reportEvent(RT_EVENTS.SCORE_KEYPRESS, {
                keyCode: currentCode,
                pedalSettings,
                isActiveKeyCode:
                    pedalSettings?.prevPage === currentCode ||
                    currentCode === pedalSettings.playPause ||
                    currentCode === pedalSettings.nextPage ||
                    currentCode === pedalSettings.autoScroll,
            })

            if (currentCode === pedalSettings.playPause) {
                onPlay()
            }

            if (currentCode === pedalSettings.prevPage) {
                actions.setPrevPage()
            }

            if (currentCode === pedalSettings.nextPage) {
                actions.setNextPage()
            }

            if (currentCode === pedalSettings.autoScroll) {
                onAutoScroll()
            }
            // "Enter" button
            // if (keyCode === 66) {
            //     this.props.fullScreenAction()
            // }
            //
            // // "L" button
            // if (keyCode === 40) {
            //     this.props.loopAction()
            // }
        })

        // eslint-disable-next-line consistent-return
        return () => {
            KeyEvent.removeKeyUpListener()
        }
    }, [onPlay, pedalSettings, onAutoScroll])
}
