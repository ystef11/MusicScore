import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import { useDigitalEbookReviewsChunk } from '../../stores/DigitalEbookReviewsStore.ts'

export const DigitalEbookReviewsListHeader = memo(() => {
    const chunk = useDigitalEbookReviewsChunk()
    const [totalCount] = useValues([chunk.props.getTotalCount])
    if (totalCount === 0) return null

    return (
        <View style={styles.base}>
            <AppText font="f15w500" rawText={translate('native.ebooks.reviews')} />
            <AppText font="f15w500" brandColor="contentTertiary" rawText={totalCount.toString()} />
        </View>
    )
})

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 24,
        columnGap: 4,
    },
})
