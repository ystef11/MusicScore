import { useCallback, useRef, useState } from 'react'
import { Alert } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { MuseButton, showAlertNotification, type MuseButtonProps } from '@mu-native/ds'
import { cloudDownload } from '@mu-native/icons/cloudDownload'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { isScoreInSongbook } from '@mu-native/songbook'
import { useValues } from '@ug/store'

import SongBookController, { getLocalScoreState } from '../../../../../../../App/Controllers/SongBookController'
import { isScoreDownloadable } from '../../../../../../../App/Model/MSScore'
import { subscribeWebScoreCache } from '../../../../../../../App/Services/WebScoreProvider'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers'
import type { MSScoreT } from '../../../types/scoreTypes'

type Props = {
    score: MSScoreT
    size?: MuseButtonProps['size']
    adaptiveTextSize?: boolean
}

export const ScoreDetailsSaveButton = ({ score, size = 'small', adaptiveTextSize }: Props) => {
    const { id, revision, isOffline, isPdf, webScoreSaved } = score
    const [inLibrary] = useValues([isScoreInSongbook(score)])
    const [files, setFiles] = useState<Awaited<ReturnType<typeof getLocalScoreState>>>()
    const [busy, setBusy] = useState(false)
    const pending = useRef(false)

    useFocusEffect(useCallback(() => {
        let active = true
        const check = async () => {
            const state = await getLocalScoreState({ id, revision, isOffline, isPdf, webScoreSaved })
            if (active) setFiles(state)
        }
        const refresh = (changedId: number) => {
            if (changedId === id) void check()
        }
        const unsubscribe = subscribeWebScoreCache(refresh)
        void check()
        return () => {
            active = false
            unsubscribe()
        }
    }, [id, revision, isOffline, isPdf, webScoreSaved]))

    if (!files) return null
    const saved = !!(files.webSaved || files.fileSaved)
    if ((saved && inLibrary) || (score.isOffline && !saved) || !isScoreDownloadable(score)) return null

    const run = async (operation: () => Promise<void>) => {
        if (pending.current) return
        pending.current = true
        setBusy(true)
        try {
            await operation()
        } catch (error) {
            Alert.alert(translate('native.alerts.error_occurred'), error instanceof Error ? error.message : undefined)
        } finally {
            pending.current = false
            setBusy(false)
            setFiles(await getLocalScoreState(score))
        }
    }

    const onSave = () => void run(async () => {
        reportEvent(RT_EVENTS.SCORE_ADD_TO_LIBRARY_CLICK, getScoreMetaEvent(score))
        await SongBookController.saveOffline(score)
        showAlertNotification({ title: translate('native.alertNotifications.songbook.add_exp') })
    })

    return (
        <MuseButton
            size={size}
            adaptiveTextSize={adaptiveTextSize}
            type="secondary"
            isLoading={busy}
            title={translate('native.score_details_sheet.save_button')}
            startIcon={cloudDownload}
            testID={scoreTestIds.scoreDetailsSaveButton}
            onPress={onSave}
        />
    )
}
