import { memo } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { translate } from '@mu-native/locale'

import { COLOR_BLUE_600, COLOR_WHITE, TEXT_COLOR_900 } from '../../../constants/styles'

export const ThankYou = memo(({ onDismiss }: { onDismiss: () => void }) => {
    return (
        <>
            <Text style={styles.title}>{translate('native.courses.thank_you')}</Text>
            <Text style={styles.description}>{translate('native.courses.help_us_improve')}</Text>
            <TouchableOpacity style={styles.button} onPress={onDismiss}>
                <Text style={styles.buttonTitle}>{translate('native.courses.youre_welcome')}</Text>
            </TouchableOpacity>
        </>
    )
})

const styles = StyleSheet.create({
    title: {
        fontSize: 18,
        lineHeight: 24,
        fontWeight: '600',
        color: TEXT_COLOR_900,
        marginBottom: 12,
    },
    description: {
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '400',
        color: TEXT_COLOR_900,
    },
    button: {
        width: '100%',
        height: 48,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        marginTop: 40,
        backgroundColor: COLOR_BLUE_600,
    },
    buttonTitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: COLOR_WHITE,
    },
})
