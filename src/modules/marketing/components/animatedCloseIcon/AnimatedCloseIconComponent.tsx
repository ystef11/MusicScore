import { memo, useEffect } from 'react'
import { Image, ImageStyle, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from 'react-native-reanimated'

import { colors, icons, layoutHelpers } from '@mu-native/ds'

const closeIconSize = layoutHelpers.isSmallScreenIos ? 20 : 24
const arrowIconSize = 18

const closeIconBackgroundSize = layoutHelpers.isSmallScreenIos ? 28 : 32
const styles = StyleSheet.create({
    closeIconContainer: {
        width: closeIconBackgroundSize,
        height: closeIconBackgroundSize,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 32,
    },
    closeIconBackground: {
        backgroundColor: colors.link,
        width: closeIconBackgroundSize,
        height: closeIconBackgroundSize,
        borderRadius: 32,
        ...StyleSheet.absoluteFill,
    },
    closeIcon: {
        width: closeIconSize,
        height: closeIconSize,
        alignSelf: 'center',
    },
    arrowIcon: {
        width: arrowIconSize,
        height: arrowIconSize,
        alignSelf: 'center',
    },
})

const dynamicStyles = {
    containerImageFlatten: (customBgImageStyle?: StyleProp<ViewStyle>) =>
        StyleSheet.flatten([styles.closeIconContainer, !!customBgImageStyle && customBgImageStyle]),
    imageFlattenStyle: (isArrowIcon: boolean, customIconStyle: StyleProp<ImageStyle>) =>
        StyleSheet.flatten([
            isArrowIcon ? styles.arrowIcon : styles.closeIcon,
            !!customIconStyle && customIconStyle,
        ]),
}
type TAnimatedCloseIconComponent = Partial<{
    animationDuration?: number
    isHidded: boolean
    iconStartOpacity: number
    iconFinishOpacity: number
    iconHiddenOpacity: number
    backgroundStartOpacity: number
    backgroundFinishOpacity: number
    backgroundColor: string
    isArrowIcon: boolean
    customIconStyle?: StyleProp<ImageStyle>
    customBgImageStyle?: StyleProp<ViewStyle>
    customIconColorStyle?: StyleProp<ImageStyle>
    closeIconContainerStyle?: StyleProp<ViewStyle>
    testID: string
}>

const AnimatedCloseIconComponent = ({
    animationDuration,
    isHidded = false,
    iconStartOpacity = 0.8,
    iconFinishOpacity = 1,
    iconHiddenOpacity = 0.75,
    backgroundStartOpacity = 0,
    backgroundFinishOpacity = 0.5,
    backgroundColor = colors.link,
    isArrowIcon = false,
    customIconStyle = null,
    customBgImageStyle,
    customIconColorStyle,
    closeIconContainerStyle,
    testID,
}: TAnimatedCloseIconComponent) => {
    const backgroundOpacity = useSharedValue(backgroundStartOpacity)
    const iconOpacity = useSharedValue(iconStartOpacity)

    useEffect(() => {
        iconOpacity.value = withDelay(
            500,
            withTiming(iconFinishOpacity, { duration: animationDuration ?? 5000 }),
        )
        backgroundOpacity.value = withDelay(
            500,
            withTiming(backgroundFinishOpacity, { duration: animationDuration ?? 5000 }),
        )
    }, [])

    const iconSource = isArrowIcon ? icons.iosBackIcon : icons.closeMd

    const opacityBackgroundStyle = useAnimatedStyle(() => ({
        opacity: backgroundOpacity.value,
    }))
    const iconOpacityStyle = useAnimatedStyle(() => ({
        opacity: isHidded ? iconHiddenOpacity : iconOpacity.value,
    }))

    if (animationDuration)
        return (
            <View
                style={[
                    styles.closeIconContainer,
                    !!closeIconContainerStyle && closeIconContainerStyle,
                ]}
            >
                {!isHidded && (
                    <Reanimated.View
                        style={[
                            styles.closeIconBackground,
                            { backgroundColor },
                            customBgImageStyle,
                            opacityBackgroundStyle,
                        ]}
                    />
                )}
                <Reanimated.Image
                    source={iconSource}
                    style={[
                        isArrowIcon ? styles.arrowIcon : styles.closeIcon,
                        !!customIconColorStyle && customIconColorStyle,
                        iconOpacityStyle,
                    ]}
                />
            </View>
        )

    return (
        <View style={dynamicStyles.containerImageFlatten(customBgImageStyle)}>
            <Image
                source={iconSource}
                style={dynamicStyles.imageFlattenStyle(isArrowIcon, customIconStyle)}
            />
        </View>
    )
}

export default memo(AnimatedCloseIconComponent)
