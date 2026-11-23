type TTabRepressAction = () => void

// Registered by each tab's currently-focused root screen: what happens when its
// already-active tab is pressed again in the floating tab bar — scroll-to-top for
// list screens, focusing the field for Search. Keyed by the tab's navigator route
// name, so only the visible root of a tab responds (deeper screens deregister on
// blur, letting the tab bar fall back to popping the stack to root).
const actions: Record<string, TTabRepressAction | undefined> = {}

// Tab navigator route names — must match the names used by the bottom-tab
// navigator (see AppTabBar `PRIMARY_ITEMS` and the tab stacks). Search uses the
// `Screen.search` route name, so it's passed directly by that caller.
export const HOME_TAB_ROUTE = 'BrowseTab'
export const LIBRARY_TAB_ROUTE = 'LibraryTab'
export const LEARN_TAB_ROUTE = 'LearnTab'

/** Register (and get a deregister fn for) a tab root's re-press action. */
export const registerTabRepressAction = (
    routeName: string,
    fn: TTabRepressAction,
): (() => void) => {
    actions[routeName] = fn
    return () => {
        if (actions[routeName] === fn) {
            delete actions[routeName]
        }
    }
}

/** Run the currently-focused root's re-press action for the given tab, if any. */
export const runTabRepressAction = (routeName: string): void => {
    actions[routeName]?.()
}
