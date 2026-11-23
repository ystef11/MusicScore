import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { StyleSheet, View } from 'react-native'

import { setTestIds } from '@mu/mu-mobile-test-id'
import { colors, layout, MuseButton, showAlertNotification, useAppSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import {
    createScoreSetListDynamicStoreChunk,
    ScoreSetListContext,
    scoreSetListThunks,
    useScoreSetListContext,
} from '@mu-native/score-set-list'
import { useActions, useInjectDynamicStoreChunk, useValues } from '@ug/store'

import { NavHeader } from '../../../Components/NavHeader/NavHeader.tsx'
import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'
import { UserSetsListWithCheckbox } from '../components/UserSetsListWithCheckbox'
import { updateScoreInSets } from '../store/userAsyncActions'
import { fetchScoreSetIds } from '../userService'
import type { MSScoreT } from '../../../Model/MSScore'
import type { SetT } from '../userTypes'

const styles = StyleSheet.create({
    wrapperContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: layout.baseMarginFromEdges,
        flex: 1,
    },

    bottomContainer: {
        width: '100%',
    },
})

const UserAddSetScreen = () => {
    const safeArea = useAppSafeArea({ bottom: 16 })
    const { score, userId } = useAppRoute<{ score: MSScoreT; userId: number }>()
    const navigation = useAppNavigation()
    const actions = useActions({
        fetchSets: scoreSetListThunks.fetchSets,
        loadMoreSets: scoreSetListThunks.loadMoreSets,
    })

    const scoreListChunk = useScoreSetListContext()

    const [isLoading, sets] = useValues([
        scoreListChunk.props.getIsLoading,
        scoreListChunk.props.getItems,
    ])
    const originalSetIds = useRef<number[]>([])
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    const [isButtonDisabled, setButtonDisabled] = useState(true)
    const [isUpdating, setUpdating] = useState(true)

    const validateAdding = (newIds: number[]): { deleted: number[]; added: number[] } => {
        const deleted = originalSetIds.current.filter(x => !newIds.includes(x))
        const added = newIds.filter(x => !originalSetIds.current.includes(x))
        setButtonDisabled(added.length === 0 && deleted.length === 0)
        return { deleted, added }
    }

    const onToggleInSet = async (set: SetT) => {
        if (isUpdating) return
        if (selectedIds.includes(set.id)) {
            const newIds = selectedIds.filter(id => id !== set.id)
            setSelectedIds(newIds)
            validateAdding(newIds)
            return
        }
        const newIds = [...selectedIds, set.id]
        setSelectedIds(newIds)
        validateAdding(newIds)
    }

    const onUpdatePress = async () => {
        if (isUpdating) return
        try {
            setUpdating(true)
            const data = validateAdding(selectedIds)
            if (!await updateScoreInSets(score, data, userId)) {
                showAlertNotification({ title: translate('native.alerts.error_occurred') })
                return
            }
            let dialogText: string
            const title = score.title
            if (data.added.length === 1 && data.deleted.length === 0) {
                dialogText = translate('native.sets.success_add_to_set', { scoreName: title })
            } else if (data.added.length === 0 && data.deleted.length === 1) {
                dialogText = translate('native.sets.success_remove_from_set', {
                    scoreName: title,
                })
            } else {
                const total = data.added.length + data.deleted.length
                dialogText = translate('native.sets.multiple_success_modified', {
                    count: total.toString(),
                })
            }
            showAlertNotification({ text: dialogText })
            navigation.goBack()
        } finally {
            setUpdating(false)
        }
    }

    const onCreate = useCallback(() => {
        navigation.navigate(Screen.createEditSet, {
            userId,
            score,
            edit: false,
        })
    }, [navigation, score, userId])

    const handleLoadMore = () => {
        actions.loadMoreSets(scoreListChunk)
    }

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return (
                    <NavHeader
                        testID={setTestIds.actions.addToSetBack}
                        headerTitle={translate('native.score_action_sheet.set_add_button')}
                        noNotifications
                        onCreateNewSetPress={onCreate}
                    />
                )
            },
        })
    }, [navigation, onCreate])

    useEffect(() => {
        reportEvent(MetricaEvents.SET_SCORE_ADD_OPEN)
    }, [])

    useFocusEffect(useCallback(() => {
        let active = true
        setUpdating(true)
        setButtonDisabled(true)
        void actions.fetchSets(scoreListChunk)
        fetchScoreSetIds(score.id, userId).then(ids => {
            if (!active) return
            setSelectedIds(ids)
            originalSetIds.current = ids
            setUpdating(false)
        }).catch(() => {
            if (active) showAlertNotification({ title: translate('native.alerts.error_occurred') })
        })
        return () => { active = false }
    }, [actions, scoreListChunk, score.id, userId]))

    return (
        <View style={styles.wrapperContainer}>
            <UserSetsListWithCheckbox
                data={sets}
                onToggle={onToggleInSet}
                selectedIds={selectedIds}
                isLoading={isLoading}
                onLoadMore={handleLoadMore}
            />

            <MuseButton
                testID={setTestIds.actions.confirmAddToSet}
                style={[styles.bottomContainer, { marginBottom: safeArea.bottom }]}
                title={translate('native.score_action_sheet.set_add_button')}
                onPress={onUpdatePress}
                disabled={isButtonDisabled}
                isLoading={isUpdating}
            />
        </View>
    )
}

const UserAddSetContainer = () => {
    const { userId } = useAppRoute<{ userId: number }>()
    const { chunk } = useInjectDynamicStoreChunk('add_score_to_set', key =>
        createScoreSetListDynamicStoreChunk(key, userId),
    )

    return (
        <ScoreSetListContext.Provider value={chunk}>
            <UserAddSetScreen />
        </ScoreSetListContext.Provider>
    )
}

export default React.memo(UserAddSetContainer)
