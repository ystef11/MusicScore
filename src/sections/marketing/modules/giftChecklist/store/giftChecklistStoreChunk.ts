import { createExtendedStoreChunk } from '@ug/store'
import { createSelector } from 'reselect'

import { type TIdCard } from '../types/giftChecklistTypes.ts'

type TTourInstallScreenState = {
    currentGiftId: TIdCard | null
    isOpenSubscriptionModal: boolean
    firstTimeInit: number
    tasksList: {
        id: TIdCard
        title: string
        timeActive: number
        isCompleted: boolean
    }[]
}

const oneDay = 1000 * 60 * 60 * 24

const initialState = {
    currentGiftId: null,
    isOpenSubscriptionModal: false,
    firstTimeInit: 0,
    tasksList: [
        {
            id: 1 as const,
            title: 'One songbook',
            isCompleted: false,
            timeActive: 0,
        },
        {
            id: 2 as const,
            title: 'One course',
            isCompleted: false,
            timeActive: oneDay,
        },
        {
            id: 3 as const,
            title: 'One score',
            isCompleted: false,
            timeActive: oneDay * 2,
        },
        {
            id: 4 as const,
            title: 'Two songbooks',
            isCompleted: false,
            timeActive: oneDay * 3,
        },
        {
            id: 5 as const,
            title: 'Two courses',
            isCompleted: false,
            timeActive: oneDay * 4,
        },
        {
            id: 6 as const,
            title: 'Two scores',
            isCompleted: false,
            timeActive: oneDay * 5,
        },
        {
            id: 8 as const,
            title: 'Three scores',
            isCompleted: false,
            timeActive: oneDay * 6,
        },
    ],
}

export const giftChecklistStoreChunk = createExtendedStoreChunk<TTourInstallScreenState>({
    treeKey: 'modules',
    storeKey: 'giftsChecklist',
})({
    persist: ['tasksList', 'firstTimeInit'],
    initialState,
    actions: {
        resetState: () => ({ ...initialState }),
        setAllCompeted: (_, state) => {
            return {
                tasksList: state.tasksList.map(task => ({ ...task, isCompleted: true })),
            }
        },
        setFirstTimeInitCustom: (time: number, state) => {
            return {
                firstTimeInit: state.firstTimeInit ? state.firstTimeInit : time,
            }
        },
    },
})

export const getNumberCompetedTasks = createSelector(
    giftChecklistStoreChunk.props.getTasksList,
    tasks => tasks.reduce((acc, item) => (item.isCompleted ? acc + 1 : acc), 0),
)
