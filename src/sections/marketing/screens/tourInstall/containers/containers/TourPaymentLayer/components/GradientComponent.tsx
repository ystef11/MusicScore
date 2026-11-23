import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { LinearGradient } from '@mu-native/ds'

const styles = StyleSheet.create({
    subscriptionGroupGradient: {
        width: '100%',
        height: '100%',
        zIndex: 0,
        position: 'absolute',
    },
})

const gradientProps = {
    style: styles.subscriptionGroupGradient,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
}

type TGradientTourComponent = {
    gradientTourColors: [string, string] | null
}
const GradientTourComponent = ({ gradientTourColors }: TGradientTourComponent) => {
    if (!gradientTourColors) return null

    return <LinearGradient colors={gradientTourColors} {...gradientProps} />
}

export default memo(GradientTourComponent)
