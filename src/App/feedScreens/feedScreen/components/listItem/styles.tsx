import { StyleSheet } from 'react-native'

import { platform } from '@mu-native/common'
import { style, layout, colors } from '@mu-native/ds'

export const styles = StyleSheet.create({
    container: style.view({
        width: '100%',
        alignSelf: 'center',
        marginTop: layout.marginMd,
        paddingVertical: platform.isTablet ? layout.marginMd : layout.marginXm,
        backgroundColor: colors.white,
    }),
    itemHeadContainer: style.view({
        paddingTop: 2,
        paddingLeft: 0,
        marginBottom: 12,
    }),

    feedItem: {
        marginHorizontal: 0,
        marginBottom: 32,
        paddingHorizontal: 0,
    },
})
