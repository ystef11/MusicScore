import { memo } from 'react'
import { StyleSheet, useWindowDimensions, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'

import { brandColors } from '@mu-native/ds'
import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import { useFirstSessionOnboarding } from './useFirstSessionOnboarding'

const DIM_OPACITY = 0.4

const roundedRectPath = (x: number, y: number, width: number, height: number, radius: number) => {
    const r = Math.max(Math.min(radius, width / 2, height / 2), 0)

    return [
        `M${x + r},${y}`,
        `H${x + width - r}`,
        `A${r},${r} 0 0 1 ${x + width},${y + r}`,
        `V${y + height - r}`,
        `A${r},${r} 0 0 1 ${x + width - r},${y + height}`,
        `H${x + r}`,
        `A${r},${r} 0 0 1 ${x},${y + height - r}`,
        `V${y + r}`,
        `A${r},${r} 0 0 1 ${x + r},${y}`,
        'Z',
    ].join(' ')
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFill,
        zIndex: 11,
    },
})
export const FirstSessionOnboardingSpotlight = memo(() => {
    const { isActive } = useFirstSessionOnboarding()
    const [rect] = useValues([scoreStoreChunk.props.getFirstSessionSpotlight])
    const { width, height } = useWindowDimensions()

    if (!isActive || !rect) return null

    const holePath = roundedRectPath(rect.x, rect.y, rect.width, rect.height, rect.radius)

    return (
        <View style={styles.container} pointerEvents="none">
            <Svg width={width} height={height}>
                <Path
                    d={`M0,0 H${width} V${height} H0 Z ${holePath}`}
                    fill={brandColors.colorBlack}
                    fillOpacity={DIM_OPACITY}
                    fillRule="evenodd"
                />
            </Svg>
        </View>
    )
})
