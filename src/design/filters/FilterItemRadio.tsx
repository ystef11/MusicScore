import { memo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import { globalStyles } from '../constants/layout'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'
import { RadioButtonVisual } from '../elements/RadioButton.tsx'

type TProps = {
    name: string
    id: string
    selected?: boolean
    onPress: (id: string) => void
    style?: StyleProp<ViewStyle>
    testID?: string
}

export const FilterItemRadio = memo(({ name, id, selected, testID, onPress, style }: TProps) => {
    return (
        <CommonTouchable
            testID={testID}
            style={style ? [styles.item, style] : styles.item}
            onPress={() => onPress(id)}
        >
            <RadioButtonVisual selected={!!selected} />
            <AppText
                font="f17w400"
                rawText={name}
                numberOfLines={1}
                ellipsizeMode="tail"
                style={globalStyles.flexShrink}
                brandColor="contentPrimary"
            />
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    item: {
        height: 48,
        columnGap: 8,
        borderRadius: 32 / 2,
        alignItems: 'center',
        flexDirection: 'row',
    },
})
