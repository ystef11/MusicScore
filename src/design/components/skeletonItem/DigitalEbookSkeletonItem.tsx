import { StyleSheet, View } from 'react-native'

import { brandColors } from '../../constants/new/brandColors.ts'

export const DigitalEbookSkeletonItem = () => {
    return (
        <View style={{ gap: 4 }}>
            <View style={styles.thumbnail} />
            <View style={styles.title} />
            <View style={styles.user} />
        </View>
    )
}

const styles = StyleSheet.create({
    thumbnail: {
        width: 160,
        height: 212,
        backgroundColor: brandColors.backgroundInactive,
    },
    title: {
        width: 160,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
    user: {
        width: 142,
        height: 20,
        backgroundColor: brandColors.backgroundInactive,
    },
})
