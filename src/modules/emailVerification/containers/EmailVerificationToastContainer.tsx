import { useCallback, useEffect, useRef, useState } from 'react'
import { LaunchArguments } from 'react-native-launch-arguments'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { useIsNewAppConcept } from '@mu-native/ab'
import { getIsAuthorized, getUserId } from '@mu-native/auth'
import { layout } from '@mu-native/ds'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useAppState } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'

import { EmailVerificationToast } from '../components/EmailVerificationToast'
import { emailVerificationStoreChunk } from '../store/emailVerificationStoreChunk'
import {
    checkEmailVerificationStatusThunk,
    resendVerificationEmailThunk,
} from '../store/emailVerificationThunks'
import { useLoadEmailVerificationStoreChunk } from '../store/useLoadEmailVerificationStoreChunk'

/**
 * Screens where the verify-email toast must stay hidden: install/update tours
 * (incl. their inner paywall steps and the Notifications tour screen) and
 * every paywall/monetization landing.
 */
const EXCLUDED_SCREEN_NAMES = new Set<string>([
    Screen.tourInstall,
    Screen.tourUpdate,
    Screen.notifications, // lives inside the TourInstall navigator
    Screen.screenLongLanding,
    Screen.featuresLandingScreen,
    Screen.pricingLandingScreen,
    Screen.creditsLandingScreen,
    Screen.floatingButtonLanding,
    Screen.flashSplash,
    Screen.returnSplash,
    Screen.anniversarySplash,
    Screen.restoreOfferScreen,
    Screen.scoreSaleScreen,
    Screen.game,
    Screen.giftChecklistScreen,
])

// Legacy TabBarComponent: 52px items + 2px border; sits on the bottom inset.
const LEGACY_TAB_BAR_HEIGHT = 48
// = FLOATING_TAB_BAR_HEIGHT in @mu-native/new-concept-shared AppTabBar
// (64px pill + 8px top padding); kept local so a module doesn't import
// sections. The pill pads itself by max(insets.bottom, 12) underneath.
const NEW_CONCEPT_TAB_BAR_HEIGHT = 72

// The user may verify from the email link (it opens the website) and switch
// back — re-check on foreground, but not more often than this.
const FOREGROUND_RECHECK_THROTTLE_MS = 60 * 1000

// The "link sent" confirmation lives as long as a default AlertNotification.
const LINK_SENT_VISIBLE_MS = 3000

// E2E accounts are never activated, so the sticky toast would sit over every
// bottom-anchored control and fail Detox visibility checks on it.
const isEmailVerificationToastDisabled = LaunchArguments.value<{
    disableEmailVerificationToast: boolean
}>()?.disableEmailVerificationToast

/**
 * Name of the currently focused route, straight from the navigator. The
 * navigationStoreChunk is deliberately NOT used here: it skips some screens
 * (e.g. Screen.browseMain), so navigating back from a paywall to such a
 * screen would leave the chunk stuck on the paywall name and the toast would
 * never come back.
 */
const getFocusedScreenName = (): string | null => {
    try {
        return NavigationService.getTopRoute()?.name ?? null
    } catch {
        return null
    }
}

/** True when the focused navigation path goes through the bottom-tab navigator. */
const isTabBarVisible = (): boolean => {
    try {
        let state = NavigationService.getState() as
            | { index: number; routes: { name: string; state?: unknown }[] }
            | undefined
        while (state?.routes) {
            const route = state.routes[state.index]
            if (!route) return false
            if (route.name === Screen.tabNavigator) return true
            if (!route.state) {
                // A nested navigator's state is materialized lazily; right
                // after a cold start the walk can end on the 'App' route
                // whose initial screen IS the tab navigator.
                return route.name === Screen.app
            }
            state = route.state as typeof state
        }
    } catch {
        // Navigator not mounted yet.
    }
    return false
}

export const EmailVerificationToastContainer = () => {
    useLoadEmailVerificationStoreChunk()
    const insets = useSafeAreaInsets()
    const isNewConcept = useIsNewAppConcept()

    const [isAuthorized, userId] = useValues([getIsAuthorized, getUserId])
    const [isNeedVerifyEmail, isSending, resendBlockedUntil] = useValues([
        emailVerificationStoreChunk.props.getIsNeedVerifyEmail,
        emailVerificationStoreChunk.props.getIsSendingVerificationEmail,
        emailVerificationStoreChunk.props.getResendBlockedUntil,
    ])
    const { checkStatus, resend, setResendBlockedUntil } = useActions({
        checkStatus: checkEmailVerificationStatusThunk,
        resend: resendVerificationEmailThunk,
        setResendBlockedUntil: emailVerificationStoreChunk.actions.setResendBlockedUntil,
    })

    // Track the focused route from the navigator's own state events.
    const [currentScreenName, setCurrentScreenName] = useState<string | null>(null)
    useEffect(() => {
        setCurrentScreenName(getFocusedScreenName())
        return NavigationService.addStateListener(() => {
            setCurrentScreenName(getFocusedScreenName())
        })
    }, [])

    const lastCheckedAtRef = useRef(0)

    useEffect(() => {
        lastCheckedAtRef.current = Date.now()
        checkStatus()
    }, [userId, checkStatus])

    useAppState(appState => {
        if (appState !== 'active') return
        if (Date.now() - lastCheckedAtRef.current < FOREGROUND_RECHECK_THROTTLE_MS) return
        lastCheckedAtRef.current = Date.now()
        checkStatus()
    })

    // A send swaps the toast to the "link sent" confirmation, which behaves
    // like a default toast: it closes on tap or after LINK_SENT_VISIBLE_MS.
    // That is also the only way to get rid of the toast — sending the link
    // dismisses it for the rest of the session.
    const isLinkSent = resendBlockedUntil != null && Date.now() < resendBlockedUntil
    const [isDismissed, setIsDismissed] = useState(false)
    const dismiss = useCallback(() => setIsDismissed(true), [])

    // Both the dismissal and the backend resend throttle belong to one
    // account — a switch (incl. logout) must not inherit either.
    useEffect(() => {
        setIsDismissed(false)
        setResendBlockedUntil(null)
    }, [userId, setResendBlockedUntil])

    useEffect(() => {
        if (!isLinkSent) return undefined
        const timer = setTimeout(dismiss, LINK_SENT_VISIBLE_MS)
        return () => clearTimeout(timer)
    }, [isLinkSent, dismiss])

    // `currentScreenName` is null while the navigator isn't mounted yet —
    // treat that as "unknown screen" and stay hidden rather than risk covering
    // an excluded screen (e.g. a cold start straight into TourUpdate).
    const isVisible =
        !isEmailVerificationToastDisabled &&
        isAuthorized &&
        isNeedVerifyEmail === true &&
        !isDismissed &&
        !!currentScreenName &&
        !EXCLUDED_SCREEN_NAMES.has(currentScreenName)

    if (!isVisible) return null

    const tabBarTop = isNewConcept
        ? Math.max(insets.bottom, layout.marginSm) + NEW_CONCEPT_TAB_BAR_HEIGHT
        : insets.bottom + LEGACY_TAB_BAR_HEIGHT
    const bottomOffset = isTabBarVisible()
        ? tabBarTop + layout.marginSm
        : insets.bottom + layout.marginSm

    return (
        <EmailVerificationToast
            onPress={isLinkSent ? dismiss : resend}
            disabled={isSending}
            isLinkSent={isLinkSent}
            bottomOffset={bottomOffset}
        />
    )
}
