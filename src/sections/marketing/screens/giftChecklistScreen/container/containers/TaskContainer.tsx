import { memo, useCallback, useEffect } from 'react'
import { View } from 'react-native'

import { globalStyles, showAlertNotification } from '@mu-native/ds'
import {
    checkCompleteTaskByIdThunk,
    giftChecklistStoreChunk,
    TIdCard,
} from '@mu-native/gift-checklist'
import { PlainLocaleKey, translate } from '@mu-native/locale'
import { getIsUserHasActiveSubscription, marketingThunks } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics'

import { TaskCardComponent } from './components/GIftCardComponent.tsx'

const TASK_TITLE_KEYS: Record<TIdCard, PlainLocaleKey> = {
    1: 'native.marketing.gift_checklist.one_songbook',
    2: 'native.marketing.gift_checklist.one_course',
    3: 'native.marketing.gift_checklist.one_score',
    4: 'native.marketing.gift_checklist.two_songbooks',
    5: 'native.marketing.gift_checklist.two_courses',
    6: 'native.marketing.gift_checklist.two_scores',
    8: 'native.marketing.gift_checklist.three_scores',
}

export const TasksContainer = memo(({ currentGiftId }: { currentGiftId: TIdCard | null }) => {
    const [tasksList, firstTimeInit, isUserHasActiveSubscription] = useValues([
        giftChecklistStoreChunk.props.getTasksList,
        giftChecklistStoreChunk.props.getFirstTimeInit,
        getIsUserHasActiveSubscription,
    ])
    const actions = useActions({
        checkCompleteTaskByIdThunk,
        getFreeGiftCreditThunk: marketingThunks.getFreeGiftCreditThunk,
    })
    useEffect(() => {
        reportEvent(RT_EVENTS.CHECKLIST_SHOW, {
            'params.key': tasksList.map((_, index) => (index + 1).toString()),
            'params.value': tasksList.map(task => (task.isCompleted ? 1 : 0)),
            'params.str_value': tasksList.map(() => ''),
        })
    }, [])

    const onClickGift = useCallback((id: TIdCard, isActive: boolean, index: number) => {
        const dayGift = (index + 1).toString()

        reportEvent(RT_EVENTS.CHECKLIST_CLICK, {
            value: dayGift,
        })

        if (isActive) {
            actions.checkCompleteTaskByIdThunk({
                id,
                dayGift,
                successCallback: () => {
                    actions.getFreeGiftCreditThunk({ type: id })
                },
            })
            return
        }
        showAlertNotification({
            title: translate('native.marketing.gift_tomorrow_title'),
            expiresIn: 3000,
        })
    }, [])

    return (
        <View
            pointerEvents={isUserHasActiveSubscription ? 'auto' : 'none'}
            style={globalStyles.mb16}
        >
            {tasksList.map(({ id, isCompleted, timeActive }, index) => (
                <TaskCardComponent
                    key={id}
                    id={id}
                    index={index}
                    isCompleted={isCompleted}
                    title={translate(TASK_TITLE_KEYS[id])}
                    isPlayRiveAnimation={isCompleted && id === currentGiftId}
                    onPress={onClickGift}
                    isActive={!!firstTimeInit && Date.now() - firstTimeInit >= timeActive}
                />
            ))}
        </View>
    )
})
