import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { libraryStack } from './libraryStack'

const LibraryNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={libraryStack} />
    </TopBarScrollProvider>
)

export default LibraryNavigator
