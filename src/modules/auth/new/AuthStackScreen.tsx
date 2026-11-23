import React from 'react'

import { useAppRoute } from '@mu-native/navigation'

import { createStackNavigator } from '../../navigation/components/StackNavigator'

import { authStack } from './authStack'

const Stack = createStackNavigator()

export const AuthStackScreen = React.memo(() => {
    const params = useAppRoute<any>()
    return (
        // @ts-ignore
        <Stack.Navigator screenOptions={{ headerBackTitleVisible: false }}>
            {authStack.map(screen => {
                return (
                    <Stack.Screen
                        key={screen.name}
                        name={screen.name}
                        options={screen.options}
                        component={screen.component}
                        initialParams={params}
                    />
                )
            })}
        </Stack.Navigator>
    )
})
