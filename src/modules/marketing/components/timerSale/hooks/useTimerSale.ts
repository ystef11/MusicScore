import { useEffect, useState } from 'react'
import { AppStateStatus } from 'react-native'

import { systemStoreChunk } from '@mu-native/system'
import { useActions, useValues } from '@ug/store'
import { subMilliseconds, subSeconds } from 'date-fns'

import { TSetPartialFieldsMarketing } from '../../../dataConverters/convertMarketingData'
import { marketingStoreChunk } from '../../../store/marketingStoreChunk'

const MS_IN_24_HOURS = 1000 * 60 * 60 * 24
const SALE_END_TIMESTAMP = new Date(2026, 1, 1, 23, 59, 59, 59).getTime()

type TTimerSaleConfig = {
    selectTimerSaleDate:
        | typeof marketingStoreChunk.props.getTimerSaleDate
        | typeof marketingStoreChunk.props.getTimerSaleDateOffScores
    selectTimerSaleStart:
        | typeof marketingStoreChunk.props.getTimerSaleStart
        | typeof marketingStoreChunk.props.getTimerSaleStartOffScores
    setTimerSaleDate:
        | typeof marketingStoreChunk.actions.setTimerSaleDate
        | typeof marketingStoreChunk.actions.setTimerSaleDateOffScores
    resetPartialFields: TSetPartialFieldsMarketing
}

const calculateTimerSaleDate = (timerSaleStart: number) => {
    const currentTime = Date.now()

    return subMilliseconds(SALE_END_TIMESTAMP, currentTime - timerSaleStart)
}

export const useTimerSale = ({
    selectTimerSaleDate,
    selectTimerSaleStart,
    setTimerSaleDate: setTimerSaleDateAction,
    resetPartialFields,
}: TTimerSaleConfig) => {
    const { setTimerSaleDate, setPartialFieldsCustom } = useActions({
        setTimerSaleDate: setTimerSaleDateAction,
        setPartialFieldsCustom: marketingStoreChunk.actions.setPartialFieldsCustom,
    })
    const [appState, timerSale, timerSaleStart] = useValues([
        systemStoreChunk.props.getAppState,
        selectTimerSaleDate,
        selectTimerSaleStart,
    ])

    const [isDateUpdated, setIsDateUpdated] = useState(false)

    const syncTimerSaleDate = () => {
        if (!timerSaleStart) {
            return
        }

        setTimerSaleDate(calculateTimerSaleDate(timerSaleStart))
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
        if (nextState === 'active') {
            syncTimerSaleDate()
        }
    }

    useEffect(() => {
        if (timerSaleStart && !isDateUpdated) {
            syncTimerSaleDate()
            setIsDateUpdated(true)
        }
    }, [])

    const onHideTimer = () => {
        const currentDate = Date.now()
        const isHideTimer = currentDate - (timerSaleStart || 0) >= MS_IN_24_HOURS

        if (isHideTimer) {
            setPartialFieldsCustom(resetPartialFields)
        }
    }

    useEffect(() => {
        let timerId: ReturnType<typeof setTimeout> | null = null

        if (timerSaleStart) {
            onHideTimer()
        }

        if (timerSale) {
            timerId = setTimeout(() => {
                setTimerSaleDate(subSeconds(timerSale, 1))
            }, 1000)
        }

        return () => {
            if (typeof timerId === 'number') {
                clearTimeout(timerId)
            }
        }
    }, [timerSale])

    useEffect(() => {
        handleAppStateChange(appState)
    }, [appState])
}
