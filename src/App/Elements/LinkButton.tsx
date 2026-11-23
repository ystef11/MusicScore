import { StyleSheet, Text, ViewStyle } from 'react-native'

import { brandColors, CommonTouchable } from '@mu-native/ds'

import { FULL_WIDTH_PERCENT } from '../constants/styles'
import { isAndroid, isIOS, uppercaseAndroidText } from '../Utils/Platform'

const styles = StyleSheet.create({
    text: {
        width: isIOS ? FULL_WIDTH_PERCENT : undefined,
        color: brandColors.colorActionPrimaryDefault,
        fontWeight: isAndroid ? 'normal' : '500',
    },
    underline: {
        textDecorationLine: 'underline',
    },
})
const sizes = {
    normal: {
        fontSize: 16,
        lineHeight: 21,
    },
    small: {
        fontSize: 14,
        lineHeight: 19,
    },
}
const aligns = {
    left: {
        textAlign: 'left',
    },
    center: {
        textAlign: 'center',
    },
    right: {
        textAlign: 'right',
    },
}

type Props = {
    onPress?: () => void
    text: string
    size?: 'normal' | 'small'
    align?: 'left' | 'center' | 'right'
    color?: string
    underline?: boolean
    uppercase?: boolean
    testID?: string
}

const LinkButton = ({
    onPress,
    text,
    size = 'normal',
    align = 'center',
    color,
    underline,
    uppercase,
    testID,
}: Props) => (
    <CommonTouchable {...(testID ? { testID } : {})} onPress={onPress}>
        <Text
            style={[
                styles.text,
                sizes[size],
                aligns[align] as ViewStyle,
                !!color && {
                    color,
                },
                !!underline && styles.underline,
            ]}
        >
            {uppercase ? uppercaseAndroidText(text) : text}
        </Text>
    </CommonTouchable>
)

export default LinkButton
