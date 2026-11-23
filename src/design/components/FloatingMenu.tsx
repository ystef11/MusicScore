import { RefObject } from 'react'
import { type HostInstance, StyleSheet, View } from 'react-native'
import Popover, { PopoverPlacement, Rect } from 'react-native-popover-view'

import { checkmark } from '@mu-native/icons/checkmark'

import { brandColors } from '../constants/new/brandColors.ts'
import { CommonTouchable } from '../elements/CommonTouchable'
import { usePopoverAnchor } from '../hooks/usePopoverAnchor.ts'

import { AppText } from './AppText/AppText.tsx'
import Icon from './Icon/Icon.tsx'

export type TFloatingMenuOption<Id extends string = string> = {
    id: Id
    label: string
    disabled?: boolean
}

type TProps<Id extends string> = {
    isVisible: boolean
    anchor?: Rect | RefObject<HostInstance | null>
    title?: string
    options: TFloatingMenuOption<Id>[]
    selectedId?: Id
    placement?: PopoverPlacement | PopoverPlacement[]
    width?: number
    onSelect: (id: Id) => void
    onClose: () => void
}

export const FloatingMenu = <Id extends string>({
    isVisible,
    anchor,
    title,
    options,
    selectedId,
    placement = PopoverPlacement.BOTTOM,
    width = 250,
    onSelect,
    onClose,
}: TProps<Id>) => {
    const safeAnchor = usePopoverAnchor(anchor)

    return (
        <Popover
            from={safeAnchor as any}
            placement={placement}
            isVisible={isVisible}
            popoverStyle={styles.popover}
            backgroundStyle={styles.backdrop}
            arrowSize={ARROW_HIDDEN}
            offset={4}
            onRequestClose={onClose}
        >
            <View style={[styles.content, { width }]}>
                {!!title && (
                    <View style={styles.titleRow}>
                        <AppText
                            font="f13w500"
                            brandColor="contentTertiary"
                            numberOfLines={1}
                            rawText={title}
                        />
                    </View>
                )}
                {options.map(option => (
                    <CommonTouchable
                        key={option.id}
                        style={styles.optionRow}
                        disabled={option.disabled}
                        onPress={() => {
                            onClose()
                            onSelect(option.id)
                        }}
                    >
                        <AppText
                            font="f17w400"
                            brandColor={option.disabled ? 'contentTertiary' : undefined}
                            numberOfLines={1}
                            rawText={option.label}
                            style={styles.optionLabel}
                        />
                        {option.id === selectedId && (
                            <Icon source={checkmark} size={20} tint={brandColors.contentPrimary} />
                        )}
                    </CommonTouchable>
                ))}
            </View>
        </Popover>
    )
}

const ARROW_HIDDEN = { width: 0, height: 0 }

const MENU_SHADOW = {
    shadowColor: 'black',
    shadowOpacity: 0.12,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
}

const styles = StyleSheet.create({
    popover: {
        borderRadius: 16,
        backgroundColor: brandColors.backgroundDefault,
        ...MENU_SHADOW,
    },
    backdrop: {
        backgroundColor: brandColors.transparent,
    },
    content: {
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    titleRow: {
        paddingHorizontal: 8,
        paddingTop: 4,
        paddingBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingLeft: 6,
        paddingRight: 8,
        paddingVertical: 10,
    },
    optionLabel: {
        flex: 1,
    },
})
