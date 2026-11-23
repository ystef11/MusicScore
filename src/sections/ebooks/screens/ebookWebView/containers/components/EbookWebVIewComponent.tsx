import { useState } from 'react'
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { WebView } from 'react-native-webview'

import { Loader, globalStyles, RootViewScreenComponent } from '@mu-native/ds'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'

const getWebViewUrl = (uri = '') => ({ uri })
const EbookWebViewComponent = ({
    ebookUrl,
    isFullAccess,
}: {
    ebookUrl?: string
    isFullAccess: boolean
}) => {
    const [isLoading, setIsLoading] = useState(true)

    const opacityView = useSharedValue(0)

    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacityView.value,
    }))

    const onLoad = () => {
        reportEvent(MetricaEvents.SONGBOOKS_PLAYER_SHOW, {
            ui: isFullAccess ? 'owned' : 'sample',
        })
        setTimeout(() => {
            setIsLoading(false)
            opacityView.value = withTiming(1, { duration: 600 })
        }, 2500)
    }

    return (
        <RootViewScreenComponent>
            <Animated.View style={[globalStyles.flex1FullWidth, opacityStyle]}>
                <WebView
                    androidLayerType="hardware"
                    onLoad={onLoad}
                    source={getWebViewUrl(ebookUrl)}
                    style={[globalStyles.flex1FullWidth, isLoading && globalStyles.zeroOpacity]}
                />
            </Animated.View>
            {isLoading && <Loader />}
        </RootViewScreenComponent>
    )
}

export default EbookWebViewComponent
