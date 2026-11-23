import { StyleSheet } from 'react-native'

import { colors, style } from '@mu-native/ds'

export const styles = StyleSheet.create({
    instrumentChevronContainer: style.view({
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    }),
    instrumentChevronExpanded: style.image({
        width: 20,
        height: 20,
        tintColor: colors.text900,
    }),
})
