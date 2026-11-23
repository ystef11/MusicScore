import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout } from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'

export const EmptyFavoritesSearchResults = () => {
    return (
        <View style={styles.emptyContainer}>
            <>
                <Icon source={search} size={48} tint={brandColors.contentPrimary} />
                <AppText
                    rawText={translate('native.search.no.results')}
                    font="f15w500"
                    textAlign="center"
                    style={styles.title}
                />
            </>
        </View>
    )
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignSelf: 'center',
        width: layout.baseMaxWidth,
        alignItems: 'center',
        marginTop: 32,
    },

    title: {
        marginTop: 12,
        marginBottom: 8,
    },
})
