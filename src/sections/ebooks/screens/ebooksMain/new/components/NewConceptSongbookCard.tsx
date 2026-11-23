import { memo } from 'react'
import { StyleSheet, useWindowDimensions } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText, CommonTouchable, getCarouselItemWidth, layout } from '@mu-native/ds'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

import { DigitalEbookCoverView } from './DigitalEbookCoverView'

type TProps = {
    item: DigitalEbookModel
    onPress: (item: DigitalEbookModel) => void
}

const COVER_ASPECT = 227 / 171
const COVER_GAP = layout.marginSm
// Match the new-concept "wide" breakpoint: scale covers down on iPad-sized
// canvases instead of locking to phone's 2-up (which makes them enormous).
const WIDE_BREAKPOINT = 700
const COVER_TARGET_WIDTH = 280

const capitalize = (text: string) => (text ? text.charAt(0).toUpperCase() + text.slice(1) : text)

export const NewConceptSongbookCard = memo(({ item, onPress }: TProps) => {
    const subtitle = capitalize(item.instruments?.[0] ?? '')

    const { width } = useWindowDimensions()
    // Phone keeps two covers per viewport with a sliver of the next (Figma);
    // wide canvases use the shared carousel scale to stay in proportion with
    // the score grids.
    const cardWidth =
        width >= WIDE_BREAKPOINT
            ? getCarouselItemWidth(width, COVER_TARGET_WIDTH, COVER_GAP)
            : (width - layout.baseMarginFromEdges * 2 - COVER_GAP) / 2
    const imageHeight = Math.round(cardWidth * COVER_ASPECT)

    return (
        <CommonTouchable
            testID={songbookTestIds.feedItem}
            onPress={() => onPress(item)}
            style={[styles.container, { width: cardWidth }]}
        >
            <DigitalEbookCoverView
                uri={item.generated_cover_path}
                style={[styles.image, { height: imageHeight }]}
            />
            <AppText
                rawText={item.name}
                style={styles.title}
                font="f15w500"
                numberOfLines={2}
                ellipsizeMode="tail"
            />
            {!!subtitle && (
                <AppText
                    rawText={subtitle}
                    style={styles.subtitle}
                    brandColor="contentSecondary"
                    font="f15w400"
                    numberOfLines={1}
                />
            )}
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    container: {},
    image: {
        width: '100%',
    },
    title: {
        marginTop: layout.marginSm,
    },
    subtitle: {
        marginTop: layout.marginXs,
    },
})
