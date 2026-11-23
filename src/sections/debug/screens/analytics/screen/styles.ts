import { StyleSheet } from 'react-native'
import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        backgroundColor: colors.white,
    }),
    list: style.view({
        flexGrow: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
    }),
})
