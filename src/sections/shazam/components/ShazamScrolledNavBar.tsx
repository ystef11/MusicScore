import { useCallback, useEffect, useRef, useState } from 'react'
import {
    Animated,
    type LayoutChangeEvent,
    type NativeScrollEvent,
    type NativeSyntheticEvent,
    StyleSheet,
} from 'react-native'

import { NavHeader } from '../../../App/Components/NavHeader/NavHeader.tsx'

// Roughly the height of ShazamMatchHeader's safe-area + nav bar — the artwork
// and title scroll past below this offset, so the floating bar appears once the
// match header is essentially gone.
const SCROLL_THRESHOLD = 300
const ANIMATION_DURATION_MS = 220
// Initial guess of the bar height before onLayout measures it; replaced on first layout.
const FALLBACK_BAR_HEIGHT = 100

export const useShazamScrolledNavBar = () => {
    const [visible, setVisible] = useState(false)
    const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = e.nativeEvent.contentOffset.y > SCROLL_THRESHOLD
        setVisible(prev => (prev === next ? prev : next))
    }, [])
    return { visible, onScroll }
}

type Props = {
    visible: boolean
}

export const ShazamScrolledNavBar = ({ visible }: Props) => {
    const heightRef = useRef(FALLBACK_BAR_HEIGHT)
    const translateY = useRef(new Animated.Value(-FALLBACK_BAR_HEIGHT)).current

    useEffect(() => {
        Animated.timing(translateY, {
            toValue: visible ? 0 : -heightRef.current,
            duration: ANIMATION_DURATION_MS,
            useNativeDriver: true,
        }).start()
    }, [visible, translateY])

    const onLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height
        if (!h || h === heightRef.current) return
        heightRef.current = h
        // When measured for the first time while hidden, snap off-screen to the
        // measured height so the slide-in distance matches reality.
        if (!visible) translateY.setValue(-h)
    }

    return (
        <Animated.View
            style={[styles.wrapper, { transform: [{ translateY }] }]}
            pointerEvents="box-none"
            onLayout={onLayout}
        >
            <NavHeader noNotifications />
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
})
