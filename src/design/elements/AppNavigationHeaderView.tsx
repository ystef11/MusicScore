import React, { memo } from 'react'
import { Image, Platform, Pressable, StyleSheet, View } from 'react-native'
import Animated, { interpolate, useAnimatedStyle } from 'react-native-reanimated'

import { chevronLeft } from '@mu-native/icons/chevronLeft'

import { AppText } from '../components/AppText/AppText'
import { icons } from '../constants/icons'
import { layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors'
import { useAppSafeArea } from '../hooks/useAppSafeArea'
import { TOP_BAR_ROW_HEIGHT, useTopBarScrollOffset } from '../hooks/useTopBarScrollAnimation'

import { NavigationIconButton } from './buttons/NavigationIconButton'

type TProps = {
    readonly testID?: string
    readonly goBack?: () => void
    readonly title?: string
    readonly showAppLogo?: boolean
    readonly rightBlock?: () => React.ReactNode | null | undefined
    readonly titleNumberOfLines?: number
    readonly children?: React.ReactNode | null
    readonly animatable?: boolean
    /** Fired when the app logo is pressed. Consumers wire analytics here. */
    readonly onLogoPress?: () => void
}

const AppLogo = memo(({ onPress }: { readonly onPress?: () => void }) => {
    return (
        <Pressable onPress={onPress}>
            <Image
                testID="MuseScore logo"
                source={icons.museScore2}
                style={styles.logo}
                resizeMode="contain"
            />
        </Pressable>
    )
})

export const AppNavigationHeaderView = memo((props: TProps) => {
    const insets = useAppSafeArea()
    const top = insets.top - (Platform.OS === 'ios' ? 13 : 0)
    const scrollOffset = useTopBarScrollOffset()

    const containerAnimatedStyle = useAnimatedStyle(() => {
        if (props.animatable === false) {
            return {}
        }
        const value = scrollOffset?.value ?? 0
        return {
            height: interpolate(
                value,
                [0, TOP_BAR_ROW_HEIGHT],
                [top + TOP_BAR_ROW_HEIGHT, top],
                'clamp',
            ),
        }
    })

    const rowAnimatedStyle = useAnimatedStyle(() => {
        const value = scrollOffset?.value ?? 0
        return {
            opacity: interpolate(value, [0, TOP_BAR_ROW_HEIGHT], [1, 0], 'clamp'),
            transform: [
                {
                    translateY: interpolate(
                        value,
                        [0, TOP_BAR_ROW_HEIGHT],
                        [0, -TOP_BAR_ROW_HEIGHT],
                        'clamp',
                    ),
                },
            ],
        }
    })

    return (
        <Animated.View style={[styles.container, { paddingTop: top }, containerAnimatedStyle]}>
            <Animated.View style={[styles.row, rowAnimatedStyle]}>
                {!!props.title && !props.showAppLogo && (
                    <View style={styles.titleOverlay} pointerEvents="none">
                        <AppText
                            font="f17w600"
                            brandColor="contentPrimary"
                            rawText={props.title}
                            numberOfLines={props.titleNumberOfLines}
                        />
                    </View>
                )}
                {!!props.goBack && (
                    <NavigationIconButton
                        testID={props.testID || undefined}
                        onPress={props.goBack}
                        styles={styles.backButton}
                        icon={chevronLeft}
                        color={brandColors.contentPrimary}
                    />
                )}
                {props.showAppLogo && <AppLogo onPress={props.onLogoPress} />}
                <View style={styles.buttonsContainer}>{props.rightBlock?.()}</View>
            </Animated.View>
            {props.children}
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    container: {
        backgroundColor: brandColors.backgroundDefault,
        overflow: 'hidden',
    },
    row: {
        height: TOP_BAR_ROW_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    backButton: {
        marginRight: 12,
    },
    titleOverlay: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        // Keep the centered title clear of the back button (edge margin 16 +
        // button 44 + gap 12) and its mirrored area on the right.
        paddingHorizontal: 72,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexShrink: 1,
    },
    logo: {
        width: 145,
        height: 28,
    },
})
