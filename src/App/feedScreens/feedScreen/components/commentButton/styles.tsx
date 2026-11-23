import { StyleSheet } from 'react-native'

import { colors, layout, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    btnContainer: style.view({
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: layout.marginXm,
        paddingBottom: layout.marginXs / 2,
        marginHorizontal: layout.marginSm,
    }),
    icon: style.image({
        tintColor: colors.text900,
    }),
    textStyle: style.text({
        color: colors.text900,
        fontSize: 14,
        lineHeight: 19,
        marginLeft: 10,
    }),
})
