import React, { memo, useEffect } from 'react'
import { Dimensions, ScrollView, StyleSheet } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import {
    brandColors,
    layout,
    staticSafeArea,
    randomBrandColor,
    BrandAppLoader,
} from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { digitalEbooksThunk } from '../api/digitalEbooksThunk.ts'
import { DigitalEbookDetailsButtons } from '../components/details/DigitalEbookDetailsButtons'
import { DigitalEbookDetailsDescription } from '../components/details/DigitalEbookDetailsDescription'
import { DigitalEbookDetailsIncludes } from '../components/details/DigitalEbookDetailsIncludes'
import { DigitalEbookDetailsInformation } from '../components/details/DigitalEbookDetailsInformation'
import { DigitalEbookDetailsLastReview } from '../components/details/DigitalEbookDetailsLastReview'
import { DigitalEbookDetailsSeparator } from '../components/details/DigitalEbookDetailsSeparator'
import { DigitalEbookDetailsTitleSubtitle } from '../components/details/DigitalEbookDetailsTitleSubtitle'
import { DigitalEbooksDetailsSimilarView } from '../components/details/DigitalEbooksDetailsSimilarView.tsx'
import { DigitalEbookCoverView } from '../components/DigitalEbookCoverView'
import { useDigitalEbookDetailsChunk } from '../stores/DigitalEbookDetailsStore'

export const DigitalEbooksDetailsScreen: React.FC = memo(() => {
    const navigation = useAppNavigation()

    const chunk = useDigitalEbookDetailsChunk()
    const [isLoading, ebook] = useValues([chunk.props.getIsInitialLoading, chunk.props.getEbook])
    const actions = useActions({
        fetchDetails: digitalEbooksThunk.fetchDetails,
    })

    useEffect(() => {
        reportEvent(MetricaEvents.SONGBOOK_VIEW, {
            screen: Screen.ebookDetails,
            songbook_id: ebook?.id,
        })
        return navigation.addListener('focus', () => {
            actions.fetchDetails(chunk)
        })
    }, [actions, chunk, ebook?.id, navigation])

    if (isLoading) {
        return <BrandAppLoader />
    }
    if (!ebook) {
        navigation.goBack()
        return null
    }

    return (
        <ScrollView
            testID={songbookTestIds.detailsScreen}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <DigitalEbookCoverView
                testID={songbookTestIds.detailsCover}
                uri={ebook.image_cover_url}
                style={styles.image}
            />
            <DigitalEbookDetailsTitleSubtitle
                name={ebook.name}
                artistOrComposer={ebook.artist_or_composer ?? undefined}
                style={styles.titleSubtitle}
            />
            <DigitalEbookDetailsButtons style={styles.buttons} />
            <DigitalEbookDetailsDescription
                description={ebook.description}
                instruments={ebook.instruments}
                style={styles.description}
            />
            <DigitalEbookDetailsIncludes chapters={ebook.chapters} />
            <DigitalEbookDetailsInformation ebook={ebook} />
            <DigitalEbookDetailsSeparator />
            <DigitalEbookDetailsLastReview
                commentCount={ebook.comment_count}
                comment={ebook.comment ?? undefined}
            />
            <DigitalEbookDetailsSeparator />
            <DigitalEbooksDetailsSimilarView />
        </ScrollView>
    )
})

const coverWidth = Dimensions.get('window').width - 52 - 52

const styles = StyleSheet.create({
    titleSubtitle: {
        marginTop: 28,
        marginHorizontal: layout.baseMarginFromEdges,
    },

    description: {
        marginHorizontal: layout.baseMarginFromEdges,
    },

    buttons: {
        marginBottom: 28,
        marginTop: 16,
        marginHorizontal: layout.baseMarginFromEdges,
    },

    image: {
        width: coverWidth,
        height: coverWidth * (388 / 271),
        backgroundColor: randomBrandColor(),
        alignSelf: 'center',
        overflow: 'hidden',
        borderRadius: 2,
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
    },

    contentContainer: {
        paddingBottom: staticSafeArea().bottomWithAndroid,
    },
})
