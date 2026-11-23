import { useCallback, useRef } from 'react'
import { LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent } from 'react-native'

import { platform } from '@mu-native/common'
import { useWindowDimensions } from '@mu-native/system'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import debounce from 'lodash.debounce'

import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

const heightAbsoluteBlock = 140
export const useScrollPositionEvents = () => {
    const refWithItemsPositions = useRef<
        {
            layout: any
            item_id: number
            value: string
            timerIdEvent?: ReturnType<typeof setTimeout>
            isSendScrolledToEvent?: boolean
            isSendShowedToEvent?: boolean
        }[]
    >([])

    const { height: screenHeight } = useWindowDimensions()
    const bottomSheetModalInitialHeight = screenHeight * 0.86
    const bottomSheetModalMaxHeight = screenHeight * (platform.isAndroid ? 0.98 : 0.94)

    const onScrollEnd = useCallback(
        debounce((nativeEvent: NativeScrollEvent) => {
            const { layoutMeasurement, contentOffset } = nativeEvent
            const { height: screenHeight } = layoutMeasurement
            const scrollPosition = screenHeight + contentOffset.y - heightAbsoluteBlock // height absolute

            if (refWithItemsPositions?.current?.length) {
                refWithItemsPositions.current = refWithItemsPositions.current.map(item => {
                    let itemPosition = { ...item }
                    const {
                        layout: itemLayout,
                        item_id: itemId,
                        value,
                        timerIdEvent,
                        isSendScrolledToEvent,
                        isSendShowedToEvent,
                    } = itemPosition

                    if (
                        (itemLayout.y <= bottomSheetModalInitialHeight
                            ? contentOffset.y <= itemLayout.y
                            : scrollPosition >= itemLayout.y &&
                              scrollPosition <= itemLayout.y + bottomSheetModalMaxHeight) &&
                        !isSendScrolledToEvent
                    ) {
                        reportEvent(MetricaEvents.LANDING_PAGE_USER_SECTION_SCROLLED_TO, {
                            value,
                            item_id: itemId,
                            item: 'landing block',
                        })

                        itemPosition = { ...itemPosition, isSendScrolledToEvent: true }
                    } else if (
                        itemLayout.y <= bottomSheetModalInitialHeight
                            ? contentOffset.y > itemLayout.y + itemLayout.height
                            : scrollPosition >= itemLayout.y + itemLayout.height + screenHeight ||
                              scrollPosition <= itemLayout.y
                    ) {
                        itemPosition = { ...itemPosition, isSendScrolledToEvent: false }
                    }

                    const showedItemOnScreenCondition =
                        itemLayout.y <= bottomSheetModalInitialHeight
                            ? contentOffset.y < itemLayout.y + itemLayout.height
                            : scrollPosition >= itemLayout.y + screenHeight / 3 &&
                              scrollPosition <= itemLayout.y + screenHeight * 0.8

                    const showedItemOutScreenCondition =
                        itemLayout.y <= bottomSheetModalInitialHeight
                            ? contentOffset.y > itemLayout.y
                            : scrollPosition >=
                                  itemLayout.y + itemLayout.height + bottomSheetModalMaxHeight ||
                              scrollPosition <= itemLayout.y

                    if (showedItemOnScreenCondition && !isSendShowedToEvent) {
                        reportEvent(MetricaEvents.LANDING_PAGE_USER_SECTION_SHOWED, {
                            value,
                            item_id: itemId,
                            item: 'landing block',
                        })
                        itemPosition = { ...itemPosition, isSendShowedToEvent: true }
                    } else if (showedItemOutScreenCondition && isSendShowedToEvent) {
                        itemPosition = { ...itemPosition, isSendShowedToEvent: false }
                    }

                    if (showedItemOnScreenCondition && !timerIdEvent) {
                        const timerIdEvent = setTimeout(() => {
                            reportEvent(MetricaEvents.LANDING_PAGE_USER_SECTION_SHOWED_3_SEC, {
                                value,
                                item_id: itemId,
                                item: 'landing block',
                            })
                        }, 3000)

                        itemPosition = { ...itemPosition, timerIdEvent }
                    } else if (showedItemOutScreenCondition && itemPosition.timerIdEvent) {
                        clearTimeout(itemPosition.timerIdEvent)

                        itemPosition = { ...itemPosition, timerIdEvent: undefined }
                    }

                    return itemPosition
                })
            }
        }, 1000),
        [screenHeight],
    )

    // RN releases the synthetic event once the handler returns, so read it before debouncing.
    const onScroll = useCallback(
        (event: NativeSyntheticEvent<NativeScrollEvent>) => onScrollEnd(event.nativeEvent),
        [onScrollEnd],
    )

    const onLayoutBlocks =
        (blockData: { value: string; item_id: number }) =>
        ({ nativeEvent }: LayoutChangeEvent) => {
            refWithItemsPositions.current = [
                ...(refWithItemsPositions.current.length ? refWithItemsPositions.current : []),
                { ...blockData, layout: nativeEvent.layout },
            ]
        }

    return {
        onScroll,
        onLayoutBlocks,
    }
}
