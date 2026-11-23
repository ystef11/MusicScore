import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { profileStack } from './profileStack'

export const ProfileNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={profileStack} />
    </TopBarScrollProvider>
)
