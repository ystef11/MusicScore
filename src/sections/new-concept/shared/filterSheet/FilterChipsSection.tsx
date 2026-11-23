import { useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { FilterItemChip, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    FilterItemGroupContainer,
    localizeFilterOptionName,
    type TFilterItem,
    type TRenderFilterSection,
    type TSelectableFilterKey,
    type TSelectedFilters,
} from '@mu-native/search'

import { FilterExpanderToggle } from './FilterExpanderToggle'
import { FilterSheetSection } from './FilterSheetSection'

type TGroupSelection = { filterKey: TSelectableFilterKey; id: TFilterItem['id'] | null }

type TProps = {
    title: string
    section: TRenderFilterSection | undefined
    selectedFilters: TSelectedFilters | null
    onToggleItem: (filterKey: TSelectableFilterKey, itemId: TFilterItem['id']) => void
    onItemGroupPress: (selections: TGroupSelection[]) => void
    /** Renders a leading chip ("All ensembles") that clears the section. */
    allChipLabel?: string
    /** Chips shown while collapsed; the expander reveals the rest. */
    collapsedCount?: number
    /** Collapsed label of the expander, e.g. "All genres". */
    expanderLabel?: string
    /** Extra formatting for each option label (after localization), e.g. sentence-casing genres. */
    formatName?: (name: string) => string
}

// A filter section rendered as wrapping pill chips. Leaf items become chips;
// hierarchical groups (instrument families, ensemble types) are revealed by the
// expander as the existing disclosure rows with counts.
export const FilterChipsSection = ({
    title,
    section,
    selectedFilters,
    onToggleItem,
    onItemGroupPress,
    allChipLabel,
    collapsedCount,
    expanderLabel,
    formatName,
}: TProps) => {
    const [isExpanded, setIsExpanded] = useState(false)

    if (!section?.items?.length) return null

    const { filterKey } = section

    const labelOf = (name: string) => {
        const localized = localizeFilterOptionName(name, filterKey)
        return formatName ? formatName(localized) : localized
    }
    const leaves = section.items
        .filter(item => !item.children?.length)
        .sort((a, b) => b.count - a.count)
    const groups = section.items.filter(item => !!item.children?.length)

    const visibleLeaves = collapsedCount && !isExpanded ? leaves.slice(0, collapsedCount) : leaves
    const hasChipOverflow = !!collapsedCount && leaves.length > collapsedCount
    const hasExpander = hasChipOverflow || groups.length > 0

    const sectionSelection = selectedFilters?.[filterKey]
    const hasAnySelection =
        Object.values(sectionSelection ?? {}).some(Boolean) ||
        Object.values(selectedFilters?.[`${filterKey}_any[]` as TSelectableFilterKey] ?? {}).some(
            Boolean,
        )

    return (
        <FilterSheetSection title={title}>
            <View style={styles.chips}>
                {!!allChipLabel && (
                    <FilterItemChip
                        id="__all__"
                        name={allChipLabel}
                        count="1"
                        size="l"
                        selected={!hasAnySelection}
                        onPress={() => {
                            if (!hasAnySelection) return
                            onItemGroupPress([
                                { filterKey, id: null },
                                {
                                    filterKey: `${filterKey}_any[]` as TSelectableFilterKey,
                                    id: null,
                                },
                            ])
                        }}
                    />
                )}
                {visibleLeaves.map(item => (
                    <FilterItemChip
                        key={item.id}
                        id={item.id}
                        name={labelOf(item.name)}
                        count={String(item.count)}
                        size="l"
                        selected={!!sectionSelection?.[item.id]}
                        onPress={itemId =>
                            onToggleItem(item.overrideFilterKey ?? filterKey, itemId)
                        }
                    />
                ))}
            </View>
            {isExpanded &&
                groups.map(group => (
                    <FilterItemGroupContainer
                        key={`${group.name}_group`}
                        filterKey={filterKey}
                        filterItem={group}
                        onItemPress={onItemGroupPress}
                        nestingLevel={1}
                    />
                ))}
            {hasExpander && (
                <FilterExpanderToggle
                    label={expanderLabel ?? translate('native.ebook.filter_show_more')}
                    isExpanded={isExpanded}
                    onToggle={setIsExpanded}
                />
            )}
        </FilterSheetSection>
    )
}

const styles = StyleSheet.create({
    chips: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: layout.marginSm,
    },
})
