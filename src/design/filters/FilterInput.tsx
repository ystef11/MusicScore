import { memo } from 'react'
import { StyleSheet, TextInput, View } from 'react-native'

import { colors } from '../constants/colors.ts'
import { brandColors } from '../constants/new/brandColors.ts'
import { brandFontsStyles } from '../constants/new/fonts.ts'

type Props = {
    placeholder: string
    value: string
    onChangeText: (text: string) => void
    testID: string
}

export const FilterInput = memo(({ placeholder, value, onChangeText, testID }: Props) => {
    return (
        <View style={styles.borderTransparent}>
            <TextInput
                testID={testID}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={brandColors.contentInactive}
                onChangeText={onChangeText}
                value={value}
                keyboardType="numeric"
            />
        </View>
    )
})

const styles = StyleSheet.create({
    input: {
        flex: 1,
        ...brandFontsStyles.f15w400,
        borderWidth: 1,
        height: 44,
        borderColor: colors.gray200,
        color: colors.black,
        paddingVertical: 0,
        paddingHorizontal: 12,
    },
    borderTransparent: {
        borderColor: colors.transparent,
        flex: 1,
    },
})
