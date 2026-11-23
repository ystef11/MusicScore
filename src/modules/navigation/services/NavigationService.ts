/* eslint-disable no-underscore-dangle */
import { useBottomTabBarHeight as nativeUseBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { CommonActions, StackActions } from '@react-navigation/native'

import { TScreenName } from '../types/navgationTypes'

let _navigator: any | undefined

/**
 * Subscribers live in the module, not on the navigator ref: containers that
 * sit outside RootNavigator (global modals/toasts) mount before it exists,
 * and a subscription made then must survive until the navigator shows up.
 */
const _stateListeners = new Set<() => void>()
let _detachContainerState: (() => void) | undefined

const notifyStateListeners = () => {
    _stateListeners.forEach(listener => listener())
}

const attachContainerState = () => {
    _detachContainerState?.()
    _detachContainerState = _navigator?.addListener?.('state', notifyStateListeners)
}

function setContainer(navigatorRef: any) {
    if (_navigator === navigatorRef) return

    _detachContainerState?.()
    _detachContainerState = undefined
    _navigator = navigatorRef ?? undefined

    if (_navigator) attachContainerState()
}

/**
 * NavigationContainer `onReady`: the root state exists from this point on.
 * Listeners that subscribed before the navigator mounted get their first run
 * here. Called from the container's effect, so a setState in a listener is
 * safe (unlike notifying from the ref callback, which runs in commit phase).
 */
function handleContainerReady() {
    attachContainerState()
    notifyStateListeners()
}

function navigate(name: TScreenName, params?: Record<string, any>) {
    if (_navigator) {
        _navigator.dispatch(CommonActions.navigate({ name, params }))
    }
}

function replace(name: TScreenName, params?: Record<string, any>) {
    if (_navigator) {
        _navigator.dispatch(StackActions.replace(name, params))
    }
}

function goBack() {
    if (_navigator) {
        _navigator.dispatch(CommonActions.goBack())
    }
}

function pop(count: number) {
    if (_navigator) {
        _navigator.dispatch(StackActions.pop(count))
    }
}

function push(name: TScreenName, params?: Record<string, any>) {
    if (_navigator) {
        _navigator.dispatch(StackActions.push(name, params))
    }
}

function popToTop() {
    if (_navigator) {
        _navigator.dispatch(StackActions.popToTop())
    }
}

function reset({ index, routes }: { index: number; routes: any[] }) {
    if (_navigator) {
        _navigator.dispatch(CommonActions.reset({ index, routes }))
    }
}

// Рекурсивная функция для выделения текущего роута из полного
function getFinalRoute(route: any | undefined | null): any {
    if (route && route.index !== undefined && route.routes && route.routes[route.index]) {
        return getFinalRoute(route.routes[route.index])
    }

    if (route && route.state) {
        return getFinalRoute(route.state)
    }

    return route
}

function getTopRoute() {
    const state = getState()
    if (state) {
        return getFinalRoute(state)
    }

    return null
}

function getState() {
    return _navigator?.getRootState()
}

/**
 * Subscribe to every navigation state change (the container's 'state' event).
 * Works before the navigator is mounted too — the listener is kept in the
 * module and gets its first call on `handleContainerReady`.
 * Returns the unsubscribe function.
 */
function addStateListener(callback: () => void): () => void {
    _stateListeners.add(callback)

    return () => {
        _stateListeners.delete(callback)
    }
}

function useHasTabBar() {
    try {
        return nativeUseBottomTabBarHeight() > 0
    } catch (e) {
        return false
    }
}

function useBottomTabBarHeight() {
    try {
        return nativeUseBottomTabBarHeight()
    } catch (e) {
        return 0
    }
}

export default {
    navigate,
    replace,
    reset,
    setContainer,
    handleContainerReady,
    goBack,
    useBottomTabBarHeight,
    useHasTabBar,
    push,
    pop,
    popToTop,
    getState,
    getTopRoute,
    addStateListener,
}
