import React, { memo, type ReactNode, useEffect, useMemo } from 'react'
import { Keyboard, LayoutChangeEvent, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { AppText, brandColors, CommonTouchable, layout, NavigationIconButton } from '@mu-native/ds'
import { filter as filterIcon } from '@mu-native/icons/filter'
import { translate } from '@mu-native/locale'
import { BannerSaleComponent } from '@mu-native/marketing'
import { ModuleKey, SearchInputContainer, searchStoreChunk } from '@mu-native/search'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'

import { searchInputPlaceholdersMap } from './navHeaderSearchBarConst.ts'

type TFiltersIconButtonProps = {
    filtersApplied?: number
    showButtonBadge: boolean
    onPress: () => void
    testID?: string
}

type TNavHeaderSearchBarProps = {
    moduleKey: ModuleKey
    searchTerm: string
    isFilterWasOpen?: boolean
    filtersApplied?: number
    onChangeText: (text: string) => void
    onSearchFocus?: () => void
    onSearchBlur?: () => void
    onSubmitEditing?: () => void
    openFilterScreen?: () => void
    clearInputValue: () => void
    trailingButton?: ReactNode
    testID?: string
    style?: StyleProp<ViewStyle>
    isSearching?: boolean
    onLayout?: (e: LayoutChangeEvent) => void
    onEndEditing?: () => void
    endSearchComponent?: React.ReactElement
}

const FiltersIconButton = ({
    testID,
    onPress,
    filtersApplied,
    showButtonBadge,
}: TFiltersIconButtonProps) => {
    return (
        <View>
            <NavigationIconButton
                testID={testID}
                icon={filterIcon}
                onPress={onPress}
                showBadge={!!filtersApplied || showButtonBadge}
            />
        </View>
    )
}

const CancelButton = ({ testID }: { testID: string }) => {
    return (
        <CommonTouchable onPress={Keyboard.dismiss} testID={testID}>
            <AppText
                rawText={translate('native.search.cancel_button')}
                brandColor="actionsControlDefault"
                style={styles.cancel}
            />
        </CommonTouchable>
    )
}

const NavHeaderSearchBar = ({
    searchTerm,
    onChangeText,
    clearInputValue,
    filtersApplied,
    openFilterScreen,
    onSearchFocus,
    onSearchBlur,
    onSubmitEditing,
    onEndEditing,
    trailingButton,
    testID,
    isFilterWasOpen,
    moduleKey,
    style,
    isSearching,
    onLayout,
    endSearchComponent,
}: TNavHeaderSearchBarProps) => {
    useEffect(() => {
        if (!isFilterWasOpen) {
            reportEvent(MetricaEvents.SEARCH_BADGE_SHOW, { type: 'official' })
        }
    }, [])
    const [isFocused] = useValues([searchStoreChunk.props.getIsSearchInputFocused])

    const needShowFilter = !!openFilterScreen

    const filtersIcon = useMemo(() => {
        if (!needShowFilter) return null
        return (
            <FiltersIconButton
                testID={testID && `${testID} filter`}
                onPress={openFilterScreen}
                filtersApplied={filtersApplied}
                showButtonBadge={!isFilterWasOpen}
            />
        )
    }, [needShowFilter, testID, openFilterScreen, filtersApplied, isFilterWasOpen])

    const placeholder = searchInputPlaceholdersMap[moduleKey]?.()

    const shouldShowCancel = isFocused

    return (
        <View onLayout={onLayout}>
            <BannerSaleComponent />
            <View style={style ? [styles.searchBarContainer, style] : styles.searchBarContainer}>
                <SearchInputContainer
                    testID={testID}
                    searchTerm={searchTerm}
                    placeholder={placeholder}
                    isSearching={isSearching}
                    onSearchFocus={onSearchFocus}
                    onSearchBlur={onSearchBlur}
                    onSubmitEditing={onSubmitEditing}
                    onChangeText={onChangeText}
                    clearInputValue={clearInputValue}
                    trailingButton={trailingButton}
                    onEndEditing={onEndEditing}
                />
                {shouldShowCancel && <CancelButton testID="Search Input Cancel Button" />}
                {!shouldShowCancel && filtersIcon}
                {endSearchComponent}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    searchBarContainer: {
        paddingTop: 23,
        paddingBottom: 12,
        backgroundColor: brandColors.backgroundDefault,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
        justifyContent: 'space-between',
        marginHorizontal: layout.baseMarginFromEdges,
    },

    cancel: {
        textDecorationLine: 'underline',
    },
})

export default memo(NavHeaderSearchBar)
