import { getStoreValue } from '@mu-native/common'
import { getScoreFullScreenAnalytics } from '@mu-native/score-screen'
import { systemStoreChunk } from '@mu-native/system'

import { TAnalyticsParams } from '../types/rtAnalyticsTypes'

export const getScoreChannelSpecialParams = (params?: TAnalyticsParams) => {
    const orientation = getStoreValue(systemStoreChunk.props.getOrientation)
    const isLandscape = orientation?.toUpperCase().includes('LANDSCAPE') ?? false
    const screenOrientationParamValue = isLandscape ? 'horizontal' : 'vertical'
    const specialParams = {
        'params.key': ['screen_orientation', ...(params?.['params.key'] || [])],
        'params.str_value': [screenOrientationParamValue, ...(params?.['params.str_value'] || [])],
        'params.value': [0, ...(params?.['params.value'] || [])],
    }
    specialParams['params.key']?.push('fullscreen_type')
    specialParams['params.str_value']?.push(getScoreFullScreenAnalytics().value)
    specialParams['params.value']?.push(0)

    return specialParams
}
