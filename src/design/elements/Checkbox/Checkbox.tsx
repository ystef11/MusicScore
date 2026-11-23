import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { checkmark } from '@mu-native/icons/checkmark'

import Icon from '../../components/Icon/Icon'
import { brandColors } from '../../constants/new/brandColors.ts'
import { OPACITY_DISABLED } from '../../constants/new/opacity.ts'

export type CheckboxProps = {
    selected: boolean
    disabled?: boolean
    style?: StyleProp<ViewStyle>
}

export const Checkbox = memo(({ selected, disabled, style }: CheckboxProps) => (
    <View pointerEvents="none" style={[styles.outer, disabled && styles.disabled, style]}>
        <View style={[styles.box, selected ? styles.boxSelected : styles.boxDefault]}>
            {selected && (
                <Icon source={checkmark} size={14} tint={brandColors.exceptionConstantWhite} />
            )}
        </View>
    </View>
))

const styles = StyleSheet.create({
    outer: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        width: 20,
        height: 20,
        borderRadius: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxSelected: {
        backgroundColor: brandColors.formActive,
    },
    boxDefault: {
        borderWidth: 1,
        borderColor: brandColors.formDefault,
    },
    disabled: {
        opacity: OPACITY_DISABLED,
    },
})
