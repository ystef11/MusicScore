import { Image, ImageSourcePropType, StyleSheet, View, ViewStyle } from 'react-native'

import { colors } from '../constants/colors'
import { globalStyles, layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors'
import { layoutHelpers } from '../helpers/layout'

import { AppText } from './AppText/AppText'
import { Stars } from './Stars'

const styles = StyleSheet.create({
    itemFeatureContainer: {
        width: '100%',
        backgroundColor: brandColors.backgroundHighlight,
        borderColor: colors.colorBorder,
        borderWidth: 1,
        borderRadius: 0,
        alignSelf: 'center',
        maxWidth: layout.maxWidthTabletContainer,
        minHeight: layoutHelpers.getResponsiveSizeExtended(256),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginLg),
    },
    reviewAvatarStyle: {
        width: layoutHelpers.getResponsiveSizeExtended(40),
        height: layoutHelpers.getResponsiveSizeExtended(40),
        borderRadius: 50,
    },
    itemFeatureTopBlockContainer: {
        flexDirection: 'row',
    },
    customStarContainerStyle: {
        marginLeft: -2,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(8),
    },
    itemFeatureContentContainer: {
        flex: 1,
        marginLeft: layoutHelpers.getResponsiveSizeExtended(12),
        alignItems: 'flex-start',
    },
})

type TUserReviewCardProps = {
    image: ImageSourcePropType
    star: number
    name: string
    text: string
    style?: ViewStyle
}

export const UserReviewCardComponent = ({
    image,
    star,
    name,
    text,
    style,
}: TUserReviewCardProps) => (
    <View style={[styles.itemFeatureContainer, style]}>
        <View style={styles.itemFeatureTopBlockContainer}>
            <Image source={image} style={styles.reviewAvatarStyle} />
            <View style={styles.itemFeatureContentContainer}>
                <AppText
                    font="f13w600"
                    brandColor="contentPrimary"
                    adaptiveSize
                    rawText={name}
                    style={globalStyles.mb4}
                />
                <Stars
                    customContainerStyle={styles.customStarContainerStyle}
                    userRating={star}
                    onRate={() => ''}
                />
                <AppText adaptiveSize font="f15w400" rawText={text} lineHeight={22} />
            </View>
        </View>
    </View>
)
