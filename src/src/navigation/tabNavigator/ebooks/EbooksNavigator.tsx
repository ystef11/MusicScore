import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { ebooksStack } from './ebooksStack'

export const EbookNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={ebooksStack} />
    </TopBarScrollProvider>
)
