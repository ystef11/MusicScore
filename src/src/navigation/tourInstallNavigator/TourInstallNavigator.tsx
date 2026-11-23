import { StackNavigator } from '@mu-native/navigation'

import { tourInstallStack } from './tourInstallStack'

export const TourInstallNavigator = () => (
    <StackNavigator screenOptions={{ headerShown: false }} screens={tourInstallStack} />
)
