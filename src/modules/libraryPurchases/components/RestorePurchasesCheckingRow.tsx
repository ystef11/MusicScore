import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { libraryTestIds } from '@mu/mu-mobile-test-id'
import { AppText, BrandAppLoader, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

/** Spinner + "Checking for purchases…" shown while the restore request is in flight. */
export const RestorePurchasesCheckingRow = memo(() => (
    <View style={styles.row} testID={libraryTestIds.components.restorePurchaseChecking}>
        <BrandAppLoader size="xs" />
        <AppText font="f15w400" rawText={translate('native.orders.restore_purchase_checking')} />
    </View>
))

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: layout.marginSm,
    },
})
