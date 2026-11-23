import React, { memo } from 'react'

import { CommonTouchable, SvgAsset } from '@mu-native/ds'

import { useGiftChecklistHub } from '../../../../Elements/hubs/GiftChecklistHub.tsx'

export const HeaderGiftButton: React.FC = memo(() => {
    const params = useGiftChecklistHub()
    if (params.isHideHub) return null
    return (
        <CommonTouchable onPress={params.onHubPress}>
            <SvgAsset type="ic_gift_hub" />
        </CommonTouchable>
    )
})
HeaderGiftButton.displayName = 'HeaderGiftButton'
