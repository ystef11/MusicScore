import { StyleSheet, View } from 'react-native'

import { BadgeComplexity } from '../BadgeComplexity/BadgeComplexity'
import { BadgeOfficial } from '../BadgeOfficial'
import { BadgeOriginal } from '../BadgeOriginal'
import { BadgePrivacy } from '../BadgePrivacy/BadgePrivacy'
import { BadgePurchasedStore, TPurchasedStore } from '../BadgePurchasedStore'

type TProps = {
    isOfficial?: boolean
    /** SMP/SMD purchase badge; replaces "Official" when both apply (MUP-13968). */
    purchaseSource?: TPurchasedStore | null
    original?: boolean
    complexity?: 0 | 1 | 2 | 3
    privacy?: number
}

export const BadgeElements = ({
    isOfficial = false,
    purchaseSource = null,
    original = false,
    complexity = 0,
    privacy,
}: TProps) => {
    return (
        <View style={styles.base}>
            <View style={styles.badge}>
                {purchaseSource ? (
                    <BadgePurchasedStore store={purchaseSource} />
                ) : (
                    isOfficial && <BadgeOfficial />
                )}
                {original && <BadgeOriginal />}
            </View>
            {complexity > 0 && <BadgeComplexity complexity={complexity} />}
            {privacy != null && <BadgePrivacy privacy={privacy} />}
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        position: 'absolute',
        bottom: 8,
        left: 8,
        rowGap: 4,
    },

    badge: {
        flexDirection: 'row',
    },
})
