import { memo } from 'react'
import { ScrollView, StyleSheet, useWindowDimensions } from 'react-native'

import { layout, layoutHelpers } from '@mu-native/ds'

import type { TPurchaseSuccessBilling } from '../../hooks/usePurchaseSuccessPlan'

import { PurchaseSuccessPlanCardComponent } from './PurchaseSuccessPlanCardComponent'

const { getResponsiveSizeExtended } = layoutHelpers

const horizontalPadding = getResponsiveSizeExtended(20)
const cardGap = getResponsiveSizeExtended(12)
// the next card peeks out so it is clear the row scrolls
const cardWidthRatio = 0.85

const styles = StyleSheet.create({
    scroll: {
        // ScrollView grows by default and would take all free space of the column
        flexGrow: 0,
        marginHorizontal: -horizontalPadding,
        marginBottom: getResponsiveSizeExtended(24),
    },
    scrollContent: {
        paddingHorizontal: horizontalPadding,
        gap: cardGap,
    },
    card: {
        marginBottom: 0,
    },
})

type TPurchaseSuccessBillingsComponentProps = {
    billings: TPurchaseSuccessBilling[]
}

export const PurchaseSuccessBillingsComponent = memo(
    ({ billings }: TPurchaseSuccessBillingsComponentProps) => {
        const { width } = useWindowDimensions()

        if (billings.length <= 1) {
            return billings.map(billing => (
                <PurchaseSuccessPlanCardComponent
                    key={billing.key}
                    isTrial={billing.isTrial}
                    date={billing.date}
                    price={billing.price}
                />
            ))
        }

        const containerWidth =
            Math.min(width, layout.maxWidthTabletContainer) - horizontalPadding * 2
        const cardWidth = containerWidth * cardWidthRatio

        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={cardWidth + cardGap}
                snapToAlignment="start"
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
            >
                {billings.map(billing => (
                    <PurchaseSuccessPlanCardComponent
                        key={billing.key}
                        planTitle={billing.title}
                        isTrial={billing.isTrial}
                        date={billing.date}
                        price={billing.price}
                        style={[styles.card, { width: cardWidth }]}
                    />
                ))}
            </ScrollView>
        )
    },
)
