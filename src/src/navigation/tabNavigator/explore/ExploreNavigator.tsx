import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { exploreStack } from './exploreStack'

const ExploreNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={exploreStack} />
    </TopBarScrollProvider>
)

export default ExploreNavigator
