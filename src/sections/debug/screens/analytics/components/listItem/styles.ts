import { StyleSheet } from 'react-native'
import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    buttonsContainer: style.view({
        flexDirection: 'row',
    }),
    container: style.view({
        alignItems: 'center',
        borderColor: colors.gray100,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 4,
        padding: 8,
    }),
    icon: style.image({
        height: 20,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: colors.black,
        width: 20,
    }),
    row: style.view({
        flex: 1,
        flexDirection: 'row',
    }),
    time: style.text({
        color: colors.black,
        fontSize: 12,
        width: '30%',
    }),
    title: style.text({
        color: colors.black,
        fontSize: 12,
        width: '65%',
    }),
})
