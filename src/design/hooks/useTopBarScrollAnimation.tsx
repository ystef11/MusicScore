import { createContext, PropsWithChildren, useContext } from 'react'
import { Platform } from 'react-native'
import {
    AnimatedRef,
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useScrollOffset,
    useSharedValue,
} from 'react-native-reanimated'

import { useAppSafeArea } from './useAppSafeArea'

export const TOP_BAR_ROW_HEIGHT = 56

const TopBarScrollContext = createContext<SharedValue<number> | null>(null)

export const TopBarScrollProvider = ({ children }: PropsWithChildren) => {
    const scrollOffset = useSharedValue(0)
    return (
        <TopBarScrollContext.Provider value={scrollOffset}>{children}</TopBarScrollContext.Provider>
    )
}

// Shadows any ancestor TopBarScrollProvider (each tab navigator mounts one) so
// descendants render their top bars statically: scroll bindings become no-ops
// and the animated styles resolve to a constant offset 0.
export const TopBarScrollDisabler = ({ children }: PropsWithChildren) => (
    <TopBarScrollContext.Provider value={null}>{children}</TopBarScrollContext.Provider>
)

export const useTopBarScrollOffset = (): SharedValue<number> | null =>
    useContext(TopBarScrollContext)

export const useBindTopBarScroll = (animatedRef: AnimatedRef<any>) => {
    const offset = useTopBarScrollOffset()
    useScrollOffset(animatedRef, offset ?? undefined)
}

export const useTopBarScrollHandler = () => {
    const offset = useTopBarScrollOffset()
    return useAnimatedScrollHandler({
        onScroll: event => {
            // eslint-disable-next-line
            'worklet'
            if (offset) {
                offset.value = event.contentOffset.y
            }
        },
    })
}

export const useTopBarHeight = () => {
    const insets = useAppSafeArea()
    const safeTop = insets.top - (Platform.OS === 'ios' ? 13 : 0)
    return safeTop + TOP_BAR_ROW_HEIGHT
}

export const useTopBarContentTranslateStyle = () => {
    const offset = useTopBarScrollOffset()
    return useAnimatedStyle(() => {
        const value = offset?.value ?? 0
        return {
            top: interpolate(value, [0, TOP_BAR_ROW_HEIGHT], [0, -TOP_BAR_ROW_HEIGHT], 'clamp'),
        }
    })
}
