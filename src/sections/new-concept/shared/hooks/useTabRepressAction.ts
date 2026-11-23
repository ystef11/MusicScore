import { useCallback } from 'react'

import { useFocusEffect } from '@mu-native/navigation'

import { registerTabRepressAction } from '../helpers/tabScrollRegistry'

/**
 * Registers a custom action to run when the focused tab-root screen's already
 * active tab is re-pressed in the floating tab bar — e.g. the Search root focuses
 * its field instead of scrolling to top. Pass a stable `action` (memoize it).
 * Registration follows focus, so only the visible root of the tab responds.
 */
export const useTabRepressAction = (routeName: string, action: () => void) => {
    useFocusEffect(
        useCallback(() => registerTabRepressAction(routeName, action), [routeName, action]),
    )
}
