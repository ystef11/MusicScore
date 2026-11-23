import { StackNavigator } from '@mu-native/navigation'

import { mainAppStack } from './mainAppStack'

export const MainAppNavigator = () => {
    return <StackNavigator screens={mainAppStack} screenOptions={{ headerShown: false }} />
}
