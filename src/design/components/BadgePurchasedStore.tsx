import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppBadge } from './AppBadge.tsx'

export type TPurchasedStore = 'smp' | 'smd'

// Store acronyms are brand names, identical in every locale — no translation.
const STORE_LABELS: Record<TPurchasedStore, string> = {
    smp: 'SMP',
    smd: 'SMD',
}

/**
 * Badge for scores purchased on SheetMusicPlus / SheetMusicDirect (MUP-13968).
 * When a score is both official and store-purchased, this badge replaces the
 * "Official" one (per design) — callers own that precedence. The wire value
 * is passed through unvalidated (`MSScoreT.purchaseSource`), so an unknown
 * marketplace renders nothing rather than an empty badge.
 */
export const BadgePurchasedStore = memo(({ store }: { store: TPurchasedStore }) => {
    const title = STORE_LABELS[store]
    if (!title) return null

    return (
        <AppBadge
            title={title}
            backgroundColor="additionalPromoSmp"
            textColor="exceptionConstantLight"
            style={styles.badge}
        />
    )
})

const styles = StyleSheet.create({
    badge: {
        alignSelf: 'flex-start',
    },
})
