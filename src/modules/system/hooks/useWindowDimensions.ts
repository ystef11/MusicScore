import { useState, useEffect } from 'react'
import { Dimensions, Platform } from 'react-native'
import Orientation, { OrientationType } from 'react-native-orientation-locker'
import { viewportSize } from 'react-native-sheet2'

const { width, height } = Dimensions.get('window')

const portraitWidth = width > height ? height : width
const portraitHeight = height > width ? height : width

function isLandscape(orientation: string) {
    if (orientation.includes('LANDSCAPE')) return true
    if (Platform.OS === 'android') return false
    // we can't take width and height from Dimensions.get('window') due to it have cached sizes after rotation device
    const { width, height } = viewportSize()
    return width > height
}

// https://github.com/facebook/react-native/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+useWindowDimensions
export const useWindowDimensions = () => {
    const [dimension, setDimensions] = useState({
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    })

    useEffect(() => {
        Orientation.getOrientation(orientation => {
            const isLand = isLandscape(orientation)
            setDimensions({
                width: !isLand ? portraitWidth : portraitHeight,
                height: !isLand ? portraitHeight : portraitWidth,
            })
        })
        const isLocked = Orientation.isLocked()

        const listener = (orientation: OrientationType) => {
            const isLand = isLandscape(orientation)
            setDimensions({
                width: !isLand ? portraitWidth : portraitHeight,
                height: !isLand ? portraitHeight : portraitWidth,
            })
        }

        if (!isLocked) Orientation.addDeviceOrientationListener(listener)

        return () => {
            if (!isLocked) Orientation.removeDeviceOrientationListener(listener)
        }
    }, [])

    return dimension
}
