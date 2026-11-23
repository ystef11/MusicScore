import React, { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, IconSource, SvgAsset, SvgAssetType } from '@mu-native/ds'
import { closeCompact } from '@mu-native/icons/closeCompact'

interface Props {
    icon?: IconSource
    svg?: SvgAssetType
    onPress: () => void
    count?: number
    title?: string
    isSelected?: boolean
    showCloseIcon?: boolean
    size?: 'small' | 'medium'
}

export const QuickFilterItemChip: React.FC<Props> = memo(props => {
    const isSelected = props.isSelected ?? !!props.count
    const { showCloseIcon = true, size = 'medium' } = props
    const paddingStart = isSelected || !!props.title ? 16 : 0
    const paddingEnd = isSelected || !!props.title ? 16 : 0
    const font = size === 'small' ? 'f13w600' : 'f15w600'
    return (
        <CommonTouchable
            onPress={props.onPress}
            style={[
                styles.base,
                size === 'small' && styles.baseSmall,
                {
                    paddingStart,
                    paddingEnd,
                    backgroundColor: isSelected
                        ? brandColors.contentPrimary
                        : brandColors.backgroundInactive,
                },
            ]}
        >
            {!!props.icon && (
                <Icon
                    source={props.icon}
                    tint={isSelected ? brandColors.exceptionInverseDark : undefined}
                />
            )}
            {!props.icon && !!props.svg && (
                <SvgAsset
                    type={props.svg}
                    tint={isSelected ? brandColors.exceptionInverseDark : undefined}
                />
            )}
            {!!props.count && (
                <AppText
                    font={font}
                    rawText={props.count?.toString()}
                    brandColor="exceptionInverseDark"
                />
            )}
            {!!props.title && (
                <AppText
                    font={font}
                    rawText={props.title}
                    brandColor={isSelected ? 'exceptionInverseDark' : 'exceptionInverseLight'}
                />
            )}
            {!!props.isSelected && showCloseIcon && (
                <Icon source={closeCompact} size={16} tint={brandColors.exceptionInverseDark} />
            )}
        </CommonTouchable>
    )
})
QuickFilterItemChip.displayName = 'QuickFilterItemChip'

const styles = StyleSheet.create({
    base: {
        height: 46,
        minWidth: 46,
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
    baseSmall: {
        height: 36,
        minWidth: 0,
    }
})
