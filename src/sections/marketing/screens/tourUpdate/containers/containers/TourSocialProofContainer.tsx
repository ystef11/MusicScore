import { memo } from 'react'
import { Image, ImageSourcePropType, ScrollView, StyleSheet } from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { colors, icons, layout, layoutHelpers, UserReviewCardComponent } from '@mu-native/ds'
import { PlainLocaleKey, translate } from '@mu-native/locale'

const closeIconBgStyle = 'rgba(255,255,255,0.5)'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    fullWidth: { width: '100%', backgroundColor: colors.white },
    scoreImageStyle: {
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        aspectRatio: 1.5,
        alignSelf: 'center',
    },
    contentContainer: {
        width: '100%',
        maxWidth: layout.maxWidthTabletContainer,
        justifyContent: 'center',
        alignSelf: 'center',
        backgroundColor: colors.white,
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(12),
        paddingHorizontal: platform.isTablet ? 0 : layoutHelpers.getResponsiveSizeExtended(20),
    },
    scrollViewContainer: {
        flexGrow: 1,
        alignItems: 'center',
        padding: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(120),
    },
    closeIconBgStyle: {
        backgroundColor: closeIconBgStyle,
    },
    closeIconContainerStyle: {
        marginLeft: layoutHelpers.getResponsiveSizeExtended(20),
    },
    reviewCard: {
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        minHeight: 'auto',
    },
})

const reviewData: {
    key: string
    name: PlainLocaleKey
    star: number
    image: ImageSourcePropType
    text: PlainLocaleKey
}[] = [
    {
        key: 'mark',
        name: 'native.marketing.tour_update.review_mark_name',
        star: 5,
        image: icons.reviewAuthor4,
        text: 'native.marketing.tour_update.review_mark_text',
    },
    {
        key: 'lisa',
        name: 'native.marketing.tour_update.review_lisa_name',
        star: 5,
        image: icons.reviewAuthor5,
        text: 'native.marketing.tour_update.review_lisa_text',
    },
    {
        key: 'julia',
        name: 'native.marketing.tour_update.review_julia_name',
        star: 5,
        image: icons.reviewAuthor6,
        text: 'native.marketing.tour_update.review_julia_text',
    },
]

export const TourSocialProofContainer = memo(() => {
    return (
        <Animated.View
            entering={FadeIn.duration(600)}
            exiting={FadeOut.duration(500)}
            style={styles.container}
        >
            <Image
                resizeMode="cover"
                source={icons.tourUpdateSocialProof}
                style={styles.scoreImageStyle}
            />
            <ScrollView
                style={styles.fullWidth}
                scrollEnabled
                contentContainerStyle={styles.scrollViewContainer}
            >
                {reviewData.map(({ key, name, star, image, text }) => (
                    <UserReviewCardComponent
                        key={key}
                        name={translate(name)}
                        star={star}
                        image={image}
                        text={translate(text)}
                        style={styles.reviewCard}
                    />
                ))}
            </ScrollView>
        </Animated.View>
    )
})
