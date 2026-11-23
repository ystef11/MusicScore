import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

export const DigitalEbookSearchEmptyResult = memo(() => {
    return (
        <View style={styles.container}>
            <AppText
                font="f15w500"
                rawText={translate('native.ebook.filter_empty_title')}
                textAlign="center"
                style={styles.title}
            />
            <AppText
                font="f15w400"
                textAlign="center"
                rawText={translate('native.ebook.filter_empty_subtitle')}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    title: {
        marginBottom: 8,
        marginTop: 32,
    },
})
