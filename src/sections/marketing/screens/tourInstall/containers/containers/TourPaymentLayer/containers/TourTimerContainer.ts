import { memo, useEffect } from 'react'

import { platform } from '@mu-native/common'
import { marketingConstants, marketingStoreChunk } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'
import { subSeconds } from 'date-fns'

const TourTimerContainer = ({ endTimerCallback }: { endTimerCallback?: () => void }) => {
    const [timerTour] = useValues([marketingStoreChunk.props.getTimerTour])
    const { setTimerTour } = useActions({
        setTimerTour: marketingStoreChunk.actions.setTimerTour,
    })

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | undefined

        if (timerTour) {
            const isHideTimer =
                marketingConstants.currentDateTimer - timerTour.getTime() >=
                marketingConstants.fiveMin

            if (isHideTimer) {
                if (platform.isAndroid && endTimerCallback) endTimerCallback()
                setTimerTour(null)
                if (timerId) clearTimeout(timerId)
            } else {
                timerId = setTimeout(() => {
                    setTimerTour(subSeconds(timerTour, 1))
                }, 1000)
            }
        }

        return () => {
            if (timerId) clearTimeout(timerId)
        }
    }, [timerTour])

    return null
}

export default memo(TourTimerContainer)
