import { useEffect } from 'react'
import { Linking } from 'react-native'

import { BaseEmptyStateView } from '@mu-native/ds'
import { noteList } from '@mu-native/icons/noteList'
import { translate } from '@mu-native/locale'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions } from '@ug/store'

import reportEvent from '../../Utils/Analytics'
import { openMsczFileManagerWithPermissions } from '../../Utils/FileManager'

const EmptySongBookList = () => {
    const actions = useActions({
        openMsczFileManagerWithPermissions,
    })

    useEffect(() => {
        reportEvent(RT_EVENTS.SONGBOOK_UPLOAD_SHOW)
    }, [])

    const openFileManager = () => {
        reportEvent(RT_EVENTS.SONGBOOK_UPLOAD_CLICK, {
            'params.key': ['format'],
            'params.str_value': ['mcsz'],
            'params.value': [0],
        })
        actions.openMsczFileManagerWithPermissions()
    }
    const openEditorLink = async () => {
        const EDITOR_LINK = 'https://musescore.org/'
        const canOpenLink = await Linking.canOpenURL(EDITOR_LINK)

        if (canOpenLink) {
            await Linking.openURL(EDITOR_LINK)
        }
    }

    return (
        <BaseEmptyStateView
            title={translate('native.library.songbook.title')}
            description={translate('native.offline_scores.empty_description')}
            icon={noteList}
            primaryButton={{
                title: translate('native.library.songbook.upload_btn_title'),
                onPress: openFileManager,
            }}
            footerSecondaryButton={{
                title: translate('native.library.songbook.editor_link'),
                onPress: openEditorLink,
            }}
        />
    )
}

export default EmptySongBookList
