import { StyleSheet } from 'react-native'
import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    container: style.view({
        backgroundColor: colors.white,
    }),
    list: style.view({
        flexGrow: 1,
        paddingHorizontal: 8,
        paddingVertical: 4,
    }),
    title: style.text({
        color: colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    }),
    text: style.text({
        color: colors.black,
        fontSize: 14,
    }),
})
