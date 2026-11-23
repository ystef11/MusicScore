import React, { useCallback } from 'react'

import { Clipboard } from '@mu-native/common'

import { showAlertNotification } from '../../../../../../App/Elements/NewAlertNotifications'

import ListItemComponent from './ListItemComponent'

type TProps = {
    item: { key: string; value: string }
}

const ListItemContainer = ({ item }: TProps) => {
    const handleCopyAll = React.useCallback(() => {
        Clipboard.setString(`${item.key}: ${item.value}`)
        showAlertNotification({ title: 'Item copied' })
    }, [])
    const handleCopyKey = useCallback(() => {
        Clipboard.setString(item.key)
        showAlertNotification({ title: 'Key copied' })
    }, [])
    const handleCopyValue = useCallback(() => {
        Clipboard.setString(item.value)
        showAlertNotification({ title: 'Value copied' })
    }, [])

    return (
        <ListItemComponent
            item={item}
            onCopyAll={handleCopyAll}
            onCopyKey={handleCopyKey}
            onCopyValue={handleCopyValue}
        />
    )
}

export default ListItemContainer

export type TListItemContainer = typeof ListItemContainer
