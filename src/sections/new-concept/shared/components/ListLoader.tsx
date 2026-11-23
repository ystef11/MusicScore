import { StyleSheet, View } from 'react-native'

import { BrandAppLoader, layout } from '@mu-native/ds'

/**
 * Centered spinner meant to be used as a list's `ListEmptyComponent` while the
 * first page is loading. `flex: 1` centers it in the list's free space (the list
 * content container must set `flexGrow: 1`); the vertical padding is a fallback
 * when no free space is available.
 */
export const ListLoader = () => (
    <View style={styles.container}>
        <BrandAppLoader />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layout.marginLg * 2,
    },
})
