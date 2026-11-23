import { JSX } from 'react'
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import { TNavigatorParams } from '../types/navgationTypes'

type TProps = {
    TabBarComponent: (props: BottomTabBarProps) => JSX.Element
    stack: TNavigatorParams[]
}

const Tab = createBottomTabNavigator()

export const BottomTabsNavigator = ({ TabBarComponent, stack }: TProps) => (
    // eslint-disable-next-line react/no-unstable-nested-components
    <Tab.Navigator tabBar={props => <TabBarComponent {...props} />}>
        {stack?.map(stack => (
            // @ts-ignore
            <Tab.Screen key={stack.name} {...stack} />
        ))}
    </Tab.Navigator>
)
