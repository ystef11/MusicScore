import { memo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import { translate } from '@mu-native/locale/i18n'

import { layout } from '../../constants/layout.ts'
import { brandColors } from '../../constants/new/brandColors.ts'
import { layoutHelpers } from '../../helpers/layout.ts'

const { getResponsiveSizeExtended } = layoutHelpers

export const DividerComponent = memo(
    ({
        customStyle = {},
        isShowOrTitle = true,
    }: {
        customStyle?: StyleProp<ViewStyle>
        isShowOrTitle?: boolean
    }) => (
        <View style={[styles.dividerContainer, customStyle]}>
            <View style={styles.divider} />
            {isShowOrTitle && (
                <Text style={styles.textDivider}>{translate('native.game_screen.or')}</Text>
            )}
            <View style={styles.divider} />
        </View>
    ),
)

const styles = StyleSheet.create({
    dividerContainer: {
        maxWidth: layout.maxWidthTabletContainer,
        width: '100%',
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: getResponsiveSizeExtended(16),
    },
    textDivider: {
        fontSize: getResponsiveSizeExtended(14),
        color: brandColors.contentSecondary,
        paddingHorizontal: getResponsiveSizeExtended(16),
    },
    divider: {
        height: 1,
        flex: 1,
        backgroundColor: brandColors.contentPrimary,
    },
})
