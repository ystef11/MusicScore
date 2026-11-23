import { memo } from 'react'

import {
    createNativeStackNavigator,
    NativeStackNavigationOptions,
} from '@react-navigation/native-stack'

import type { TNavigatorParams } from '../types/navgationTypes'

type TProps = {
    screenOptions?: NativeStackNavigationOptions
    screens: TNavigatorParams[]
}

const Stack = createNativeStackNavigator()

const StackScreen = (props: TNavigatorParams) => {
    const { name, component } = props
    const navigationOptions = (navigationParams: any) => {
        const options = component.navigationOptions

        return {
            ...(typeof options === 'function' ? options(navigationParams) : options),
        }
    }

    return <Stack.Screen key={name} options={navigationOptions} {...props} />
}

export const StackNavigator = memo(({ screenOptions, screens }: TProps) => (
    <Stack.Navigator screenOptions={screenOptions}>{screens?.map(StackScreen)}</Stack.Navigator>
))

export { createNativeStackNavigator as createStackNavigator }
