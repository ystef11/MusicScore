import { Platform } from 'react-native'
import { LocalPracticeScreen } from './LocalPracticeScreen'
import { AutogradeContainer } from './containers/AutogradeContainer.tsx'
import useLoadAutogradeStore from './store/useLoadAutogradeStore.ts'

export const AutogradeScreen = () => {
    useLoadAutogradeStore()
    return Platform.OS === 'android' ? <LocalPracticeScreen /> : <AutogradeContainer />
}
