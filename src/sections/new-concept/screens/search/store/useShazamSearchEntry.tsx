import { type ReactNode, useCallback, useRef } from 'react'

import { shazamTestIds } from '@mu/mu-mobile-test-id'
import { type NativeBottomSheetRef } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import {
    isShazamSupported,
    ShazamBriefingSheet,
    ShazamSearchButton,
    useLoadShazamStoreChunk,
} from '@mu-native/shazam'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

type TResult = {
    /** The mic button to drop into a SearchField/SearchEntryButton trailing slot. */
    trailingButton: ReactNode
    /** The briefing sheet; render once alongside the search field. */
    briefingSheet: ReactNode
}

/**
 * Shazam ("identify music nearby") entry point for the new-concept search
 * fields. Reuses the same briefing / permission / results flow as the legacy
 * Explore search header.
 *
 * @param onBeforeNavigate run before navigating to the Shazam results (e.g. to
 * close the search overlay).
 */
export const useShazamSearchEntry = (onBeforeNavigate?: () => void): TResult => {
    useLoadShazamStoreChunk()
    const navigation = useAppNavigation()
    const briefingSheetRef = useRef<NativeBottomSheetRef>(null)
    const supported = isShazamSupported()

    const onShazamPress = useCallback(() => {
        reportEvent(MetricaEvents.SHAZAM_ENTRY_CLICK)
        briefingSheetRef.current?.present()
    }, [])

    const onPermissionGranted = useCallback(() => {
        onBeforeNavigate?.()
        navigation.push(Screen.shazamResults)
    }, [navigation, onBeforeNavigate])

    if (!supported) return { trailingButton: null, briefingSheet: null }

    return {
        trailingButton: (
            <ShazamSearchButton
                onPress={onShazamPress}
                testID={shazamTestIds.searchButton.search}
            />
        ),
        briefingSheet: (
            <ShazamBriefingSheet ref={briefingSheetRef} onPermissionGranted={onPermissionGranted} />
        ),
    }
}
