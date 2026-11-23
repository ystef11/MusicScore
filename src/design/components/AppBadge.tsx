import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { brandColors, BrandThemeColorKey } from '../constants/new/brandColors.ts'

import { AppText } from './AppText/AppText.tsx'
import Icon, { type IconSource } from './Icon/Icon'

type TProps = {
    title: string
    /** Palette keys only — badges must stay on design-system colors. */
    backgroundColor: BrandThemeColorKey
    textColor: BrandThemeColorKey
    /** 12px icon rendered before the title, tinted with `textColor`. */
    icon?: IconSource
    style?: StyleProp<ViewStyle>
}

/**
 * Universal score/course badge (Figma `AppBadge / Default`): a 20px-tall label
 * with 12sp medium text. Prefer the ready-made presets (`BadgeOfficial`,
 * `BadgeOriginal`, `BadgeComplexity`, `BadgePrivacy`, `BadgePurchasedStore`) —
 * they carry the approved color pairs and domain logic.
 */
export const AppBadge = memo(({ title, backgroundColor, textColor, icon, style }: TProps) => (
    <View style={[styles.container, { backgroundColor: brandColors[backgroundColor] }, style]}>
        {!!icon && <Icon source={icon} size={12} tint={brandColors[textColor]} />}
        <AppText font="f12w600" brandColor={textColor} rawText={title} numberOfLines={1} />
    </View>
))

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        // Keeps the title centered when a parent stretches the badge
        // (e.g. the badge column on score previews).
        justifyContent: 'center',
        height: 20,
        borderRadius: 1,
        paddingHorizontal: 8,
        gap: 4,
    },
})
