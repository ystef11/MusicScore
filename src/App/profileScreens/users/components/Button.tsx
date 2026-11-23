import { memo } from 'react'
import { StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'

import { CommonTouchable, layout, BrandAppLoader } from '@mu-native/ds'

import { COLOR_DISABLED_BUTTON, COLOR_LINK, COLOR_WHITE } from '../../../constants/styles'

const styles = StyleSheet.create({
    buttonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        maxWidth: layout.maxTabletWidth,
        width: '100%',
        height: 48,
        borderRadius: 8,
        backgroundColor: COLOR_LINK,
    },
    disabledButton: {
        backgroundColor: COLOR_DISABLED_BUTTON,
    },
    buttonLabel: {
        color: COLOR_WHITE,
        fontWeight: '500',
        fontSize: 16,
        lineHeight: 24,
        width: '90%',
        textAlign: 'center',
    },
})

type TButton = {
    label: string
    onPress: () => void
    disabled?: boolean
    isLoading?: boolean
    style?: StyleProp<ViewStyle>
    testID?: string
}

export const Button = memo(
    ({
        onPress = () => null,
        label = '',
        disabled = false,
        isLoading = false,
        style,
        testID,
    }: TButton) => (
        <CommonTouchable
            testID={testID || 'button'}
            onPress={isLoading || disabled ? undefined : onPress}
            disabled={disabled || isLoading}
            style={[styles.buttonContainer, disabled && styles.disabledButton, style as any]}
        >
            {!isLoading && (
                <Text numberOfLines={1} style={styles.buttonLabel}>
                    {label}
                </Text>
            )}
            {isLoading && <BrandAppLoader size="s" />}
        </CommonTouchable>
    ),
)
