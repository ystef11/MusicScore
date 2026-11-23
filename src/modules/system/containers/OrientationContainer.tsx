import { useEffect } from 'react'
import Orientation, { OrientationType } from 'react-native-orientation-locker'

import { useActions } from '@ug/store'

import { systemStoreChunk } from '../store/systemStoreChunk'

export const OrientationContainer = () => {
    const actions = useActions(systemStoreChunk.actions)

    useEffect(() => {
        const handleChangeOrientation = (orientation: OrientationType) => {
            actions.setOrientation(orientation)
        }
        const handleChangeDeviceOrientation = (deviceOrientation: OrientationType) => {
            actions.setDeviceOrientation(deviceOrientation)
        }
        const handleChangeLockOrientation = (lockOrientation: OrientationType) => {
            actions.setLockOrientation(lockOrientation)
        }

        Orientation.addOrientationListener(handleChangeOrientation)
        Orientation.addDeviceOrientationListener(handleChangeDeviceOrientation)
        Orientation.addLockListener(handleChangeLockOrientation)

        return () => {
            Orientation.removeOrientationListener(handleChangeOrientation)
            Orientation.removeDeviceOrientationListener(handleChangeDeviceOrientation)
            Orientation.removeLockListener(handleChangeLockOrientation)
        }
    }, [])

    return null
}
