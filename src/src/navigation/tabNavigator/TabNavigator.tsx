import { useIsNewAppConcept } from '@mu-native/ab'
import type { BottomTabBarProps } from '@mu-native/navigation'
import { BottomTabsNavigator } from '@mu-native/navigation'
import { AppTabBar } from '@mu-native/new-concept-shared'

import TabBarComponent from '../../../App/Components/TabBarComponent/TabBarComponent'

import { getTabStack } from './tabStack'

const renderTabBar = (props: BottomTabBarProps) => <TabBarComponent {...props} />
const renderNewConceptTabBar = (props: BottomTabBarProps) => <AppTabBar {...props} />

export const TabNavigator = () => {
    const isNewConcept = useIsNewAppConcept()
    return (
        <BottomTabsNavigator
            TabBarComponent={isNewConcept ? renderNewConceptTabBar : renderTabBar}
            stack={getTabStack()}
        />
    )
}
