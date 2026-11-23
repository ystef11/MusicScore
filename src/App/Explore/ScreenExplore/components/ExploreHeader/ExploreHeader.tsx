import { memo, useCallback, useEffect, useRef, useState } from 'react'
import {
    LayoutChangeEvent,
    StyleSheet,
    useWindowDimensions,
    View,
    type ViewInstance,
} from 'react-native'
import { LaunchArguments } from 'react-native-launch-arguments'
import { PopoverMode } from 'react-native-popover-view'

import { searchTestIds, shazamTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { type NativeBottomSheetRef, PopoverPlacement, Tooltip } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation, useIsFocused } from '@mu-native/navigation'
import { getAllSelectedFiltersQuantity, searchStoreChunk } from '@mu-native/search'
import {
    isShazamSupported,
    ShazamBriefingSheet,
    ShazamSearchButton,
    shazamStoreChunk,
} from '@mu-native/shazam'
import { useActions, useValues } from '@ug/store'

import { useScoreFiltersExp } from '../../../../../modules/ab/experiments/scoreFiltersExp.ts'
import MetricaEvents from '../../../../constants/MetricaEvents.ts'
import reportEvent from '../../../../Utils/Analytics.ts'
import NavHeaderSearchBar from '../../../../Components/NavHeader/headerSearchBar/NavHeaderSearchBar'
import { exploreScoreListStoreChunk } from '../../../exploreScoreListStoreChunk.ts'
import { useSearchInput } from '../../hooks/useSearchInput'

import { HeaderGiftButton } from './HeaderGiftButton.tsx'

type Props = {
    onOpenFiltersPress: () => void
}

// The tooltip popover backdrop spans the whole window and intercepts taps,
// which breaks e2e runs — autotests disable it via launch args.
const isDisableMarketingTooltips = LaunchArguments.value<{ disableMarketingTooltips: boolean }>()
    ?.disableMarketingTooltips

export const ExploreHeader = memo(({ onOpenFiltersPress }: Props) => {
    const exp = useScoreFiltersExp()
    const navigation = useAppNavigation()
    const briefingSheetRef = useRef<NativeBottomSheetRef>(null)
    const shazamButtonRef = useRef<ViewInstance>(null)
    const {
        searchTerm,
        onSearchFocus,
        onSearchBlur,
        onChangeText,
        onCancelSearch,
        onSubmitEditing,
    } = useSearchInput({
        scoreListChunk: exploreScoreListStoreChunk,
    })

    const [filtersApplied, hasUsedShazam, isAuthModalVisible] = useValues([
        getAllSelectedFiltersQuantity,
        shazamStoreChunk.props.getHasUsedShazam,
        authStoreChunk.props.getIsVisible,
    ])
    const actions = useActions({
        setHeaderHeight: searchStoreChunk.actions.setHeaderHeight,
        markShazamUsed: shazamStoreChunk.actions.markUsed,
    })

    const onLayout = useCallback((e: LayoutChangeEvent) => {
        actions.setHeaderHeight(e.nativeEvent.layout.height)
    }, [])

    const onPermissionGranted = useCallback(() => {
        navigation.push(Screen.shazamResults)
    }, [navigation])

    const onShazamPress = useCallback(() => {
        reportEvent(MetricaEvents.SHAZAM_ENTRY_CLICK)
        briefingSheetRef.current?.present()
    }, [])

    const { height: windowHeight } = useWindowDimensions()

    const deviceSupportsShazam = isShazamSupported()

    useEffect(() => {
        if (!deviceSupportsShazam) return
        reportEvent(MetricaEvents.SHAZAM_ENTRY_VIEW)
    }, [deviceSupportsShazam])

    // The tooltip popover renders above the whole window (including the auth modal
    // and screens pushed over the Explore tab) and its backdrop intercepts touches,
    // so it must only be shown while Explore is focused and no auth modal is open.
    const isFocused = useIsFocused()
    const showTooltip =
        !isDisableMarketingTooltips &&
        isFocused &&
        !isAuthModalVisible &&
        deviceSupportsShazam &&
        !hasUsedShazam &&
        !searchTerm
    const [tooltipVisible, setTooltipVisible] = useState(true)

    const onTooltipClose = useCallback(() => {
        setTooltipVisible(false)
    }, [])
    const onTooltipCloseComplete = useCallback(() => {
        actions.markShazamUsed()
    }, [actions])

    const shazamButton = deviceSupportsShazam ? (
        <ShazamSearchButton
            ref={shazamButtonRef}
            onPress={onShazamPress}
            testID={shazamTestIds.searchButton.explore}
        />
    ) : undefined

    return (
        <View>
            <NavHeaderSearchBar
                testID={searchTestIds.searchInput.scores}
                searchTerm={searchTerm}
                onChangeText={onChangeText}
                onSearchFocus={onSearchFocus}
                onSearchBlur={onSearchBlur}
                clearInputValue={onCancelSearch}
                trailingButton={shazamButton}
                openFilterScreen={exp === 'A' ? onOpenFiltersPress : undefined}
                moduleKey="browse"
                onSubmitEditing={onSubmitEditing}
                filtersApplied={filtersApplied}
                onLayout={onLayout}
                endSearchComponent={exp === 'C' ? <HeaderGiftButton /> : undefined}
            />
            {showTooltip && (
                // In JS_MODAL mode the popover renders its overlay inline, filling this
                // wrapper. A full-screen-height, touch-transparent wrapper gives the popover
                // a correct display area to position within — otherwise it collapses to the
                // header strip and the tooltip detaches from the button (Android).
                <View
                    pointerEvents="box-none"
                    style={[styles.tooltipOverlay, { height: windowHeight }]}
                >
                    <Tooltip
                        visible={tooltipVisible}
                        mode={PopoverMode.JS_MODAL}
                        anchor={shazamButtonRef}
                        placement={PopoverPlacement.BOTTOM}
                        body={translate('native.shazam.tooltip_identify_music')}
                        hideCloseButton
                        onClose={onTooltipClose}
                        onRequestClose={onTooltipClose}
                        onCloseComplete={onTooltipCloseComplete}
                    />
                </View>
            )}
            <ShazamBriefingSheet ref={briefingSheetRef} onPermissionGranted={onPermissionGranted} />
        </View>
    )
})

const styles = StyleSheet.create({
    tooltipOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
    },
})
