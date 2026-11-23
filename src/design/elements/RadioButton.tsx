import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import Icon, { type IconSource } from '../components/Icon/Icon'
import { useSheetHorizontalInset } from '../components/nativeBottomSheet/SheetInsetContext.tsx'
import { brandColors } from '../constants/new/brandColors.ts'
import { OPACITY_DISABLED } from '../constants/new/opacity.ts'

import { CommonTouchable } from './CommonTouchable.tsx'

export type RadioButtonVisualProps = {
    selected: boolean
    disabled?: boolean
    style?: StyleProp<ViewStyle>
}

export const RadioButtonVisual = memo(({ selected, disabled, style }: RadioButtonVisualProps) => (
    <View pointerEvents="none" style={[styles.radioOuter, disabled && styles.disabled, style]}>
        <View style={[styles.radioCircle, selected ? styles.radioSelected : styles.radioDefault]}>
            {selected && <View style={styles.radioDot} />}
        </View>
    </View>
))

type TRadioButtonProps = {
    selected: boolean
    disabled?: boolean
    title?: string
    onPress?: () => void
    customStyleContainer?: ViewStyle
    icon?: IconSource
    testID?: string
}

const RadioButton = ({
    selected,
    disabled,
    title,
    onPress,
    customStyleContainer,
    icon,
    testID,
}: TRadioButtonProps) => {
    const inset = useSheetHorizontalInset()
    return (
        <CommonTouchable
            style={[
                styles.container,
                { paddingHorizontal: inset },
                !!customStyleContainer && customStyleContainer,
            ]}
            onPress={onPress}
            testID={testID}
        >
            <RadioButtonVisual selected={selected} disabled={disabled} />
            {!!title && <AppText font="f17w400" style={styles.title} rawText={title} />}
            {!!icon && <Icon source={icon} />}
        </CommonTouchable>
    )
}

export default memo(RadioButton)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        alignItems: 'center',
    },
    title: {
        flex: 1,
        marginLeft: 12,
    },
    radioOuter: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        backgroundColor: brandColors.formActive,
    },
    radioDefault: {
        borderWidth: 1,
        borderColor: brandColors.formDefault,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: brandColors.exceptionConstantWhite,
    },
    disabled: {
        opacity: OPACITY_DISABLED,
    },
})
