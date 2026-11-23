import { StyleSheet } from 'react-native'

import { colors, style, layout } from '@mu-native/ds'

export const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 60,
    }),
    title: style.text({
        fontSize: 16,
        fontWeight: '500',
        lineHeight: 24,
        color: colors.text900,
        marginBottom: 8,
    }),
    line: style.view({
        height: 12,
    }),
    marginTop: style.view({
        marginTop: 24,
    }),
    text: style.text({
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 20,
        color: colors.gray700,
        marginBottom: 12,
        maxWidth: layout.fullScreenWidth / 2,
    }),
    textLight: style.text({
        color: colors.gray500,
    }),
    textBold: style.text({
        fontWeight: '500',
    }),
    infoContainer: style.view({
        flexDirection: 'row',
        marginBottom: 24,
    }),
    infoTitlesContainer: style.view({
        width: 100,
        height: 76,
        marginRight: 40,
        justifyContent: 'space-between',
    }),
    infoValuesContainer: style.view({
        height: 76,
        justifyContent: 'space-between',
    }),
})
