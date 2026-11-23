import { memo, useCallback, useState } from 'react'
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import { AlertNotifications, AppText, brandColors, layout, staticSafeArea } from '@mu-native/ds'
import { useAppNavigation, useFocusEffect, useRoute } from '@mu-native/navigation'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreThunks, useOpenScorePlay } from '@mu-native/score'
import { useActions } from '@ug/store'

import { isScoreFromCatalog, MSScoreT } from '../../../../../App/Model/MSScore'
import reportEvent from '../../../../../App/Utils/Analytics'
import { DownloadScoreSheet } from '../components/modals/DownloadModalComponent'
import { ScoreBuyModalContainer } from '../components/modals/scoreBuyModal/ScoreBuyModalComponent'
import { ScoreFeatureModal } from '../components/modals/scoreFeatureModal/ScoreFeatureModal'
import { ScorePremiumContainer } from '../components/modals/scorePremiumModal/ScorePremiumComponent'
import { ScoreDescription } from '../components/scoreDetails/ScoreDescription'
import { ScoreDetailHighlightComment } from '../components/scoreDetails/ScoreDetailHighlightComment'
import { ScoreDetailUploaderProfileDetails } from '../components/scoreDetails/ScoreDetailUploaderProfileDetails'
import { useScoreInfoPreviewXtz } from '../components/scoreInfo/pagesPreview/useScoreInfoPreviewXtz'
import { ScoreInfoActions } from '../components/scoreInfo/ScoreInfoActions'
import { ScoreInfoMoreLikeThis } from '../components/scoreInfo/ScoreInfoMoreLikeThis'
import { ScoreInfoPdfExporter } from '../components/scoreInfo/ScoreInfoPdfExporter'
import { ScoreInfoPreview } from '../components/scoreInfo/ScoreInfoPreview'
import { ScoreInfoTopBar } from '../components/scoreInfo/ScoreInfoTopBar'
import { getScoreMetaEvent } from '../helpers/scoreHelpers'
import { useCurrentScore } from '../hooks/useCurrentScore'

/**
 * Intermediate "Score Info" screen (MUP-13932). Opened when a score is tapped
 * anywhere in the app (experiment test group). Shows the score's metadata and
 * social info; the score player is launched only via the "Play" action.
 */
