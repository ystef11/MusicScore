import { memo } from 'react'
import { ImageStyle, StyleSheet, View } from 'react-native'

import {
    AppText,
    Badge,
    brandColors,
    colors,
    CommonTouchable,
    FastImage,
    Icon,
    IconSource,
    layout,
    useAppSafeArea,
} from '@mu-native/ds'

import { NotificationCount } from '../../../Elements/NotificationCount'

export type IRoute = {
    icon: IconSource
    label: string
    iconStyle?: any
    clickCallback?: () => void
    testID?: string
}
type ITabBarItemProps = {
    scrollToTop?: (() => void) | null
    onRePress?: () => void
    tabIndex: number
    isCurrentTab: boolean
    hasNotifications: boolean
    route: IRoute
    onChangeTab: (tabIndex: number) => void
    isCourseTabWasOpen?: boolean
    isShowHolidayIcon: boolean
    profileDecorIconUri: {
        uri: string
    }
    profileIconStyle: ImageStyle
}

const translateBadgeX = (layout.fullScreenWidth * 0.16) / 5

export const TabBarItem = memo(
    ({
        route,
        isCurrentTab,
        hasNotifications,
        tabIndex,
        isCourseTabWasOpen,
        isShowHolidayIcon,
        onChangeTab,
        scrollToTop,
        onRePress,
        profileDecorIconUri,
        profileIconStyle,
    }: ITabBarItemProps) => {
        const insets = useAppSafeArea()
        const onPressChangeTab = () => {
            if (isCurrentTab && scrollToTop && !tabIndex) {
                scrollToTop?.()
                onRePress?.()
            } else {
                onChangeTab(tabIndex)
                if (route && route.clickCallback) route.clickCallback()
            }
        }

        const itemStyles = {
            marginBottom: insets.bottom * 0.8,
        }

        const isHoliday = tabIndex === 4 && isShowHolidayIcon

        return (
            <CommonTouchable
                onPress={onPressChangeTab}
                testID={route.testID}
                style={[styles.tabBarItem, itemStyles]}
            >
                <View>
                    {isHoliday && (
                        <FastImage
                            key="discount"
                            resizeMode="contain"
                            source={profileDecorIconUri}
                            style={[styles.discountIcon, profileIconStyle as any]}
                        />
                    )}

                    {!isHoliday && (
                        <Icon
                            source={route.icon}
                            size={24}
                            tint={isCurrentTab ? brandColors.contentPrimary : '#A399AF'}
                        />
                    )}
                    {tabIndex === 1 && !isCourseTabWasOpen && (
                        <Badge translateX={translateBadgeX} translateY={-6} />
                    )}
                    {hasNotifications ? <NotificationCount /> : null}
                </View>
                <AppText
                    font="f10w600"
                    brandColor={isCurrentTab ? 'contentPrimary' : undefined}
                    rawColor={isCurrentTab ? undefined : '#736686'}
                    numberOfLines={1}
                    rawText={route.label}
                    style={styles.label}
                />
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    tabBarItem: {
        height: 52,
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.white,
    },

    discountIcon: {
        tintColor: undefined,
        width: 26,
        height: 24,
        transform: [{ translateY: -1 }],
    },

    label: {
        marginTop: 2,
    },
})
