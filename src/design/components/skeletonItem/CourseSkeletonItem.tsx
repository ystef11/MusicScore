import { StyleSheet, View } from 'react-native'

import { brandColors } from '../../constants/new/brandColors.ts'

export const CourseSkeletonItem = () => {
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
        width: 232,
        height: 130,
        backgroundColor: brandColors.backgroundInactive,
    },
    title: {
        width: 232,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    user: {
        width: 70,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    description: {
        width: 161,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
})
