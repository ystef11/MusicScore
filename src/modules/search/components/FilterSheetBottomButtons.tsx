import React from 'react'
import { StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { brandColors, FilterButton, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

interface Props {
    readonly onClear: () => void
    readonly onSearch: () => void
    readonly count?: number
    readonly isClearDisabled?: boolean
}

export const FilterSheetBottomButtons: React.FC<Props> = props => {
    return (
        <View style={styles.buttons}>
            <FilterButton
                testID={scoreTestIds.filtersClearButton}
                onPress={props.onClear}
                type="ternary"
                disabled={props.isClearDisabled}
                rawText={translate('native.ebook.filter_clear')}
            />
            <FilterButton
                testID={scoreTestIds.filtersApplyButton}
                onPress={props.onSearch}
                type="secondary"
                rawText={
                    props.count
                        ? translate('native.library.filter_show_button', {
                              count: props.count.toString(),
                          })
                        : translate('native.filter.actions.apply')
                }
            />
        </View>
    )
}

const styles = StyleSheet.create({
    buttons: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: staticSafeArea().bottomWithAndroid,
        paddingHorizontal: 20,
        columnGap: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: brandColors.strokeDefault,
        justifyContent: 'space-between',
    },
})
