import { memo } from 'react'

import { NavigationService, Screen } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import { debugStore } from '../../store/debugStoreChunk'

import DebugButtonComponent from './DebugButtonComponent'

export const DebugButtonContainer = memo(() => {
    const [isEnabled] = useValues([debugStore.props.getIsEnabled])

    const handlePress = () => {
        NavigationService.navigate(Screen.debug)
    }

    if (!isEnabled) return null

    return <DebugButtonComponent onPress={handlePress} />
})
