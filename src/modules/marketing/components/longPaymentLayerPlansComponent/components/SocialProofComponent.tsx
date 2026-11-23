import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import { AppText, globalStyles, icons, layout, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    itemFeatureTopBlockContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
    },
    itemReviewContainer: {
        marginLeft: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    itemFeatureContentContainer: {
        marginLeft: layoutHelpers.getResponsiveSizeExtended(12),
        alignItems: 'center',
        flexDirection: 'row',
    },
    mainTitle: {
        fontWeight: '500',
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(32),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    reviewAppStyle: {
        width: layoutHelpers.getResponsiveSizeExtended(168),
        height: layoutHelpers.getResponsiveSizeExtended(72),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
})

export const SocialProofComponent = memo(() => (
    <View style={globalStyles.alignItemsCenter}>
        <AppText
            font="f20w600"
            brandColor="contentPrimary"
            rawText={translate('native.screen_tour.proven')}
            textAlign="center"
            style={globalStyles.mb16}
        />
        <Image
            source={platform.isIos ? icons.reviewIosTour : icons.reviewAndroidTour}
            style={styles.reviewAppStyle}
        />
        <View style={styles.itemReviewContainer}>
            <View style={[styles.itemFeatureContentContainer, globalStyles.mb8]}>
                <AppText
                    adaptiveSize
                    font="f17w600"
                    textAlign="center"
                    brandColor="contentPrimary"
                    rawText={platform.isAndroid ? '8M' : '4.9M'}
                />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.screen_tour.downloads')}
                    style={globalStyles.ml8}
                />
            </View>
            <View style={styles.itemFeatureContentContainer}>
                <AppText
                    adaptiveSize
                    brandColor="contentPrimary"
                    font="f17w600"
                    rawText={platform.isAndroid ? '68K' : '83K'}
                />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    numberOfLines={4}
                    rawText={translate('native.screen_tour.five_star')}
                    style={globalStyles.ml8}
                />
            </View>
        </View>
    </View>
))
