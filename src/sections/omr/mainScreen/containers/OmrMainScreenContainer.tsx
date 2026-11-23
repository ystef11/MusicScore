import { memo, useEffect } from 'react'
import { View } from 'react-native'
import { useCameraDevice, useCameraPermission } from 'react-native-vision-camera'

import { globalStyles } from '@mu-native/ds'
import { useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { useValues } from '@ug/store'

import { NoCameraComponent } from './components/NoCameraComponent.tsx'
import { NoPermissionComponent } from './components/NoPermissionComponent.tsx'
import { CameraContainer } from './containers/CameraContainer.tsx'

export const OmrMainScreenContainer = memo(() => {
    const { goBack } = useAppNavigation()
    const [cameraPosition] = useValues([omrStoreChunk.props.getCameraPosition])
    const device = useCameraDevice(cameraPosition, {
        physicalDevices: ['wide-angle-camera', 'telephoto-camera'],
    })

    const { hasPermission, requestPermission } = useCameraPermission()

    useEffect(() => {
        if (!hasPermission && device) requestPermission()
    }, [hasPermission, device, requestPermission])

    if (!device) return <NoCameraComponent goBack={goBack} />

    if (!hasPermission) return <NoPermissionComponent goBack={goBack} />

    return (
        <View style={[globalStyles.flex1FullWidth, globalStyles.horizontalPadding20]}>
            <CameraContainer device={device} />
        </View>
    )
})
