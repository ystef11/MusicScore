import React from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import { brandColors, BrandThemeColorKey } from '../constants/new/brandColors.ts'
import { BrandAppLoader } from '../elements/BrandAppLoader/BrandAppLoader'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

type TProps = {
    readonly rawText?: string
    readonly disabled?: boolean
    readonly type?: 'primary' | 'secondary' | 'ternary' | 'accent'
    readonly onPress: () => void
    readonly style?: StyleProp<ViewStyle>
    readonly isLoading?: boolean
    readonly testID?: string
}

export const FilterButton: React.FC<TProps> = ({
    onPress,
    rawText,
    style,
    type,
    isLoading,
    disabled,
    testID,
}) => {
    const buttonType = type ?? 'primary'

    let backgroundColor: BrandThemeColorKey = 'additionalDefault'
    if (buttonType === 'secondary') backgroundColor = 'backgroundInactive'

    if (disabled) backgroundColor = 'colorBackgroundDisabled'
    if (buttonType === 'ternary') backgroundColor = 'transparent'
    if (buttonType === 'accent') backgroundColor = 'accentPrimary'

    let titleColor: BrandThemeColorKey = 'backgroundDefault'
    if (buttonType === 'secondary') titleColor = 'contentPrimary'
    if (buttonType === 'ternary') titleColor = 'contentPrimary'

    if (disabled) titleColor = 'contentInactive'

    return (
        <CommonTouchable
            testID={testID}
            disabled={disabled}
            onPress={isLoading ? undefined : onPress}
            style={[styles.base, style, { backgroundColor: brandColors[backgroundColor] }]}
        >
            {isLoading && (
                <BrandAppLoader size="s" color={brandColors[titleColor]} style={styles.loader} />
            )}
            {!!rawText && (
                <AppText
                    rawText={rawText}
                    brandColor={titleColor}
                    font="f15w500"
                    decorationLine={buttonType === 'ternary' ? 'underline' : 'none'}
                />
            )}
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    base: {
        minWidth: 44,
        height: 44,
        borderRadius: 22,
        paddingHorizontal: 16,
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },

    loader: {
        width: 24,
        height: 24,
    },
})
