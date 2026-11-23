import React from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, FilterInput, globalStyles, layout, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { useFilterSelections } from '../../contexts/FilterSelectionsContext'

type Props = {
    onSelectFilter?: () => void
    isLoading?: boolean
}

const FilterInstrumentsCount = ({ onSelectFilter, isLoading }: Props) => {
    const source = useFilterSelections()
    const [selectedFilters] = useValues([source.getSelectedFilters])

    const actions = useActions({
        setSelectedFilters: source.setSelectedFilter,
    })

    const handleChangeText = (key: string, value: string) => {
        actions.setSelectedFilters({ filterKey: 'parts', itemId: key, value })
        if (onSelectFilter) {
            onSelectFilter()
        }
    }

    return (
        <View style={[styles.container, isLoading && styles.loadingState]}>
            <AppText
                style={globalStyles.flex1}
                rawText={translate('native.filter_screen.instrument_count')}
                font="f17w500"
                brandColor="contentPrimary"
            />
            <View style={styles.rowContainer}>
                <FilterInput
                    testID="Explore filter instrument count from"
                    placeholder={translate('native.filter_screen.instrument_count_from')}
                    onChangeText={(value: string) => handleChangeText('partsMin', value)}
                    value={(selectedFilters?.parts?.partsMin as string) || ''}
                />
                <FilterInput
                    testID="Explore filter instrument count to"
                    placeholder={translate('native.filter_screen.instrument_count_to')}
                    onChangeText={(value: string) => handleChangeText('partsMax', value)}
                    value={(selectedFilters?.parts?.partsMax as string) || ''}
                />
            </View>
        </View>
    )
}

export const styles = StyleSheet.create({
    container: style.view({
        marginVertical: layout.marginSm,
        rowGap: 20,
    }),
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        columnGap: 12,
    },
    loadingState: {
        opacity: 0.7,
    },
})

export default React.memo(FilterInstrumentsCount)
