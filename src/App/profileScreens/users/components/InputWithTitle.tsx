import React, { memo } from 'react'
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'

import { AppText, brandColors, brandFontsStyles } from '@mu-native/ds'

import {
    MARGIN_XS,
    TEXT_COLOR_900,
    MARGIN_LG,
    COLOR_BORDER_LIGHT,
    TEXT_COLOR_400,
} from '../../../constants/styles'

const styles = StyleSheet.create({
    container: {
        alignItems: 'flex-start',
        width: '100%',
    },
    newContainer: {
        alignItems: 'flex-start',
        width: '100%',
        rowGap: 4,
    },
    title: {
        fontWeight: '400',
        fontSize: 16,
        lineHeight: 24,
        color: TEXT_COLOR_900,
        marginTop: MARGIN_LG,
    },
    inputContainer: {
        alignSelf: 'stretch',
        fontSize: 14,
        borderRadius: 6,
        lineHeight: 16,
        paddingTop: 11,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: COLOR_BORDER_LIGHT,
        color: TEXT_COLOR_900,
        height: 112,
        marginTop: MARGIN_XS,
    },
    newInputContainer: {
        alignSelf: 'stretch',
        borderRadius: 1,
        lineHeight: 16,
        paddingTop: 11,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: brandColors.contentTertiary,
        height: 112,
        ...brandFontsStyles.f15w400,
    },
    smallContainer: {
        height: 40,
        color: TEXT_COLOR_900,
    },
})

type TInput = {
    title: string
    value: string
    setValue: (value: string) => void
    small?: boolean
} & Omit<TextInputProps, 'value' | 'onChangeText'>

export const InputWithTitle: React.FC<TInput> = memo(
    ({ title = '', setValue, small = false, ...props }) => (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <TextInput
                {...props}
                onChangeText={setValue}
                spellCheck={false}
                autoCorrect={false}
                blurOnSubmit
                placeholderTextColor={TEXT_COLOR_400}
                autoCapitalize="none"
                multiline
                value={props.value}
                style={[styles.inputContainer, small && styles.smallContainer]}
            />
        </View>
    ),
)

export const BrandInputWithTitle: React.FC<TInput> = memo(
    ({ title = '', setValue, small = false, ...props }) => (
        <View style={styles.newContainer}>
            <AppText font="f15w400" rawText={title} />
            <TextInput
                {...props}
                onChangeText={setValue}
                spellCheck={false}
                autoCorrect={false}
                blurOnSubmit
                placeholderTextColor={brandColors.contentInactive}
                autoCapitalize="none"
                multiline
                value={props.value}
                style={[styles.newInputContainer, small && styles.smallContainer]}
            />
        </View>
    ),
)
