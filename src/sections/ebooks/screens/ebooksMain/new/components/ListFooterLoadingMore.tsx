import { StyleSheet, View } from 'react-native'

import { BrandAppLoader } from '@mu-native/ds'

export const ListFooterLoadingMore = () => {
    return (
        <View style={styles.base}>
            <BrandAppLoader size="s" />
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        height: 56,
        alignSelf: 'center',
    },
})
