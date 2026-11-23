import { useState, useEffect } from 'react'
import { Dimensions, ScaledSize } from 'react-native'

export const useDimensions = (type: 'window' | 'screen') => {
    const [dimensions, setDimensions] = useState(Dimensions.get(type))
    useEffect(() => {
        const handleChange = (scaledSize: { window: ScaledSize; screen: ScaledSize }) => {
            setDimensions(scaledSize[type])
        }

        const subscription = Dimensions.addEventListener('change', handleChange)

        return () => subscription.remove()
    }, [])

    return dimensions
}
