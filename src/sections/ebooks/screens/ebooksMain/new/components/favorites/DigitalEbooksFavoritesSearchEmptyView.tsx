import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

export const DigitalEbooksFavoritesSearchEmptyView = memo(() => {
    return (
        <View style={styles.base}>
            <AppText
                font="f15w600"
                rawText={translate('native.ebook.filter_empty_title')}
                textAlign="center"
            />
            <AppText
                textAlign="center"
                font="f15w400"
                rawText={translate('native.ebook.filter_empty_subtitle')}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    base: {
        flex: 1,
        rowGap: 8,
        marginTop: 32,
    },

    columnWrapper: {
        columnGap: 40,
    },
})
