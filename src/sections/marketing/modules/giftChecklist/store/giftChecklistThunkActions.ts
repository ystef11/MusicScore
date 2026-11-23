import { handleError } from '@mu-native/api'
import { TThunkAction } from '@mu-native/common'
import { RT_EVENTS } from '@mu-native/rt-analytics'

/* eslint-disable import/no-relative-packages */
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import { type TIdCard } from '../types/giftChecklistTypes.ts'

import { giftChecklistStoreChunk } from './giftChecklistStoreChunk'

export const checkCompleteTaskByIdThunk: TThunkAction<{
    id: TIdCard
    dayGift: string
    successCallback: () => void
}> =
    ({ id, dayGift, successCallback }) =>
    async (dispatch, getState) => {
        try {
            const state = getState()
            const startDate = giftChecklistStoreChunk.props.getFirstTimeInit(state)

            if (!startDate) return

            const currentTasks = giftChecklistStoreChunk.props.getTasksList(state)
            let isFirstComplete = false

            const tasksList = currentTasks.map(item => {
                if (item.id === id) {
                    const isTimeActive = Date.now() - startDate >= item.timeActive
                    isFirstComplete = !item.isCompleted && isTimeActive
                    return {
                        ...item,
                        isCompleted: isTimeActive,
                    }
                }

                return item
            })

            dispatch(giftChecklistStoreChunk.actions.setCurrentGiftId(id))

            if (isFirstComplete) {
                reportEvent(RT_EVENTS.CHECKLIST_GIFT_OPEN, {
                    value: dayGift,
                })
                dispatch(giftChecklistStoreChunk.actions.setTasksList(tasksList))
                successCallback()
            }
        } catch (error) {
            handleError(error)
        }
    }
