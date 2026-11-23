import { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { colors, CommonTouchable } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import {
    COLOR_DEEP_BLUE,
    COLOR_LINK,
    COLOR_SILVER,
    COLOR_WHITE,
    MARGIN_LG,
    MARGIN_MD,
    MARGIN_XM,
} from '../../constants/styles'

const styles = StyleSheet.create({
    container: {
        padding: MARGIN_LG,
    },
    title: {
        fontWeight: '500',
        fontSize: 20,
        lineHeight: 23,
        color: COLOR_DEEP_BLUE,
        paddingBottom: MARGIN_MD,
    },
    variantText: {
        fontSize: 16,
        lineHeight: 21,
        color: COLOR_DEEP_BLUE,
    },
    submitButton: {
        backgroundColor: COLOR_LINK,
        borderColor: COLOR_LINK,
        borderWidth: 1,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButtonTitle: {
        color: COLOR_WHITE,
        fontSize: 14,
        lineHeight: 16,
        paddingVertical: MARGIN_XM,
    },
    input: {
        marginTop: MARGIN_XM,
        marginBottom: MARGIN_MD,
        padding: 14,
        backgroundColor: COLOR_WHITE,
        borderColor: COLOR_SILVER,
        borderWidth: 1,
        borderRadius: 2,
        color: COLOR_DEEP_BLUE,
        fontSize: 16,
        lineHeight: 21,
    },
})
export const EmailInput = ({ onSubmit }: { onSubmit: (value: string) => void }) => {
    const [value, setValue] = useState('')
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate('native.help_center.step_second.title')}</Text>
            <Text style={styles.variantText}>{translate('native.help_center.step_second.text')}</Text>
            <TextInput
                style={styles.input}
                placeholder={translate('native.screen_new_account.email')}
                value={value}
                onChangeText={setValue}
                placeholderTextColor={colors.silverDeep}
                autoCapitalize="none"
                keyboardType="email-address"
                disableFullscreenUI
            />
            <CommonTouchable onPress={() => onSubmit(value)}>
                <View style={styles.submitButton}>
                    <Text style={styles.submitButtonTitle}>
                        {translate('native.search.submit_button')}
                    </Text>
                </View>
            </CommonTouchable>
        </View>
    )
}
