import { StyleSheet } from 'react-native'
import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
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
        height: 15,
        resizeMode: 'contain',
        tintColor: colors.black,
        width: 15,
    }),
    row: style.view({
        flex: 1,
        flexDirection: 'row',
    }),
    timeButton: style.view({
        paddingRight: 4,
        width: '45%',
    }),
    time: style.text({
        color: colors.black,
        fontSize: 12,
        width: '100%',
    }),
    titleButton: style.view({
        width: '53%',
    }),
    title: style.text({
        color: colors.black,
        fontSize: 12,
        width: '100%',
    }),
})
