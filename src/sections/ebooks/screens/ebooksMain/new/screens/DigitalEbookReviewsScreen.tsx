import { memo, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { globalStyles, BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useNavHeader } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbookReviewsList } from '../components/reviews/DigitalEbookReviewsList.tsx'
import { useDigitalEbookReviewsChunk } from '../stores/DigitalEbookReviewsStore.ts'

export const DigitalEbookReviewsScreen = memo(() => {
    useNavHeader(translate('native.ebooks.reviews'))
    const chunk = useDigitalEbookReviewsChunk()

    const [isInitialLoading] = useValues([chunk.props.getIsInitialLoading])
    const actions = useActions({ fetchReviews: digitalEbooksThunk.fetchReviews })

    useEffect(() => {
        actions.fetchReviews(chunk)
    }, [actions, chunk])

    return (
        <View style={globalStyles.flex1}>
            {isInitialLoading && <BrandAppLoader style={styles.loader} />}
            {!isInitialLoading && <DigitalEbookReviewsList />}
        </View>
    )
})
const styles = StyleSheet.create({
    loader: {
        marginTop: 20,
    },
})
