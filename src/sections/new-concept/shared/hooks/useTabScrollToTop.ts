import { useCallback, useRef } from 'react'
import type { FlatList, ScrollViewInstance } from 'react-native'

import { useFocusEffect } from '@mu-native/navigation'

import { registerTabRepressAction } from '../helpers/tabScrollRegistry'

/**
 * Registers the focused tab-root screen's scroll view so re-pressing its already
 * active tab in the floating tab bar scrolls it back to the top.
 *
 * Attach the returned ref to the screen's `ScrollView` or `FlatList` (or a
 * component that forwards its ref to one). Registration follows focus, so only
 * the visible root of each tab responds.
 */
export const useTabScrollToTop = <
    T extends Pick<ScrollViewInstance, 'scrollTo'> | Pick<FlatList<unknown>, 'scrollToOffset'>,
>(
    routeName: string,
) => {
    const ref = useRef<T>(null)

    useFocusEffect(
        useCallback(
            () =>
                registerTabRepressAction(routeName, () => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const node = ref.current as any
                    if (!node) return
                    if (typeof node.scrollToOffset === 'function') {
                        node.scrollToOffset({ offset: 0, animated: true })
                    } else if (typeof node.scrollTo === 'function') {
                        node.scrollTo({ y: 0, animated: true })
                    }
                }),
            [routeName],
        ),
    )

    return ref
}
