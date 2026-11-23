import { memo, RefObject } from 'react'
import { type HostInstance, StyleSheet } from 'react-native'
import Popover, { PopoverMode, PopoverPlacement, Rect } from 'react-native-popover-view'

import { colors } from '../constants/colors'
import { style } from '../helpers/style'
import { usePopoverAnchor } from '../hooks/usePopoverAnchor'
import { useSettledAnchor } from '../hooks/useSettledAnchor'
import { brandColors } from '../index'

import TooltipContent from './TooltipContent'

type TTooltipProps = {
    visible: boolean
    anchor?: Rect | RefObject<HostInstance | null>
    placement?: PopoverPlacement
    title?: string
    body: string
    buttonText?: string
    badgeText?: string
    hideCloseButton?: boolean
    onButtonPress?: () => void
    onRequestClose?: () => void
    onClose: () => void
    onCloseComplete: () => void
    dataLength?: number
    currentStep?: number
    mode?: PopoverMode
    statusBarTranslucent?: boolean
}

const styles = StyleSheet.create({
    backdrop: style.view({
        backgroundColor: colors.transparent,
        opacity: 1,
    }),
    popover: style.view({
        backgroundColor: brandColors.exceptionInverseLight,
        borderTopLeftRadius: 1,
        borderTopRightRadius: 1,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 1,
    }),
})

const animationConfig = { duration: 0 } as const

const Tooltip = ({
    visible,
    anchor,
    placement,
    title,
    body,
    buttonText,
    badgeText,
    hideCloseButton,
    onButtonPress,
    onClose,
    onCloseComplete,
    onRequestClose,
    dataLength,
    currentStep,
    mode = PopoverMode.RN_MODAL,
    statusBarTranslucent = false,
}: TTooltipProps) => {
    const safeAnchor = usePopoverAnchor(anchor)
    const isAnchorSettled = useSettledAnchor(anchor, visible)

    if (!isAnchorSettled) return null

    return (
        <Popover
            mode={mode}
            from={safeAnchor as any}
            placement={placement}
            isVisible={visible}
            popoverStyle={styles.popover}
            backgroundStyle={styles.backdrop}
            onCloseComplete={onCloseComplete}
            offset={4}
            animationConfig={animationConfig}
            onRequestClose={onRequestClose}
            statusBarTranslucent={statusBarTranslucent}
        >
            <TooltipContent
                {...{
                    onClose,
                    title,
                    body,
                    buttonText,
                    badgeText,
                    hideCloseButton,
                    onButtonPress,
                    dataLength,
                    currentStep,
                }}
            />
        </Popover>
    )
}

export default memo(Tooltip)
