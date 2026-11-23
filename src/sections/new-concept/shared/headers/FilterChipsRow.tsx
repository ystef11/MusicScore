import { ScrollView, StyleSheet, View } from 'react-native'

import { layout } from '@mu-native/ds'
import { filter as filterIcon } from '@mu-native/icons/filter'
import { translate } from '@mu-native/locale'

import { QuickFilterItemChip } from '../../../../App/Explore/ScreenExplore/components/quickFilters/QuickFilterItemChip'

export type TFilterChip = { key: string; label: string; isSelected?: boolean }

type TProps<T extends TFilterChip> = {
    chips: T[]
    onChipPress: (chip: T) => void
    // When set, renders the leading "Filters" chip with the filter icon.
    onOpenFilters?: () => void
    size?: 'small' | 'medium'
}

export const FilterChipsRow = <T extends TFilterChip>({
    chips,
    onChipPress,
    onOpenFilters,
    size = 'small',
}: TProps<T>) => (
    <View style={styles.container}>
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.scroll}
            contentContainerStyle={styles.chipsRow}
        >
            {!!onOpenFilters && (
                <QuickFilterItemChip
                    icon={filterIcon}
                    title={translate('native.new_concept.common.filters')}
                    onPress={onOpenFilters}
                    showCloseIcon={false}
                    size={size}
                />
            )}
            {chips.map(chip => (
                <QuickFilterItemChip
                    key={chip.key}
                    title={chip.label}
                    isSelected={chip.isSelected}
                    showCloseIcon={false}
                    onPress={() => onChipPress(chip)}
                    size={size}
                />
            ))}
        </ScrollView>
    </View>
)

const styles = StyleSheet.create({
    container: {
        marginBottom: layout.marginSm,
    },
    scroll: {
        flexGrow: 0,
    },
    chipsRow: {
        // gap 6 went through design QA; no layout token matches it exactly.
        gap: 6,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
})
