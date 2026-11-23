import { memo } from 'react'
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'

import { Carousel, colors, layout, layoutHelpers, PaginationDots } from '@mu-native/ds'
import { useValues } from '@ug/store'

import marketingStoreChunk from '../../store/marketingStoreChunk'
import { type TFeatureLandingName } from '../../types/marketingTypes'

import { dotSize, getFeaturesSubscription } from './constants'

const styles = StyleSheet.create({
    featuresContainer: {
        width: '100%',
        backgroundColor: colors.blue100,
        alignItems: 'center',
    },
    itemFeatureContainer: {
        alignItems: 'center',
        alignSelf: 'center',
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    imageFeature: {
        zIndex: 1,
        width: layoutHelpers.getResponsiveSizeExtended(52),
        height: layoutHelpers.getResponsiveSizeExtended(52),
    },
    titleFeature: {
        textAlign: 'center',
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXs),
        fontWeight: '600',
    },
    subTitleFeature: {
        fontWeight: '400',
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        textAlign: 'center',
        maxWidth: layout.maxWidthTabletContainer,
    },
    paginationContainer: {
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    bgImageFeature: {
        padding: layoutHelpers.getResponsiveSizeExtended(8),
        borderRadius: 16,
        backgroundColor: colors.white,
        width: layoutHelpers.getResponsiveSizeExtended(64),
        height: layoutHelpers.getResponsiveSizeExtended(64),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
})

const dynamicStyles = {
    featuresContainer: (topInset: number) =>
        StyleSheet.flatten([styles.featuresContainer, { paddingTop: topInset + layout.marginMd }]),
}

const carouselConfig = {
    parallaxAdjacentItemScale: 0.4,
    parallaxScrollingScale: 0.98,
    parallaxScrollingOffset: 50,
}

const renderItemFeature = ({
    item: { image, title, subTitle },
}: {
    item: { image: ImageSourcePropType; title: string; subTitle: string }
}) => (
    <View style={styles.itemFeatureContainer}>
        <View style={styles.bgImageFeature}>
            <Image source={image} style={styles.imageFeature} />
        </View>
        <Text style={styles.titleFeature}>{title}</Text>
        <Text style={styles.subTitleFeature} numberOfLines={3}>
            {subTitle}
        </Text>
    </View>
)

type FeaturesCarouselComponent = {
    topInset?: number
    landingName?: TFeatureLandingName
    firstFeature?: string
    currentCourseName?: string
}

const FeaturesCarouselComponent = ({
    topInset = 0,
    landingName = 'pro',
    firstFeature = '',
    currentCourseName = '',
}: FeaturesCarouselComponent) => {
    const progressValue = useSharedValue(0)
    const [{ coursesCount }] = useValues([marketingStoreChunk.props.getContentFields])

    const featuresSubscription = getFeaturesSubscription({
        landingName,
        currentCourseName,
        firstFeature,
        coursesCount,
    })

    const featureIndex = featuresSubscription.findIndex(item => item.featureText === firstFeature)
    const initialSlideIndex = featureIndex === -1 ? 0 : featureIndex

    const onProgressChange = (_: number, absoluteProgress: number) => {
        progressValue.value = absoluteProgress
    }

    return (
        <View style={dynamicStyles.featuresContainer(topInset)}>
            <Carousel
                vertical={false}
                defaultIndex={initialSlideIndex}
                height={layoutHelpers.getResponsiveSizeExtended(166)}
                autoPlay
                loop
                snapEnabled
                onProgressChange={onProgressChange}
                autoPlayInterval={4000}
                scrollAnimationDuration={1000}
                width={layout.fullScreenWidth}
                data={featuresSubscription}
                renderItem={renderItemFeature}
                mode="parallax"
                modeConfig={carouselConfig}
            />
            <PaginationDots
                dotSize={dotSize}
                backgroundColor={colors.blue600}
                progressValue={progressValue}
                length={featuresSubscription.length}
                customContainerStyle={styles.paginationContainer}
            />
        </View>
    )
}

export default memo(FeaturesCarouselComponent)
