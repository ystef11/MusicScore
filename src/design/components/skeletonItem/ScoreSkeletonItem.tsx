import { StyleSheet, View } from 'react-native'

import { brandColors } from '../../constants/new/brandColors.ts'

export const ScoreSkeletonItem = () => {
    return (
        <View style={{ gap: 4 }}>
            <View style={styles.thumbnail} />
            <View style={styles.title} />
            <View style={styles.user} />
            <View style={styles.description} />
        </View>
    )
}

const styles = StyleSheet.create({
    thumbnail: {
        width: 160,
        height: 160,
        backgroundColor: brandColors.backgroundInactive,
    },
    title: {
        width: 160,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    user: {
        width: 95,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    description: {
        width: 138,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
})
