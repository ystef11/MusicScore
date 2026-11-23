import { Pressable, StyleSheet, Text, View } from 'react-native'
import { brandColors } from '@mu-native/ds'

export function FavoritesLoadError({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <View style={styles.container}>
            <Text accessibilityRole="alert" style={styles.message}>{message}</Text>
            <Pressable accessibilityRole="button" onPress={onRetry}>
                <Text style={styles.retry}>Повторить загрузку</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    container: { paddingHorizontal: 16, paddingVertical: 8 },
    message: { color: brandColors.contentPrimary },
    retry: { color: brandColors.accentPrimary, paddingVertical: 12 },
})
