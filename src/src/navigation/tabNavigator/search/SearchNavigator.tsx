import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { searchStack } from './searchStack'

const SearchNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={searchStack} />
    </TopBarScrollProvider>
)

export default SearchNavigator
