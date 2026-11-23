import { memo, useCallback, useRef } from 'react'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import { MuseButton, NativeBottomSheetRef } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { Screen } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useEbookPaywall } from '../../hooks/useEbookPaywall'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

import { DigitalEbookRateSheet } from './DigitalEbookRateSheet'

export const DigitalEbookToggleRatedButton = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [isAuthorized] = useValues([getIsAuthorized])
    const actions = useActions({
        presentAuth: authStoreChunk.actions.presentAuthModal,
    })

    const { openPrePaywallScreen, isFullAccess } = useEbookPaywall()

    const onTogglePress = useCallback(() => {
        reportEvent(MetricaEvents.SONGBOOK_RATING_BUTTON_CLICK, {
            screen: Screen.ebookDetails,
            songbook_id: getStoreValue(chunk.props.getEbookId),
        })
        if (isAuthorized && isFullAccess) {
            sheetRef.current?.present()
            return
        }
        if (isAuthorized && !isFullAccess) {
            openPrePaywallScreen()
            return
        }
        actions.presentAuth(undefined)
    }, [actions, chunk.props.getEbookId, isAuthorized, isFullAccess, openPrePaywallScreen])

    return (
        <>
            <MuseButton
                testID={songbookTestIds.detailsRatingButton}
                type="secondary"
                startIcon={star}
                onPress={onTogglePress}
            />
            <DigitalEbookRateSheet ref={sheetRef} />
        </>
    )
})
