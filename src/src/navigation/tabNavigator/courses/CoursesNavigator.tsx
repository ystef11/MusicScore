import { TopBarScrollProvider } from '@mu-native/ds'
import { StackNavigator } from '@mu-native/navigation'

import { coursesStack } from './coursesStack'

const CoursesNavigator = () => (
    <TopBarScrollProvider>
        <StackNavigator screens={coursesStack} />
    </TopBarScrollProvider>
)

export default CoursesNavigator
