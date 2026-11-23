import { useRef, useState } from 'react'
import { StyleSheet, View, type ViewInstance } from 'react-native'

import { chevronDown } from '@mu-native/icons/chevronDown'

import { layout } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'
import { CommonTouchable } from '../elements/CommonTouchable'

import { AppText } from './AppText/AppText.tsx'
import { FloatingMenu, TFloatingMenuOption } from './FloatingMenu.tsx'
import Icon from './Icon/Icon.tsx'

type TProps<Id extends string> = {
    /** Optional override; defaults to the selected option's label. */
    label?: string
    title?: string
    options: TFloatingMenuOption<Id>[]
    selectedId?: Id
    onSelect: (id: Id) => void
    testID?: string
}

// A "label ▾" trigger that opens a FloatingMenu anchored beneath itself.
export const FloatingMenuButton = <Id extends string>({
    label,
    title,
    options,
    selectedId,
    onSelect,
    testID,
}: TProps<Id>) => {
    const anchorRef = useRef<ViewInstance>(null)
    const [isMenuVisible, setIsMenuVisible] = useState(false)

    const triggerLabel =
        label ?? options.find(option => option.id === selectedId)?.label ?? options[0]?.label ?? ''

    return (
        <>
            <View ref={anchorRef} collapsable={false}>
                <CommonTouchable
                    style={styles.trigger}
                    onPress={() => setIsMenuVisible(true)}
                    testID={testID}
                >
                    <AppText font="f15w400" rawText={triggerLabel} />
                    <Icon source={chevronDown} size={16} tint={brandColors.contentPrimary} />
                </CommonTouchable>
            </View>
            <FloatingMenu
                isVisible={isMenuVisible}
                anchor={anchorRef}
                title={title}
                options={options}
                selectedId={selectedId}
                onSelect={onSelect}
                onClose={() => setIsMenuVisible(false)}
            />
        </>
    )
}

const styles = StyleSheet.create({
    trigger: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginXs,
        paddingVertical: layout.marginXs,
    },
})
