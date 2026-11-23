import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import { globalStyles } from '../constants/layout'

import { CommonTouchable } from './CommonTouchable.tsx'
import { RadioButtonVisual } from './RadioButton.tsx'

interface Props {
    style?: StyleProp<ViewStyle>
    onPress: () => void
    isSelected: boolean
    title: string
}

export const AppRadioButton = (props: Props) => {
    return (
        <CommonTouchable style={[props.style, styles.base]} onPress={props.onPress}>
            <RadioButtonVisual selected={props.isSelected} />
            <AppText
                font="f17w400"
                rawText={props.title}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={globalStyles.flexShrink}
                brandColor="contentPrimary"
            />
        </CommonTouchable>
    )
}
AppRadioButton.displayName = 'AppRadioButton'

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
})
