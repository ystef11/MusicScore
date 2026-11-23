import React from 'react'
import { Image, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'

import { colors, icons } from '@mu-native/ds'

const styles = StyleSheet.create({
    base: {
        paddingHorizontal: 20,
        backgroundColor: colors.white,
    },

    inner: {
        flexDirection: 'row',
        paddingTop: 12,
        paddingBottom: 12,
    },

    label: {
        fontSize: 16,
        color: colors.text900,
        flex: 1,
    },

    checkbox: {
        width: 20,
        height: 20,
    },

    external: {
        paddingBottom: 12,
    },

    externalLabel: {
        color: colors.link,
        fontSize: 14,
    },

    separator: {
        height: 1,
        width: '100%',
        backgroundColor: colors.separator,
    },
})

type TProps = {
    readonly type: number
    readonly label: string
    readonly checked: boolean
    readonly externalLabel?: string
    readonly onExternalPress?: () => void
    readonly onToggle: (type: number) => void
    readonly drawSeparator?: boolean
    readonly style?: StyleProp<ViewStyle>
}

export const CheckBlock = React.memo((props: TProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => props.onToggle(props.type)}
            style={[styles.base, props.style]}
        >
            <View style={styles.inner}>
                <Text style={styles.label} ellipsizeMode="tail">
                    {props.label}
                </Text>
                <Image
                    source={props.checked ? icons.check_box_checked : icons.check_box_unchecked}
                    style={styles.checkbox}
                />
            </View>
            {!!props.externalLabel && (
                <TouchableOpacity style={styles.external} onPress={props.onExternalPress}>
                    <Text style={styles.externalLabel}>{props.externalLabel}</Text>
                </TouchableOpacity>
            )}
            {props.drawSeparator && <View style={styles.separator} />}
        </TouchableOpacity>
    )
})
