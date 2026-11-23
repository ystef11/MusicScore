import { useCallback, useMemo } from 'react'

import { Clipboard } from '@mu-native/common'
import { debugStore, debugThunks } from '@mu-native/debug'
import { NavigationService, Screen } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import { showAlertNotification } from '../../../../../../App/Elements/NewAlertNotifications'

import ListItemComponent from './ListItemComponent'

type TProps = {
    index: number
}

const ListItemContainer = ({ index }: TProps) => {
    const actions = useActions({
        setRequest: debugStore.actions.setRequest,
        shareRequest: debugThunks.shareRequest,
    })

    const [api] = useValues([debugStore.props.getApi])

    const request = useMemo(() => api[index], [index])

    const handleEvent = useCallback(() => {
        actions.setRequest(request)
        NavigationService.navigate(Screen.debugRequest)
    }, [index])

    const handleCopy = useCallback(() => {
        Clipboard.setString(JSON.stringify(request))
        showAlertNotification({ title: 'Request copied' })
    }, [index])

    const handleShare = useCallback(() => {
        actions.shareRequest(request)
    }, [index])

    return (
        <ListItemComponent
            status={request?.status}
            time={request.time}
            title={request.url}
            onEvent={handleEvent}
            onCopy={handleCopy}
            onShare={handleShare}
        />
    )
}

export default ListItemContainer

export type TListItemContainer = typeof ListItemContainer
