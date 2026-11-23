import { memo, useCallback } from 'react'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import { AlertNotifications, brandColors, layout, useAppSafeArea } from '@mu-native/ds'
import { useAppNavigation, useAppRoute, useRoute } from '@mu-native/navigation'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { scoreStoreChunk } from '@mu-native/score'
import { xtz } from '@mu-native/xtz'
import { useActions, useValues } from '@ug/store'

import { MSScoreT } from '../../../../../App/Model/MSScore'
import { ScoreBuyModalContainer } from '../components/modals/scoreBuyModal/ScoreBuyModalComponent'
import { ScoreFeatureModal } from '../components/modals/scoreFeatureModal/ScoreFeatureModal'
import { ScorePremiumContainer } from '../components/modals/scorePremiumModal/ScorePremiumComponent'
import { GeneralSettingsSheet } from '../components/modals/scoreSettings/GeneralSettingsTab'
import { MetronomeSettingsSheet } from '../components/modals/scoreSettings/MetronomeSettingsTab'
import { MixerSettingsSheet } from '../components/modals/scoreSettings/MixerSheetView'
import { NoteSizeSheet } from '../components/modals/scoreSettings/NoteSizeSheet'
import { TempoSheet } from '../components/modals/scoreSettings/TempoSheet'
import { TransposeSheet } from '../components/modals/scoreSettings/TransposeSheet'
import { PianoKeyboard } from '../components/piano/PianoKeyboard'
import ScoreLoadingPlaceholder from '../components/score/ScoreLoadingPlaceholder'
import { ScorePlayControls } from '../components/scorePlay/ScorePlayControls'
import { ScorePlayTopBar } from '../components/scorePlay/ScorePlayTopBar'
import { useFetchScore } from '../hooks/useFetchScore'
import { useInitScore } from '../hooks/useInitScore'
import useScoreViewerAnalytics from '../hooks/useScoreViewerAnalytics'
import useScoreViewerInit from '../hooks/useScoreViewerInit'

import { InteractiveScoreContainer } from './InteractiveScoreContainer'
import { PdfScoreViewerContainer } from './PdfScoreViewerContainer'
import { ScoreScreenContainer } from './ScoreScreenContainer'

/**
 * New "Score Play View" (MUP-13932) — a clean playing surface with no score
 * info. Opened from the Score Info screen "Play" action (experiment test group
 * only); the control group keeps the legacy {@link ScoreScreen}. Reuses the
 * renderer, piano keyboard and all bottom sheets; replaces the chrome with the
 * new top bar + control bar and drops the draggable details panel.
 */
const LegacyScorePlayScreen = memo(() => {
    const navigation = useAppNavigation()
    const route = useRoute<any>()
    const initialScore: MSScoreT = route.params.score

    const [
        isScoreLoaded,
        isKeyboardVisible,
        pageLayoutType,
        isBuyModalOpen,
        isPremiumModalOpen,
        isFeatureModalOpen,
    ] = useValues([
        scoreStoreChunk.props.getIsSuccessLoading,
        scoreStoreChunk.props.getIsKeyboardVisible,
        scoreStoreChunk.props.getPageLayoutType,
        scoreStoreChunk.props.getIsOpenBuyScoreModal,
        scoreStoreChunk.props.getIsOpenScorePremiumModal,
        scoreStoreChunk.props.getIsOpenScoreFeatureModal,
    ])

    // The display mode fixes the phone orientation. Portrait View stays upright,
    // while Vertical Scroll and Single Line use landscape.
    // While a monetization sheet (buy / premium / feature paywall) is open it is
    // always shown in portrait; closing it restores the display-mode orientation.
    const isMonetizationModalOpen = isBuyModalOpen || isPremiumModalOpen || isFeatureModalOpen
    const displayModeOrientation = pageLayoutType === 'horizontal' ? 'portrait' : 'landscape'
    useInitScore(isMonetizationModalOpen ? 'portrait' : displayModeOrientation)
    const actions = useActions({ setIsFullScreen: scoreStoreChunk.actions.setIsFullScreen })
    const insets = useAppSafeArea()
    const isLandscape = platform.isTablet || pageLayoutType !== 'horizontal'

    useScoreViewerInit(initialScore)
    useScoreViewerAnalytics(initialScore)
    const { source } = useFetchScore(initialScore)

    const onClose = useCallback(() => {
        xtz.stop()
        actions.setIsFullScreen(false)
        navigation.goBack()
    }, [actions, navigation])

    return (
        // Deliberately the same event as the control-group ScoreScreen: the `screen` column
        // (ScoreMain / ScorePlay) tells the two paths apart.
        <TrackedScreen
            screenName={PerformanceScreen.score}
            interactive={isScoreLoaded}
            tags={{ score_entity_id: String(initialScore.id), score_source: source?.type }}
        >
            <View
                style={[
                    styles.root,
                    // In landscape drop the side safe-area insets so the top/bottom
                    // control bars can span edge-to-edge (they add their own 16pt).
                    !isLandscape && { paddingLeft: insets.left, paddingRight: insets.right },
                ]}
            >
                <StatusBar barStyle="dark-content" />
                <ScorePlayTopBar onClose={onClose} isLandscape={isLandscape} />

                <View
                    style={[
                        styles.scoreArea,
                        // Only header/footer go edge-to-edge; keep the score out of the safe area.
                        isLandscape && { paddingLeft: insets.left, paddingRight: insets.right },
                    ]}
                >
                    {source?.type === 'pdf' && <PdfScoreViewerContainer source={source} />}
                    {source?.type === 'interactive' && (
                        <InteractiveScoreContainer source={source} resetCameraOnLoad />
                    )}
                    <ScoreLoadingPlaceholder isLoading={!isScoreLoaded} />
                </View>

                {isKeyboardVisible && <PianoKeyboard place="onTopOfSheet" />}
                <ScorePlayControls />

                <GeneralSettingsSheet
                    isPDF={initialScore.isPdf}
                    hideTransposition
                    hideKeyboard
                    showScoreActions
                    maxWidth={layout.maxSheetWidthCompact}
                    centerOnTablet
                />
                <MetronomeSettingsSheet
                    hideTempo
                    maxWidth={layout.maxSheetWidthCompact}
                    centerOnTablet
                />
                <TempoSheet maxWidth={layout.maxSheetWidthCompact} centerOnTablet />
                <MixerSettingsSheet maxWidth={layout.maxSheetWidthCompact} centerOnTablet />
                <NoteSizeSheet maxWidth={layout.maxSheetWidthCompact} centerOnTablet />
                <TransposeSheet maxWidth={layout.maxSheetWidthCompact} centerOnTablet />
                <ScoreBuyModalContainer />
                <ScorePremiumContainer />
                <ScoreFeatureModal />

                {/* Screen-local toast host: all toasts pinned to the safe-area bottom. */}
                <AlertNotifications fixedMargin={0} />
            </View>
        </TrackedScreen>
    )
})
LegacyScorePlayScreen.displayName = 'LegacyScorePlayScreen'

export const ScorePlayScreen = memo(() => {
    const { score } = useAppRoute<{ score: MSScoreT }>()
    return Platform.OS === 'android' && !score.isPdf
        ? <ScoreScreenContainer />
        : <LegacyScorePlayScreen />
})
ScorePlayScreen.displayName = 'ScorePlayScreen'

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    scoreArea: {
        flex: 1,
    },
})