export const ScoreInfoScreen = memo(() => {
    const navigation = useAppNavigation()
    const route = useRoute<any>()
    const initialScore: MSScoreT = route.params.score
    const currentScore = useCurrentScore()
    const score = currentScore?.id === initialScore.id ? currentScore : initialScore

    const actions = useActions({ openScoreInfo: scoreThunks.openScoreInfo })
    const { isXtzActive, releaseXtz } = useScoreInfoPreviewXtz()
    const openScorePlay = useOpenScorePlay()
    // Held while the preview owns a horizontal drag — see `onPagingChange`.
    const [isPaging, setIsPaging] = useState(false)
    // The preview downloads and renders the score file, so it is what the user waits for.
    // PDFs and country-blocked scores have no preview and wait for the score info instead.
    // Latched: the engine unloads when Score Play takes it over, and that is not a regression.
    const [isPreviewLoaded, setIsPreviewLoaded] = useState(false)
    const [isInfoLoaded, setIsInfoLoaded] = useState(false)
    const handlePreviewLoadedChange = useCallback((isLoaded: boolean) => {
        if (isLoaded) setIsPreviewLoaded(true)
    }, [])
    const hasPagesPreview = !score.isPdf && !score.score_blocked_by_country

    // Re-open on every focus: leaving Score Play resets the score store, so the
    // screen must re-establish currentScore to stay reactive (e.g. favorite heart).
    useFocusEffect(
        useCallback(() => {
            ;(async () => {
                await actions.openScoreInfo(initialScore)
                setIsInfoLoaded(true)
            })()
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [initialScore.id]),
    )

    const onPlay = useCallback(() => {
        reportEvent(RT_EVENTS.TEMP_SCORE_PLAY_BUTTON_CLICK, getScoreMetaEvent(score))
        // Only one XtzView may be attached at a time: let the preview detach in
        // this commit, then push Score Play so it can attach its own.
        releaseXtz()
        requestAnimationFrame(() => openScorePlay(score))
    }, [openScorePlay, releaseXtz, score])

    const isFromCatalog = isScoreFromCatalog(score)
    const { isTablet } = platform

    const artist = !!score.artistName && (
        <AppText
            font="f15w400"
            brandColor="contentSecondary"
            rawText={score.artistName}
            textAlign={isTablet ? 'left' : 'center'}
            testID={scoreTestIds.scoreDetailsArtistName}
        />
    )

    const title = (
        <AppText
            font="f44w400Accent"
            rawText={score.title}
            lineHeight={undefined}
            textAlign={isTablet ? 'left' : 'center'}
            testID={scoreTestIds.scoreDetailsTitle}
        />
    )

    // Tablet (MUP-13932): horizontal header — preview on the left, title /
    // metadata / description / actions stacked in a column on the right. Phone
    // keeps the vertical, centered layout.
    const header = isTablet ? (
        <View style={styles.tabletHeader}>
            <ScoreInfoPreview
                score={score}
                isXtzActive={isXtzActive}
                onPagingChange={setIsPaging}
                onLoadedChange={handlePreviewLoadedChange}
            />
            <View style={styles.tabletColumn}>
                {title}
                {artist}
                {isFromCatalog && <ScoreDescription score={score} />}
                <ScoreInfoActions score={score} onPlay={onPlay} inColumn />
            </View>
        </View>
    ) : (
        <>
            <ScoreInfoPreview
                score={score}
                isXtzActive={isXtzActive}
                onPagingChange={setIsPaging}
                onLoadedChange={handlePreviewLoadedChange}
            />
            <View style={styles.header}>
                {title}
                {artist}
            </View>
            <ScoreInfoActions score={score} onPlay={onPlay} />
        </>
    )

    return (
        <TrackedScreen
            screenName={PerformanceScreen.scoreInfo}
            interactive={hasPagesPreview ? isPreviewLoaded : isInfoLoaded}
            tags={{
                score_entity_id: String(initialScore.id),
                score_preview: hasPagesPreview ? 'xtz' : 'image',
            }}
        >
            <View style={styles.root}>
                <StatusBar barStyle="dark-content" />
                <ScoreInfoTopBar score={score} goBack={navigation.goBack} />
                <ScrollView
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                    // iOS doesn't block an ancestor ScrollView for a descendant JS
                    // responder, so the preview has to tell us to stand down for the
                    // length of a page swipe — otherwise the screen drifts under it
                    // (MUP-14066). directionalLockEnabled covers the points before
                    // the swipe is recognised.
                    directionalLockEnabled
                    scrollEnabled={!isPaging}
                >
                    {header}

                    {isFromCatalog && (
                        <>
                            <View style={styles.section}>
                                {!isTablet && <ScoreDescription score={score} />}
                                <ScoreDetailHighlightComment score={score} />
                                <View style={styles.divider} />
                                <ScoreDetailUploaderProfileDetails score={score} />
                            </View>
                            <ScoreInfoMoreLikeThis scoreId={score.id} />
                        </>
                    )}
                </ScrollView>

                <DownloadScoreSheet score={score} offscreenExport />
                <ScoreInfoPdfExporter />
                <ScoreBuyModalContainer />
                <ScorePremiumContainer />
                <ScoreFeatureModal />

                {/* Screen-local toast host: all toasts pinned to the safe-area bottom. */}
                <AlertNotifications fixedMargin={0} />
            </View>
        </TrackedScreen>
    )
})
ScoreInfoScreen.displayName = 'ScoreInfoScreen'

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    content: {
        paddingBottom: staticSafeArea().bottom + 24,
    },
    section: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 28,
    },
    header: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 28,
        alignItems: 'center',
    },
    tabletHeader: {
        flexDirection: 'row',
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 16,
        columnGap: 24,
    },
    tabletColumn: {
        flex: 1,
        rowGap: 12,
    },
    divider: {
        height: 20,
    },
})
