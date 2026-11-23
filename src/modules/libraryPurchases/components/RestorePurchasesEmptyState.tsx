import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText, brandColors, Icon, layout, MuseButton } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'

import { RestorePurchasesCheckingRow } from './RestorePurchasesCheckingRow'

type TProps = {
    isRestoring: boolean
    onRestorePress: () => void
    /** Hides the restore link (e.g. unverified email — resync would be a no-op that burns the hourly limit). */
    showRestoreAction?: boolean
    style?: StyleProp<ViewStyle>
}

/**
 * Empty state of the purchased scores list (MUP-13968): "You haven't bought
 * anything yet" with a "Restore purchase" link that swaps to the checking
 * loader while the restore request is in flight.
 */
export const RestorePurchasesEmptyState = memo(
    ({ isRestoring, onRestorePress, showRestoreAction = true, style }: TProps) => (
        <View style={[styles.base, style]}>
            <Icon source={brokenHeart} tint={brandColors.contentPrimary} size={40} />
            <AppText
                textAlign="center"
                rawText={translate('native.orders.empty_purchased_title')}
                font="f20w600"
                style={styles.title}
            />
            {showRestoreAction && (
                <View style={styles.action}>
                    {isRestoring ? (
                        <RestorePurchasesCheckingRow />
                    ) : (
                        <MuseButton
                            type="tertiaryUnderlined"
                            title={translate('native.orders.restore_purchase_link')}
                            onPress={onRestorePress}
                            size="large"
                        />
                    )}
                </View>
            )}
        </View>
    ),
)

const styles = StyleSheet.create({
    base: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    title: {
        marginTop: layout.marginMd,
    },
    action: {
        marginTop: layout.marginMd,
        minHeight: 20,
        justifyContent: 'center',
    },
})
