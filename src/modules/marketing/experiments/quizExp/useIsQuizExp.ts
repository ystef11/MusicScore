import { useEffect } from 'react'

/* eslint-disable import/no-relative-packages */
import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'

export const useIsQuizExp = ({
    idExp,
    isInitTest,
}: {
    idExp: number | undefined
    isInitTest: boolean
}) => {
    useEffect(() => {
        if (isInitTest && idExp) {
            reportEvent(MetricaEvents.USER_EXPERIMENT_PARTICIPATE, {
                value: idExp,
            })
        }
    }, [isInitTest])
}
