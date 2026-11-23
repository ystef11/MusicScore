import { memo, useEffect } from 'react'
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import Reanimated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { icons, layoutHelpers, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import formatDate from '../../../../../../App/Utils/Date'
import { marketingConstants } from '../../../../constants/marketingConstants'
import marketingStoreChunk from '../../../../store/marketingStoreChunk'

const BADGE_LEFT_SMALL_PLAN = layoutHelpers.getResponsiveSizeExtended(18)
const BADGE_TOP_SMALL_PLAN = layoutHelpers.getResponsiveSizeExtended(4)

const BADGE_ANIMATION_DURATION = 300

const styles = StyleSheet.create({
    badge: {
        position: 'absolute',
        borderRadius: 0,
        borderBottomLeftRadius: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
        maxHeight: layoutHelpers.getResponsiveSizeExtended(18),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(1),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
    },
    badgeText: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(platform.isTablet ? 9 : 11),
        fontWeight: 'bold',
    },
    badgeTimerContainer: style.view({ flexDirection: 'row', justifyContent: 'center' }),
    badgeTimer: {
        width: layoutHelpers.getResponsiveSizeExtended(12),
        height: layoutHelpers.getResponsiveSizeExtended(12),
        alignSelf: 'center',
        marginRight: layoutHelpers.getResponsiveSizeExtended(8),
    },
    hidden: {
        position: 'absolute',
        opacity: 0,
        paddingRight: layoutHelpers.getResponsiveSizeExtended(3),
    },
    absoluteTextStyle: {
        position: 'absolute',
        right: 0,
    },
})
const widthBadgePhone = platform.isAndroid ? 74 : 84
const widthTablet = platform.isTablet ? 68 : widthBadgePhone

const dynamicStyles = {
    badgeStyle: (backgroundColor: string, isBigBadge: boolean) =>
        StyleSheet.flatten([
            styles.badge,
            { backgroundColor },
            isBigBadge && {
                width: '100%',
                borderBottomRightRadius: 0,
                maxHeight: 30,
                top: 6,
                paddingVertical: layoutHelpers.getResponsiveSizeExtended(4),
            },
        ]) as StyleProp<ViewStyle>,
    badgeTextWithColor: (textColor: string, isAbsoluteStyle: boolean) =>
        StyleSheet.flatten([
            styles.badgeText,
            isAbsoluteStyle && styles.absoluteTextStyle,
            { color: textColor },
        ]),
    badgeTextForCalculateWidth: StyleSheet.flatten([styles.badgeText, styles.hidden]),
    badgeTimerTextWithColor: (textColor: string) =>
        StyleSheet.flatten([
            styles.badgeText,
            {
                color: textColor,
                minWidth: layoutHelpers.getResponsiveSizeExtended(widthTablet),
                paddingRight: layoutHelpers.getResponsiveSizeExtended(24),
            },
        ]),
    badgeTimerImage: (textColor: string) =>
        StyleSheet.flatten([styles.badgeTimer, { tintColor: textColor }]),
}

type BadgeProps = {
    text: string
    backgroundColor: string
    textColor: string
    isShowTimer?: boolean
    isBigBadge: boolean
    isSmallPlan?: boolean
}

const date = formatDate(marketingConstants.dateForBadgeTimer, 'HH:mm:ss')

const BadgeComponent = ({
    text,
    backgroundColor,
    textColor,
    isShowTimer = false,
    isBigBadge,
    isSmallPlan = false,
}: BadgeProps) => {
    const [timerTour] = useValues([marketingStoreChunk.props.getTimerTour])
    const date24Format = timerTour
        ? `${formatDate(timerTour, 'HH:mm:ss')}`
        : translate('native.marketing.last_chance')

    const badgeLeft = useSharedValue(isSmallPlan ? BADGE_LEFT_SMALL_PLAN : 0)
    const badgeTop = useSharedValue(isSmallPlan ? BADGE_TOP_SMALL_PLAN : 0)

    useEffect(() => {
        badgeLeft.value = withTiming(isSmallPlan ? BADGE_LEFT_SMALL_PLAN : 0, {
            duration: BADGE_ANIMATION_DURATION,
        })
        badgeTop.value = withTiming(isSmallPlan ? BADGE_TOP_SMALL_PLAN : 0, {
            duration: BADGE_ANIMATION_DURATION,
        })
    }, [badgeLeft, isSmallPlan])

    const animatedBadgeStyle = useAnimatedStyle(() => ({
        left: badgeLeft.value,
        top: badgeTop.value,
    }))

    return (
        <Reanimated.View
            style={[dynamicStyles.badgeStyle(backgroundColor, isBigBadge), animatedBadgeStyle]}
        >
            {isShowTimer ? (
                <View style={styles.badgeTimerContainer}>
                    <Image
                        source={icons.timerTour}
                        style={dynamicStyles.badgeTimerImage(textColor)}
                    />
                    <Text style={dynamicStyles.badgeTimerTextWithColor(textColor)}>
                        {date24Format}
                    </Text>
                    {!!timerTour && (
                        <Text style={dynamicStyles.badgeTextWithColor(textColor, true)}>
                            {translate('native.marketing.timer_left')}
                        </Text>
                    )}
                    <Text style={dynamicStyles.badgeTextForCalculateWidth}>{date}</Text>
                </View>
            ) : (
                <Text style={dynamicStyles.badgeTextWithColor(textColor, false)}>{text}</Text>
            )}
        </Reanimated.View>
    )
}

export default memo(BadgeComponent)
