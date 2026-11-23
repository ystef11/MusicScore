import { memo } from 'react'
import { ImageSourcePropType, StyleSheet, View } from 'react-native'
import { PanGesture } from 'react-native-gesture-handler'
import { useSharedValue } from 'react-native-reanimated'

import { useDimensions } from '@mu-native/common'
import {
    brandColors,
    Carousel,
    icons,
    layout,
    layoutHelpers,
    PaginationDots,
    UserReviewCardComponent,
} from '@mu-native/ds'
import { PlainLocaleKey, translate } from '@mu-native/locale'

const dynamicStyles = {
    featuresContainer: (topInset: number) =>
        StyleSheet.flatten([styles.featuresContainer, { paddingTop: topInset + layout.marginMd }]),
}

const renderItemReview = ({
    item: { image, star, name, text },
}: {
    item: { image: ImageSourcePropType; star: number; name: string; text: PlainLocaleKey }
}) => <UserReviewCardComponent image={image} star={star} name={name} text={translate(text)} />

const reviewData: {
    name: string
    star: number
    image: ImageSourcePropType
    text: PlainLocaleKey
}[] = [
    {
        name: 'Whitney Emilia',
        star: 5,
        image: icons.reviewAuthor1,
        text: 'native.marketing.reviews.whitney',
    },
    {
        name: 'Lucy Addison',
        star: 5,
        image: icons.reviewAuthor2,
        text: 'native.marketing.reviews.lucy',
    },
    {
        name: 'Jacob Watson',
        star: 4,
        image: icons.reviewAuthor3,
        text: 'native.marketing.reviews.jacob',
    },
]
const onConfigurePanGesture = (g: PanGesture) => {
    'worklet'

    // Disable vertical gestures
    g.activeOffsetY([-999999, 999999])
    // Enable horizontal gestures with a small threshold
    g.activeOffsetX([-5, 5])
}

const carouselConfig = {
    parallaxAdjacentItemScale: 0.9,
    parallaxScrollingScale: 0.9,
    parallaxScrollingOffset: 28,
}

type FeaturesCarouselComponent = {
    topInset?: number
}

export const FeaturesCarouselComponent = memo(({ topInset = 0 }: FeaturesCarouselComponent) => {
    const progressValue = useSharedValue(0)
    const { width } = useDimensions('window')

    return (
        <View style={dynamicStyles.featuresContainer(topInset)}>
            <Carousel
                defaultIndex={0}
                height={layoutHelpers.getResponsiveSizeExtended(256)}
                loop={false}
                pagingEnabled
                snapEnabled
                style={{ width }}
                onProgressChange={progressValue}
                scrollAnimationDuration={300}
                width={width}
                data={reviewData}
                renderItem={renderItemReview}
                mode="parallax"
                modeConfig={carouselConfig}
                onConfigurePanGesture={onConfigurePanGesture}
            />
            <PaginationDots
                backgroundColor={brandColors.contentPrimary}
                progressValue={progressValue}
                length={reviewData.length}
                customContainerStyle={styles.paginationContainer}
                inactiveBgColorDots={brandColors.contentTertiary}
            />
        </View>
    )
})

const styles = StyleSheet.create({
    featuresContainer: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(20),
    },
    paginationContainer: {
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
})
