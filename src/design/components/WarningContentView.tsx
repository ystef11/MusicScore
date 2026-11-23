import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { attention } from '@mu-native/icons/attention'
import { warning } from '@mu-native/icons/warning'

import { globalStyles } from '../constants/layout'
import { brandColors } from '../constants/new/brandColors.ts'

import { AppText } from './AppText/AppText'
import Icon, { type IconSource } from './Icon/Icon'

interface Props {
    type: 'wrning' | 'error'
    title: string
}

export const WarningContentView: React.FC<Props> = memo(props => {
    const icon: IconSource = props.type === 'error' ? attention : warning
    // Pack icons are single-colour and take their tone from the caller.
    const iconTint = props.type === 'error' ? brandColors.statusError : brandColors.statusWarning
    const backgroundColor =
        props.type === 'error' ? brandColors.statusErrorSubdued : brandColors.statusWarningSubdued
    return (
        <View style={[styles.errorBlock, { backgroundColor }]}>
            <Icon source={icon} tint={iconTint} />
            <AppText font="f14w400" rawText={props.title} style={globalStyles.flexShrink} />
        </View>
    )
})
WarningContentView.displayName = 'WarningContentView'

const styles = StyleSheet.create({
    errorBlock: {
        minHeight: 44,
        paddingVertical: 12,
        borderRadius: 1,
        borderWidth: 1,
        gap: 8,
        flexDirection: 'row',
        paddingHorizontal: 12,
        marginBottom: 12,
        borderColor: brandColors.strokeDefault,
    },
})
