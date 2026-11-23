import { useCallback, useRef } from 'react'

import { useFocusEffect } from '@mu-native/navigation'

import reportEvent from '../../../../App/Utils/Analytics'

export const useScreenViewReporter = (event: string, params?: Record<string, unknown>) => {
    const paramsRef = useRef(params)
    paramsRef.current = params

    useFocusEffect(
        useCallback(() => {
            reportEvent(event, paramsRef.current)
        }, [event]),
    )
}
