import { StyleSheet } from 'react-native'
import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    button: style.view({
        alignItems: 'center',
        borderColor: colors.gray100,
        borderRadius: 10,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 60,
        marginVertical: 8,
        paddingHorizontal: 8,
        width: '70%',
    }),
    container: style.view({
        alignItems: 'center',
        backgroundColor: colors.white,
        flex: 1,
        justifyContent: 'center',
    }),
    icon: style.image({
        height: 25,
        resizeMode: 'contain',
        tintColor: colors.black,
        width: 25,
    }),
    resetButton: style.view({
        alignItems: 'center',
        borderColor: colors.gray100,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        height: 60,
        marginVertical: 8,
        paddingHorizontal: 8,
        width: '70%',
    }),
    title: style.text({
        color: colors.black,
        fontSize: 24,
    }),
})
