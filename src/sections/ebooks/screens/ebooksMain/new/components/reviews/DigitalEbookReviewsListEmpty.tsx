import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

export const DigitalEbookReviewsListEmpty = memo(() => {
    return (
        <View style={styles.base}>
            <AppText
                rawText={translate('native.review.empty_list_title')}
                textAlign="center"
                font="f15w500"
            />
            <AppText
                textAlign="center"
                font="f15w400"
                rawText={translate('native.review.empty_list_message')}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    base: {
        flex: 1,
        alignItems: 'center',
        marginTop: 100,
        rowGap: 8,
    },
})
