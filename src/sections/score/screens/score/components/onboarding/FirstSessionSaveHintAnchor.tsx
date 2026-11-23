import { memo, RefObject, useEffect } from 'react'
import { type ViewInstance } from 'react-native'

import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

type Props = {
    anchor: RefObject<ViewInstance | null>
}

export const FirstSessionSaveHintAnchor = memo(({ anchor }: Props) => {
    const [isLocked] = useValues([scoreStoreChunk.props.getIsFirstSessionPlaybackLocked])
    const actions = useActions({ setRect: scoreStoreChunk.actions.setFirstSessionLikeRect })

    useEffect(() => {
        if (!isLocked) return undefined

        anchor.current?.measureInWindow((x, y, width, height) =>
            actions.setRect({ x, y, width, height, radius: Math.min(width, height) / 2 }),
        )

        return () => {
            actions.setRect(null)
        }
    }, [isLocked])

    return null
})
