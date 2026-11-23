import { StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'

type TProps = {
    /** 0..1 watched ratio */
    ratio: number
}

export const CourseProgressBar = ({ ratio }: TProps) => {
    const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100)

    return (
        <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
        </View>
    )
}

const styles = StyleSheet.create({
    track: {
        height: 4,
        borderRadius: 1,
        backgroundColor: brandColors.colorBackgroundDisabled,
        overflow: 'hidden',
    },
    fill: {
        height: 4,
        borderRadius: 2,
        backgroundColor: brandColors.accentPrimary,
    },
})
