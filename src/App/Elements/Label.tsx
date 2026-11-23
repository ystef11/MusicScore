import { StyleSheet, Text, View } from 'react-native'

import {
    COLOR_ACTIVE,
    COLOR_DISABLED_BUTTON,
    COLOR_GREEN_GO_PRO,
    COLOR_GREEN_PRO_LABEL,
    COLOR_SILVER_DEEP,
    COLOR_WHITE,
    MARGIN_SM,
    MARGIN_XS,
} from '../constants/styles'

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
})
const themes = {
    pro: {
        height: 18,
        width: 28,
        backgroundColor: COLOR_GREEN_PRO_LABEL,
        borderRadius: 4,
        justifyContent: 'center',
    },
    grey: {
        backgroundColor: COLOR_SILVER_DEEP,
        borderColor: COLOR_WHITE,
        borderWidth: 1,
    },
    active: {
        backgroundColor: COLOR_ACTIVE,
    },
    rectangle: {
        backgroundColor: COLOR_WHITE,
        borderColor: '#7F94A6',
        borderWidth: 1,
    },
    notification: {
        paddingHorizontal: 4,
        backgroundColor: COLOR_GREEN_GO_PRO,
        borderRadius: 20,
    },
    blocked: {
        height: 18,
        width: 28,
        backgroundColor: COLOR_DISABLED_BUTTON,
        borderRadius: 4,
        justifyContent: 'center',
    },
}
const textThemes = {
    pro: {
        color: COLOR_WHITE,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
    },
    grey: {
        color: COLOR_WHITE,
    },
    active: {
        color: COLOR_WHITE,
    },
    rectangle: {
        color: '#7F94A6',
    },
    notification: {
        color: COLOR_WHITE,
        minWidth: 28,
    },
    blocked: {
        color: COLOR_WHITE,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 16,
        fontWeight: '600',
    },
}
const sizes = {
    normal: {
        paddingVertical: MARGIN_XS,
        paddingHorizontal: MARGIN_SM,
        minWidth: 40,
    },
    medium: {
        fontSize: 14,
        fontWeight: '500',
        paddingVertical: MARGIN_XS / 2,
        paddingHorizontal: MARGIN_XS,
        minWidth: 40,
    },
    xm: {
        paddingHorizontal: MARGIN_SM,
        fontSize: 14,
        lineHeight: 19,
    },
    small: {
        paddingHorizontal: MARGIN_XS / 2,
        fontSize: 9,
        lineHeight: 12,
    },
    xs: {
        paddingHorizontal: MARGIN_XS / 2,
        fontSize: 9,
        lineHeight: 12,
    },
}

type TProps = {
    theme?: keyof typeof textThemes
    size?: keyof typeof sizes
    text: string
}

const Label = ({ theme = 'active', text, size = 'normal' }: TProps) => {
    const currentTheme = themes[theme]
    const currentTextTheme = textThemes[theme]
    const currentSize = sizes[size]
    return (
        <View style={[styles.container, currentTheme]}>
            <Text style={[styles.text, currentSize, currentTextTheme]}>{text}</Text>
        </View>
    )
}

export default Label
