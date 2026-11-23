import { Dimensions, NativeScrollEvent } from 'react-native'
import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated'

export const useAnimatedScrollShadow = (topOffset = 0) => {
    const isNeedToShowShadow = useSharedValue(false)
    const scrollOffset = useSharedValue(0)
    const contentHeight = useSharedValue(100)

    const onContentSizeChange = (width: number, height: number) => {
        const heightScreen = Dimensions.get('window').height - topOffset
        isNeedToShowShadow.value = height - 2 >= heightScreen
    }

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event: NativeScrollEvent) => {
            const { contentSize, layoutMeasurement } = event
            const { height: heightContent = 0 } = contentSize
            const { height = 0 } = layoutMeasurement

            if (contentHeight.value !== heightContent - height) {
                contentHeight.value = heightContent - height
            }

            scrollOffset.value = event.contentOffset.y
        },
    })

    return {
        scrollHandler,
        onContentSizeChange,
        contentHeight,
        scrollOffset,
        isNeedToShowShadow,
    }
}
