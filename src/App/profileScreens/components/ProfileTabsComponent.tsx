import { FC, memo, RefObject, useEffect, useRef } from 'react'
import { type ScrollViewInstance, StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { profileScreenStoreChunk } from '@mu-native/profile-screen'
import { useActions, useValues } from '@ug/store'

import { SubscriptionsTab } from './components/SubscriptionsTab.tsx'
import { SettingsTab } from './SettingsTab.tsx'

const TAB_INDEX = {
    SUBSCRIPTIONS: 0,
    SETTINGS: 1,
} as const

const TABS_CONFIG = [
    { key: TAB_INDEX.SUBSCRIPTIONS, title: translate('native.profile.subscriptions') },
    { key: TAB_INDEX.SETTINGS, title: translate('native.profile.settings') },
] as const

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: brandColors.backgroundDefault,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: `${brandColors.contentSecondary}20`,
    },
    tabButton: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: brandColors.contentPrimary,
    },
})

type TabButtonProps = {
    title: string
    isActive: boolean
    onPress: () => void
}

const TabButton: FC<TabButtonProps> = ({ title, isActive, onPress }) => (
    <CommonTouchable style={styles.tabButton} onPress={onPress}>
        <AppText
            font="f15w600"
            adaptiveSize
            style={{
                color: isActive ? brandColors.contentPrimary : brandColors.contentSecondary,
            }}
            rawText={title}
        />
        {isActive && <View style={styles.tabIndicator} />}
    </CommonTouchable>
)

type TabBarProps = {
    activeTab: number
    onTabPress: (index: number) => void
}

const TabBar: FC<TabBarProps> = ({ activeTab, onTabPress }) => (
    <View style={styles.tabBar}>
        {TABS_CONFIG.map((tab, index) => (
            <TabButton
                key={tab.key}
                title={tab.title}
                isActive={activeTab === index}
                onPress={() => onTabPress(index)}
            />
        ))}
    </View>
)

type ProfileTabsComponentProps = {
    ref?: RefObject<ScrollViewInstance | null>
    tabPositionYRef: RefObject<number>
}

const ProfileTabsComponent = ({ tabPositionYRef, ref }: ProfileTabsComponentProps) => {
    const [activeTab] = useValues([profileScreenStoreChunk.props.getActiveTab])
    const { setActiveTab } = useActions({
        setActiveTab: profileScreenStoreChunk.actions.setActiveTab,
    })
    // Only scroll to the tabs when the user actually switches tabs — never on open.
    // (The previous isFirstRender timer re-triggered this effect after mount and
    // scrolled the screen down as soon as the tabs' layout position was measured.)
    const prevActiveTab = useRef(activeTab)

    useEffect(() => {
        if (prevActiveTab.current === activeTab) return
        prevActiveTab.current = activeTab

        if (tabPositionYRef.current) {
            // layout.y is relative to scroll content; subtract overlay top bar
            // so tabs sit just below it instead of scrolling under/past it
            ref?.current?.scrollTo({
                y: tabPositionYRef.current,
                x: 0,
                animated: true,
            })
        }
    }, [activeTab])

    const renderTabContent = () => {
        switch (activeTab) {
            case TAB_INDEX.SUBSCRIPTIONS:
                return <SubscriptionsTab />
            case TAB_INDEX.SETTINGS:
                return <SettingsTab />
            default:
                return null
        }
    }

    return (
        <View style={globalStyles.flex1}>
            <TabBar activeTab={activeTab} onTabPress={setActiveTab} />
            {renderTabContent()}
        </View>
    )
}

export default memo(ProfileTabsComponent)
