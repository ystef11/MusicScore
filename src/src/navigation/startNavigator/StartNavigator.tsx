import { StackNavigator } from '@mu-native/navigation'

import { startStack } from './startStack'

export const StartNavigator = () => (
    <StackNavigator screenOptions={{ headerShown: false }} screens={startStack} />
)
