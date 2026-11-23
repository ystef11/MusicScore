import { memo, useCallback, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useExperimentVariation } from '@mu-native/ab'
import {
    AppText,
    brandColors,
    globalStyles,
    layout,
    MuseButton,
    SearchField,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { firstSessionFlowExperimentId } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'

import MetricaEvents from '../../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../../App/Utils/Analytics.ts'

import { ScoresListContainer } from './containers/ScoresListContainer.tsx'
import { useTourInstrumentScores } from './hooks/useTourInstrumentScores.ts'

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    sideMargins: {
        marginHorizontal: layout.baseMarginFromEdges,
        ...globalStyles.mb16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
    },
    headerTitle: {
        flex: 1,
    },
})

export const ScoresAfterTourScreen = memo(() => {
    const { goBack } = useAppNavigation()
    const insets = useAppSafeArea()
    const [searchTerm, setSearchTerm] = useState('')

    const { scores, isLoading } = useTourInstrumentScores(searchTerm, goBack)

    const variation = useExperimentVariation(firstSessionFlowExperimentId)

    const onClose = useCallback(goBack, [])

    const onSkip = useCallback(() => {
        reportEvent(MetricaEvents.SCORES_AFTER_TOUR_MODAL_SKIP)
        goBack()
    }, [])

    const onClearSearch = useCallback(() => setSearchTerm(''), [])

    const isSearching = !!searchTerm.trim()
    const isEmptyResult = !isLoading && scores.length === 0

    const isShowSkip = variation === 3 || (variation === 2 && isEmptyResult)

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            <View style={[styles.header, styles.sideMargins]}>
                <AppText
                    adaptiveSize
                    rawText={translate('native.scores_after_tour.title')}
                    font="f44w400Accent"
                    style={styles.headerTitle}
                />
                {isShowSkip && (
                    <MuseButton
                        type="tertiaryDefault"
                        title={translate('native.score_action_sheet.cancel')}
                        onPress={onSkip}
                        style={globalStyles.pt8}
                    />
                )}
            </View>
            <SearchField
                value={searchTerm}
                placeholder={translate('native.search.placeholder_scores')}
                onChangeText={setSearchTerm}
                onClear={onClearSearch}
                style={styles.sideMargins}
            />
            {!isSearching && (
                <AppText
                    adaptiveSize
                    rawText={translate('native.scores_after_tour.recommendations')}
                    font="f20w600"
                    style={styles.sideMargins}
                />
            )}
            <ScoresListContainer
                onClose={onClose}
                searchTerm={searchTerm}
                scores={scores}
                isLoading={isLoading}
            />
        </View>
    )
})
