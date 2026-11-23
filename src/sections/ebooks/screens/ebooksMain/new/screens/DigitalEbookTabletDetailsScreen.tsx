import React, { memo, useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { globalStyles, layout, staticSafeArea, BrandAppLoader } from '@mu-native/ds'
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
import { DigitalEbookCoverView } from '../components/DigitalEbookCoverView.tsx'
import { useDigitalEbookDetailsChunk } from '../stores/DigitalEbookDetailsStore'

export const DigitalEbookTabletDetailsScreen: React.FC = memo(() => {
    const navigation = useAppNavigation()

    const chunk = useDigitalEbookDetailsChunk()
    const [isLoading, ebook, ebookId] = useValues([
        chunk.props.getIsInitialLoading,
        chunk.props.getEbook,
        chunk.props.getEbookId,
    ])
    const actions = useActions({ fetchDetails: digitalEbooksThunk.fetchDetails })

    useEffect(() => {
        reportEvent(MetricaEvents.SONGBOOK_VIEW, {
            screen: Screen.ebookDetails,
            songbook_id: ebookId,
        })
        return navigation.addListener('focus', () => {
            actions.fetchDetails(chunk)
        })
    }, [])

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
            <View style={styles.right}>
                <DigitalEbookCoverView
                    testID={songbookTestIds.detailsCover}
                    uri={ebook.image_cover_url}
                    style={styles.image}
                />
                <View style={globalStyles.flex1}>
                    <DigitalEbookDetailsTitleSubtitle
                        name={ebook.name}
                        artistOrComposer={ebook.artist_or_composer ?? undefined}
                        textAlign="left"
                        style={styles.titleSubtitle}
                    />
                    <DigitalEbookDetailsDescription
                        description={ebook.description}
                        instruments={ebook.instruments}
                    />
                    <View style={globalStyles.flex1} />
                    <DigitalEbookDetailsButtons style={styles.buttons} />
                </View>
            </View>

            <DigitalEbookDetailsSeparator />
            <DigitalEbookDetailsIncludes chapters={ebook.chapters} />
            <DigitalEbookDetailsSeparator />
            <DigitalEbookDetailsInformation ebook={ebook} style={styles.information} />
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

const styles = StyleSheet.create({
    right: {
        flexDirection: 'row',
        marginHorizontal: layout.baseMarginFromEdges,
        columnGap: 28,
    },

    titleSubtitle: {
        width: '100%',
        marginBottom: 16,
    },

    buttons: {
        marginTop: 16,
    },

    image: {
        width: 271,
        height: 388,
    },

    information: {
        alignSelf: 'center',
    },

    contentContainer: {
        paddingBottom: staticSafeArea().bottomWithAndroid,
    },
})
