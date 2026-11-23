import { memo } from 'react'
import {
    Image,
    ImageURISource,
    StyleProp,
    StyleSheet,
    TextStyle,
    View,
    ViewStyle,
} from 'react-native'

import { AppText, brandColors, CommonTouchable, layoutHelpers, BrandAppLoader } from '@mu-native/ds'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: layoutHelpers.getResponsiveSizeExtended(48),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        borderWidth: StyleSheet.hairlineWidth,
        marginBottom: 8,
    },
    rebrandingStyle: {
        borderRadius: 30,
        borderWidth: 0,
        backgroundColor: brandColors.backgroundInactive,
    },
    icon: {
        width: 24,
        height: 24,
        position: 'absolute',
        left: 12,
    },
    title: {
        top: 1,
        maxWidth: '80%',
        marginHorizontal: layoutHelpers.getResponsiveSizeExtended(8),
    },
    rebrandingIcon: {
        alignSelf: 'center',
        left: undefined,
    },
    contentCenter: {
        width: '100%',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    rebrandingIconBg: {
        alignItems: 'center',
        borderRadius: 50,
        width: 26,
        height: 26,
        justifyContent: 'center',
    },
    centerIcon: { left: undefined, alignSelf: 'center' },
})

type TProps = {
    onPress: () => void
    icon?: ImageURISource
    title: string
    isLoading?: boolean
    disabled?: boolean
    isHidden?: boolean
    testID?: string
    isRebrandingStyle?: boolean
    style?: StyleProp<ViewStyle>
    textStyle?: TextStyle
    bgIcon?: string
    tintColor?: string
}

const Button = ({
    onPress,
    icon,
    title,
    isLoading,
    disabled,
    isHidden,
    testID,
    isRebrandingStyle = false,
    style,
    textStyle,
    bgIcon,
    tintColor,
}: TProps) => {
    if (isHidden) return null

    return (
        <CommonTouchable
            style={[styles.container, isRebrandingStyle && styles.rebrandingStyle, style]}
            onPress={disabled || isLoading ? undefined : onPress}
            disabled={disabled}
            testID={testID}
        >
            {!isRebrandingStyle && !!icon && <Image source={icon} style={styles.icon} />}
            {isLoading ? (
                <BrandAppLoader size="s" color="#bbb" />
            ) : (
                <View style={styles.contentCenter}>
                    {isRebrandingStyle && !!icon && (
                        <View
                            style={[
                                styles.rebrandingIconBg,
                                !title && styles.centerIcon,
                                { backgroundColor: bgIcon },
                            ]}
                        >
                            <Image
                                source={icon}
                                tintColor={tintColor}
                                style={[styles.icon, styles.rebrandingIcon]}
                            />
                        </View>
                    )}
                    {!!title && (
                        <AppText
                            font="f15w500"
                            adaptiveSize
                            style={[styles.title, textStyle]}
                            numberOfLines={1}
                            rawText={title}
                        />
                    )}
                </View>
            )}
        </CommonTouchable>
    )
}

export default memo(Button)
