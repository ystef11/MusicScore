import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { AuthModalStep, authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { platform } from '@mu-native/common/constants/platform'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    IconSource,
    layout,
    useAppSafeArea,
} from '@mu-native/ds'
import { cloudUpload } from '@mu-native/icons/cloudUpload'
import { collection } from '@mu-native/icons/collection'
import { home } from '@mu-native/icons/home'
import { learn } from '@mu-native/icons/learn'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'
import { BottomTabBarProps, NavigationService, Screen } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useActions, useValues } from '@ug/store'

import { runTabRepressAction } from '../helpers/tabScrollRegistry'

type TItem = {
    routeName: string
    getLabel: () => string
    icon: IconSource
    testID?: string
}

const PRIMARY_ITEMS: TItem[] = [
    {
        routeName: 'BrowseTab',
        getLabel: () => translate('native.new_concept.tab_bar.home'),
        icon: home,
        testID: 'Tab bar home',
    },
    {
        routeName: 'LibraryTab',
        getLabel: () => translate('native.bottom_bar.library_tab'),
        icon: collection,
        testID: 'Tab bar library',
    },
    {
        routeName: 'LearnTab',
        getLabel: () => translate('native.new_concept.tab_bar.learn'),
        icon: learn,
        testID: 'Tab bar learn',
    },
    {
        routeName: 'OmrTab',
        getLabel: () => translate('native.screen_omr.upload'),
        icon: cloudUpload,
        testID: 'Tab bar upload',
    },
]

// Purple-tinted inactive grays from the tab bar design — no brand token matches.
const INACTIVE_ICON_COLOR = '#A399AF'
const INACTIVE_LABEL_COLOR = '#736686'

export const AppTabBar = ({ state }: BottomTabBarProps) => {
    const insets = useAppSafeArea()
    const actions = useActions({
        setIsOpenOmrModal: omrStoreChunk.actions.setIsOpenOmrModal,
        setAuthModalStep: authStoreChunk.actions.setStep,
        setAuthModalVisible: authStoreChunk.actions.setIsVisible,
    })
    const [isAuthorized] = useValues([getIsAuthorized])

    const activeRouteName = state.routes[state.index]?.name

    const onItemPress = useCallback(
        (routeName: string) => {
            if (routeName === 'OmrTab') {
                actions.setIsOpenOmrModal(true)
                return
            }
            if (routeName === 'LibraryTab' && !isAuthorized) {
                actions.setAuthModalStep(AuthModalStep.WelcomeModal)
                actions.setAuthModalVisible(true)
                return
            }
            // Re-pressing the already-active tab is a no-op for `navigate`, so a
            // nested screen (e.g. Explore scores pushed on the Home tab) would stay
            // open. Pop its stack back to the tab root, then run the root's re-press
            // action (scroll-to-top) — a no-op when a deeper screen was focused.
            if (routeName === activeRouteName) {
                NavigationService.popToTop()
                runTabRepressAction(routeName)
                return
            }
            NavigationService.navigate(routeName as any)
        },
        [actions, activeRouteName, isAuthorized],
    )

    const isSearchActive = activeRouteName === Screen.search

    const onSearchPress = useCallback(() => {
        // Same re-press behavior as the primary tabs: if Search is already the
        // active tab, pop its stack back to the Search root, then run its re-press
        // action — the Search root focuses its field (no-op when deeper in the stack).
        if (isSearchActive) {
            NavigationService.popToTop()
            runTabRepressAction(Screen.search)
            return
        }
        NavigationService.navigate(Screen.search)
    }, [isSearchActive])

    return (
        <View
            pointerEvents="box-none"
            style={[styles.container, { paddingBottom: Math.max(insets.bottom, layout.marginXm) }]}
        >
            <View style={styles.inner}>
                <View style={styles.primaryGroup}>
                    {PRIMARY_ITEMS.map(item => (
                        <TabItem
                            key={item.routeName}
                            item={item}
                            isActive={item.routeName === activeRouteName}
                            onPress={onItemPress}
                        />
                    ))}
                </View>
                <CommonTouchable
                    style={styles.searchButton}
                    onPress={onSearchPress}
                    testID="Tab bar search"
                >
                    <Icon
                        source={search}
                        size={24}
                        tint={isSearchActive ? brandColors.contentPrimary : INACTIVE_ICON_COLOR}
                    />
                </CommonTouchable>
            </View>
        </View>
    )
}

type TabItemProps = {
    item: TItem
    isActive: boolean
    onPress: (routeName: string) => void
}

const TabItem = ({ item, isActive, onPress }: TabItemProps) => (
    <CommonTouchable
        style={styles.tabItem}
        testID={item.testID}
        onPress={() => onPress(item.routeName)}
    >
        <Icon
            source={item.icon}
            size={24}
            tint={isActive ? brandColors.contentPrimary : INACTIVE_ICON_COLOR}
        />
        <AppText
            font="f10w600"
            brandColor={isActive ? 'contentPrimary' : undefined}
            rawColor={isActive ? undefined : INACTIVE_LABEL_COLOR}
            numberOfLines={1}
            rawText={item.getLabel()}
            style={styles.label}
        />
    </CommonTouchable>
)

const PILL_HEIGHT = 64
const TAB_BAR_TOP_PADDING = 8
// Design caps the floating tab bar narrower than the general tablet container.
const TAB_BAR_MAX_WIDTH = 448

// Height the floating tab bar occupies above the bottom safe-area inset. Screens
// use it to pad their scroll content so it isn't hidden behind the bar.
export const FLOATING_TAB_BAR_HEIGHT = PILL_HEIGHT + TAB_BAR_TOP_PADDING

const FLOATING_SHADOW = {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        paddingHorizontal: layout.marginMd,
        paddingTop: TAB_BAR_TOP_PADDING,
        backgroundColor: brandColors.transparent,
    },
    inner: {
        width: '100%',
        maxWidth: platform.isTablet ? TAB_BAR_MAX_WIDTH : undefined,
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXm,
    },
    primaryGroup: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: brandColors.backgroundDefault,
        borderRadius: PILL_HEIGHT / 2,
        height: PILL_HEIGHT,
        paddingHorizontal: layout.marginXs,
        ...FLOATING_SHADOW,
    },
    tabItem: {
        flex: 1,
        height: PILL_HEIGHT,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButton: {
        width: PILL_HEIGHT,
        height: PILL_HEIGHT,
        borderRadius: PILL_HEIGHT / 2,
        backgroundColor: brandColors.backgroundDefault,
        alignItems: 'center',
        justifyContent: 'center',
        ...FLOATING_SHADOW,
    },
    label: {
        marginTop: layout.marginXs,
    },
})
