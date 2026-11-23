import {
    createContext,
    PropsWithChildren,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useState,
} from 'react'
import { LayoutChangeEvent, StyleSheet } from 'react-native'
import Animated from 'react-native-reanimated'

import { brandColors } from '../../constants/new/brandColors'
import {
    useTopBarContentTranslateStyle,
    useTopBarHeight,
} from '../../hooks/useTopBarScrollAnimation'

type ScrollableHeaderContextValue = {
    contentPaddingTop: number
}

const ScrollableHeaderContext = createContext<ScrollableHeaderContextValue>({
    contentPaddingTop: 0,
})

export const useScrollableHeader = () => useContext(ScrollableHeaderContext)

type Props = PropsWithChildren<{
    headerContent: ReactNode
    backgroundColor?: string
}>

export const ScrollableHeaderProvider = ({ children, headerContent, backgroundColor }: Props) => {
    const topBarHeight = useTopBarHeight()
    const contentTranslateStyle = useTopBarContentTranslateStyle()
    const [contentHeight, setContentHeight] = useState(0)
    const onLayout = useCallback(
        (e: LayoutChangeEvent) => {
            const measured = e.nativeEvent.layout.height - topBarHeight
            if (measured > 0 && measured !== contentHeight) {
                setContentHeight(measured)
            }
        },
        [topBarHeight, contentHeight],
    )

    const contextValue = useMemo<ScrollableHeaderContextValue>(
        () => ({ contentPaddingTop: topBarHeight + contentHeight }),
        [topBarHeight, contentHeight],
    )

    return (
        <ScrollableHeaderContext.Provider value={contextValue}>
            {children}
            <Animated.View
                onLayout={onLayout}
                pointerEvents="box-none"
                style={[
                    styles.overlay,
                    {
                        paddingTop: topBarHeight,
                        backgroundColor: backgroundColor ?? brandColors.backgroundDefault,
                    },
                    contentTranslateStyle,
                ]}
            >
                {headerContent}
            </Animated.View>
        </ScrollableHeaderContext.Provider>
    )
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
})
