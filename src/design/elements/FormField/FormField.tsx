import { memo, type ReactNode } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText } from '../../components/AppText/AppText'
import { layout } from '../../constants/layout.ts'
import { brandColors } from '../../constants/new/brandColors.ts'

type Props = {
    label: string
    children: ReactNode
    error?: string | null
    style?: StyleProp<ViewStyle>
}

export const FormField = memo(({ label, children, error, style }: Props) => {
    return (
        <View style={[styles.container, style]}>
            <AppText font="f15w600" rawText={label} style={styles.label} />
            {children}
            {!!error && <AppText font="f13w400" rawText={error} style={styles.errorText} />}
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    label: {
        marginBottom: layout.marginXs,
    },
    errorText: {
        color: brandColors.statusError,
        marginTop: layout.marginXs,
    },
})
