import React, { useCallback } from 'react'

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
        setEvent: debugStore.actions.setEvent,
        shareEvent: debugThunks.shareEvent,
    })

    const [analytics] = useValues([debugStore.props.getAnalytics])

    const event = React.useMemo(() => analytics[index], [index])

    const handleEvent = useCallback(() => {
        actions.setEvent(event)
        NavigationService.navigate(Screen.debugEvent)
    }, [index])
    const handleCopy = useCallback(() => {
        Clipboard.setString(JSON.stringify(event))
        showAlertNotification({ title: 'Event copied' })
    }, [index])
    const handleShare = useCallback(() => {
        actions.shareEvent(event)
    }, [index])

    return (
        <ListItemComponent
            time={event.time}
            title={event.title}
            onEvent={handleEvent}
            onCopy={handleCopy}
            onShare={handleShare}
        />
    )
}

export default ListItemContainer

export type TListItemContainer = typeof ListItemContainer
