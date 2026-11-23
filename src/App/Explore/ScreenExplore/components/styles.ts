import { StyleSheet } from 'react-native'

import { brandColors, colors, layout, randomBrandColor } from '@mu-native/ds'

import { MAX_TABLET_WIDTH } from '../../../constants/styles'

export const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    emptyContainer: {
        flex: 1,
        width: '100%',
        maxWidth: MAX_TABLET_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: layout.marginMd,
    },
    title: {
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
        color: colors.deepBlue,
    },
    suggestionsListContainer: {
        height: '100%',
        backgroundColor: randomBrandColor(),
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: layout.marginMd,
        marginBottom: 4,
        width: '95%',
        maxWidth: layout.maxTabletWidth,
        alignSelf: 'center',
    },
    subtitle: {
        color: colors.gray900,
        left: layout.marginXs,
        fontSize: 20,
        fontWeight: '600',
    },
    uploadNowButton: {
        marginTop: 20,
    },
    scoresSheetButton: {
        position: 'absolute',
        bottom: 88,
        left: layout.baseMarginFromEdges,
        zIndex: 10,
    },
})
