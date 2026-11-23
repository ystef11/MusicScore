import { StyleSheet, View } from 'react-native'

import { AppText, FloatingMenuButton, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type TProps<Id extends string> = {
    countText: string
    // When provided, renders a FloatingMenuButton ("label ▾" trigger opening the
    // "Sorting options" popover). Omit to render the count only.
    sortOptions?: { id: Id; label: string }[]
    selectedSortId?: Id
    onSelectSort?: (id: Id) => void
    sortMenuTestID?: string
}

export const ResultsCountRow = <Id extends string>({
    countText,
    sortOptions,
    selectedSortId,
    onSelectSort,
    sortMenuTestID,
}: TProps<Id>) => (
    <View style={styles.countRow}>
        <AppText font="f15w400" brandColor="contentSecondary" rawText={countText} />
        {!!sortOptions && !!onSelectSort && (
            <FloatingMenuButton
                title={translate('native.new_concept.common.sorting_options')}
                options={sortOptions}
                selectedId={selectedSortId}
                onSelect={onSelectSort}
                testID={sortMenuTestID}
            />
        )}
    </View>
)

const styles = StyleSheet.create({
    countRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingVertical: layout.marginSm,
    },
})
