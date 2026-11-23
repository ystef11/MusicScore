import React from 'react'

import { Clipboard } from '@mu-native/common'

import { showAlertNotification } from '../../../../../../App/Elements/NewAlertNotifications'

import ListItemComponent from './ListItemComponent'

type TProps = {
    item: { key: string; value: string }
}

const ListItemContainer = ({ item }: TProps) => {
    const handleCopyAll = () => {
        Clipboard.setString(`${item.key}: ${item.value.replaceAll('"', '')}`)
        showAlertNotification({ title: 'Item copied' })
    }

    const handleCopyKey = () => {
        Clipboard.setString(item.key)
        showAlertNotification({ title: 'Key copied' })
    }

    const handleCopyValue = () => {
        Clipboard.setString(item.value.replaceAll('"', ''))
        showAlertNotification({ title: 'Value copied' })
    }

    if (!item.value) return null

    return (
        <ListItemComponent
            item={item}
            onCopyAll={handleCopyAll}
            onCopyKey={handleCopyKey}
            onCopyValue={handleCopyValue}
        />
    )
}

export default React.memo(ListItemContainer)

export type TListItemContainer = typeof ListItemContainer
