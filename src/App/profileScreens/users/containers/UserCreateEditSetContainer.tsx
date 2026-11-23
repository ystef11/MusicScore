import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Keyboard } from 'react-native'

import { authThunks } from '@mu-native/auth'
import { presentBottomSheetAlert, showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { navigationThunks, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import {
    createScoreSetDetailsDynamicStoreChunk,
    ScoreSetDetailsContext,
    scoreSetDetailsThunks,
    useScoreSetDetailsContext,
} from '@mu-native/score-set-details'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import { MSScoreT } from '../../../Model/MSScore'
import reportEvent from '../../../Utils/Analytics'
import { LOCAL_SETS_OWNER } from '../localScoreSets'
import { CreateEditSetNew } from '../components/CreateEditSetNew.tsx'
import {
    createNewSetAsync,
    deleteScoreInSet,
    deleteSetAsync,
    updateSetAsync,
} from '../store/userAsyncActions'
import { SetT } from '../userTypes.ts'

import { SetDeleteButton } from './SetDeleteButton'
import UserSetsHeaderContainer from './UserSetsHeaderContainer'

const UserCreateEditSetScreen = () => {
    const params = useAppRoute<{
        userId: number
        edit: boolean
        score: MSScoreT | undefined
        onEdited?: (set: SetT) => void
    }>()
    const setDetailsChunk = useScoreSetDetailsContext()

    const [scores, set, setId, currentPage, totalPages] = useValues([
        setDetailsChunk.props.getScores,
        setDetailsChunk.props.getSet,
        setDetailsChunk.props.getId,
        setDetailsChunk.props.getCurrentPage,
        setDetailsChunk.props.getTotalPages,
    ])
    const actions = useActions({
        fetchSetWithScores: scoreSetDetailsThunks.fetchSet,
        loadMoreScoresForSet: scoreSetDetailsThunks.loadMoreScoresInSet,
        fetchCurrentUserInfo: authThunks.loadUserProfile,
        setScreen: navigationThunks.setScreen,
    })
    const navigation = useAppNavigation()
    const [data, setData] = useState<MSScoreT[]>(scores)
    const [isProcessing, setProcessing] = useState(false)
    const deletingScore = useRef<MSScoreT | undefined>(undefined)
    const titleSet = set?.title || ''
    const descriptionSet = set?.description || ''
    const privateStatusSet = set?.is_private !== 0 || false
    const { edit, score, userId } = params

    const presentGreat = async () => {
        const title = translate('native.screens_titles.score_screen')
        let descriptionDone = translate('native.sets.success_remove_from_set', { scoreName: title })

        if (score) {
            descriptionDone = translate('native.sets.success_add_to_set', { scoreName: title })
        }
        if (!score && !deletingScore.current) {
            descriptionDone = translate('native.sets.success_create', { setName: titleSet })
        }

        showAlertNotification({ text: descriptionDone })

        deletingScore.current = undefined
    }

    const handleCreate = async (title: string, description: string, isPrivate: boolean) => {
        Keyboard.dismiss()
        if (isProcessing) return
        if (!userId) return
        try {
            setProcessing(true)
            const response = await createNewSetAsync(title, description, isPrivate, score, userId)
            if (typeof response === 'string') {
                showAlertNotification({ text: response })
                return
            }
            if (!response) return
            if (userId !== LOCAL_SETS_OWNER) actions.fetchCurrentUserInfo()
            presentGreat()
            navigation.goBack()
        } finally {
            setProcessing(false)
        }
    }
    const handleUpdate = async (title: string, description: string, is_private: boolean) => {
        Keyboard.dismiss()
        if (isProcessing) return
        if (!data) return
        if (!userId) return
        try {
            setProcessing(true)
            const idScores = data.map(i => i.id)
            const updatedSet = await updateSetAsync(setId, title, description, is_private, idScores, userId)
            if (!updatedSet) return
            params.onEdited?.(updatedSet)
            actions.fetchSetWithScores(setDetailsChunk, userId)
            navigation.goBack()
        } finally {
            setProcessing(false)
        }
    }

    const handleDeleteSet = async () => {
        Keyboard.dismiss()
        if (isProcessing) return
        if (!userId) return
        try {
            setProcessing(true)
            const isSuccess = await deleteSetAsync(setId, userId)
            if (!isSuccess) return
            navigation.goBack()
            navigation.goBack()
        } finally {
            setProcessing(false)
        }
    }

    const handleDeleteScore = async () => {
        Keyboard.dismiss()
        if (isProcessing) return
        if (!deletingScore.current) return
        if (!userId) return
        try {
            const isSuccess = await deleteScoreInSet(setId, deletingScore.current.id, userId)
            if (!isSuccess) return
            actions.fetchSetWithScores(setDetailsChunk, userId)
            presentGreat()
        } finally {
            setProcessing(false)
        }
    }

    const openRemoveModal = async (item: MSScoreT | undefined) => {
        deletingScore.current = item
        reportEvent(MetricaEvents.SET_SCORE_DELETE_CLICK)
        const buttonId = await presentBottomSheetAlert({
            rawMessage: translate('native.sets.delete_warning'),
            rawTitle: translate('native.sets.be_careful'),
            cancelable: true,
            buttons: [
                {
                    rawText: translate('native.sets.delete_button'),
                    style: 'destructive',
                    id: 'delete',
                },
            ],
        })
        if (buttonId === 'delete') {
            handleDeleteScore()
        }
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <UserSetsHeaderContainer
                    headerTitle={translate(
                        edit ? 'native.sets.editing_set' : 'native.sets.creating_new_set',
                    )}
                    rightComponent={
                        edit ? (
                            <SetDeleteButton
                                setId={setId}
                                onDeleteSet={handleDeleteSet}
                                titleSet={titleSet}
                            />
                        ) : undefined
                    }
                />
            ),
        })
    }, [edit, navigation, setId, titleSet, isProcessing])

    useEffect(() => {
        if (userId && setId > -1) {
            actions.fetchSetWithScores(setDetailsChunk, userId)
        }
        if (!edit) reportEvent(MetricaEvents.SET_NEW_CREATE_OPEN)
        else
            reportEvent(MetricaEvents.SET_EDIT_OPEN, {
                item: 'set',
                item_id: setId,
            })
    }, [])

    useEffect(() => {
        setData(scores)
        if (currentPage !== totalPages && userId) {
            actions.loadMoreScoresForSet(setDetailsChunk, userId)
        }
    }, [scores, currentPage, totalPages, actions, setDetailsChunk, userId])

    return (
        <CreateEditSetNew
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            openRemoveModal={openRemoveModal}
            editTitle={titleSet}
            editDescription={descriptionSet}
            isPrivate={privateStatusSet}
            isLocal={userId === LOCAL_SETS_OWNER}
            edit={edit}
            scores={data}
            setScores={setData}
            isChanging={isProcessing}
        />
    )
}

export const UserCreateEditSetContainer = () => {
    const { setId = -1 } = useAppRoute<{ setId: number | undefined }>()
    const { chunk } = useInjectDynamicStoreChunk('edit_set', key =>
        createScoreSetDetailsDynamicStoreChunk(key, setId),
    )
    return (
        <ScoreSetDetailsContext.Provider value={chunk}>
            <UserCreateEditSetScreen />
        </ScoreSetDetailsContext.Provider>
    )
}
