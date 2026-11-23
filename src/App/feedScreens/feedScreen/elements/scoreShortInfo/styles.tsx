import { StyleSheet } from 'react-native'

import { colors, layout, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    textContainer: style.text({
        marginBottom: layout.marginXs,
    }),
    scoreTitle: style.text({
        fontSize: 14,
        lineHeight: 20,
        color: colors.blue600,
    }),
    scoreAuthorName: style.text({
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '500',
        color: colors.text900,
    }),
})
