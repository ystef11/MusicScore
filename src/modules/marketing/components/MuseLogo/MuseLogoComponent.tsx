import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Animated, { LinearTransition } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { colors, icons, layout, layoutHelpers } from '@mu-native/ds'

import { subscriptionsGroup } from '../../constants/marketingConstants.ts'
import { TPlanTypeTourInstall, TStockLandingPlanType } from '../../types/marketingTypes.ts'

const styles = StyleSheet.create({
    museLogo: {
        width: layoutHelpers.getResponsiveSizeExtended(148),
        height: layoutHelpers.getResponsiveSizeExtended(30),
    },
    museLogoContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    subscriptionGroupGradientContainer: {
        minWidth: layoutHelpers.getResponsiveSizeExtended(70),
        height: layoutHelpers.getResponsiveSizeExtended(28),
        marginLeft: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(8),
        borderRadius: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: platform.isAndroid ? 'flex-start' : 'center',
        backgroundColor: colors.brandColor,
    },
    groupTextStyle: {
        fontWeight: '600',
        fontSize: layoutHelpers.getResponsiveSizeExtended(20),
        color: colors.white,
    },
})

const MuseLogoComponentWithoutMemo = ({
    subscriptionName,
}: {
    subscriptionName?: TStockLandingPlanType | TPlanTypeTourInstall
}) => {
    return (
        <View style={styles.museLogoContainer}>
            <Image source={icons.musescoreLogo} style={styles.museLogo} />

            {!!subscriptionName && (
                <View style={styles.subscriptionGroupGradientContainer}>
                    <Animated.Text
                        layout={LinearTransition.duration(300)}
                        style={styles.groupTextStyle}
                    >
                        {subscriptionsGroup[subscriptionName] || ''}
                    </Animated.Text>
                </View>
            )}
        </View>
    )
}

export const MuseLogoComponent = memo(MuseLogoComponentWithoutMemo)
