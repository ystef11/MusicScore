import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, IconSource, layout } from '@mu-native/ds'
import type { TFilterItem } from '@mu-native/search'

export type TInstrumentTile = {
    label: string
    icon: IconSource
    /** Catalog items the tile controls — a family can span several (e.g. saxophones). */
    itemIds: TFilterItem['id'][]
    isSelected: boolean
}

type TProps = {
    tiles: TInstrumentTile[]
    onToggle: (tile: TInstrumentTile) => void
}

export const InstrumentTilesGrid = ({ tiles, onToggle }: TProps) => (
    <View style={styles.grid}>
        {tiles.map(tile => {
            const contentColor = tile.isSelected
                ? brandColors.backgroundDefault
                : brandColors.contentPrimary
            return (
                <CommonTouchable
                    key={tile.label}
                    style={[styles.tile, tile.isSelected && styles.tileSelected]}
                    onPress={() => onToggle(tile)}
                >
                    <Icon source={tile.icon} size={24} tint={contentColor} />
                    <AppText
                        font="f15w500"
                        rawText={tile.label}
                        rawColor={contentColor}
                        numberOfLines={1}
                        textAlign="center"
                    />
                </CommonTouchable>
            )
        })}
    </View>
)

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.marginXs,
    },
    tile: {
        flexGrow: 1,
        flexBasis: '30%',
        height: 80,
        // Stadium shape per the design (rounded-100 on an 80px-tall tile).
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
        gap: layout.marginXs,
        backgroundColor: brandColors.backgroundInactive,
    },
    tileSelected: {
        backgroundColor: brandColors.contentPrimary,
    },
})
