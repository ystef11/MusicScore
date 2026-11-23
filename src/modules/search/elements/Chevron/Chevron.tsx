import Animated from 'react-native-reanimated'

import { icons } from '@mu-native/ds'

import { styles } from './styles'
import { useRotateAnimation } from './useAnimationItem'

type Props = {
    hidden: boolean
    expanded: boolean
    defaultState?: 'down' | 'right' | 'up'
}

export const Chevron = ({ hidden, expanded, defaultState = 'down' }: Props) => {
    const { rotateStyle } = useRotateAnimation(expanded, defaultState)
    if (hidden) {
        return null
    }

    return (
        <Animated.View style={styles.instrumentChevronContainer}>
            <Animated.Image
                source={icons.chevronDownIcon}
                style={[styles.instrumentChevronExpanded, rotateStyle]}
            />
        </Animated.View>
    )
}
