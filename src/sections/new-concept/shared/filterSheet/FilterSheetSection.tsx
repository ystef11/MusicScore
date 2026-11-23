import { ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, layout } from '@mu-native/ds'

type TProps = {
    title: string
    children: ReactNode
}

export const FilterSheetSection = ({ title, children }: TProps) => (
    <View style={styles.container}>
        <AppText font="f17w600" rawText={title} />
        <View style={styles.content}>{children}</View>
        <View style={styles.divider} />
    </View>
)

const styles = StyleSheet.create({
    container: {
        paddingTop: layout.marginMd,
    },
    content: {
        paddingTop: layout.marginXm,
    },
    divider: {
        height: 1,
        marginTop: layout.marginMd,
        backgroundColor: brandColors.strokeDefault,
    },
})
