import { memo, useEffect, useLayoutEffect, useRef } from 'react'
import { Platform, StatusBar } from 'react-native'

import { RouteProp, useAppNavigation, useRoute } from '@mu-native/navigation'
import { PerformanceScreen, TrackedScreen } from '@mu-native/performance'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import { DownloadScoreSheet } from '../components/modals/DownloadModalComponent.tsx'
import { ScoreBuyModalContainer } from '../components/modals/scoreBuyModal/ScoreBuyModalComponent.tsx'
import { ScoreFeatureModal } from '../components/modals/scoreFeatureModal/ScoreFeatureModal.tsx'
import { ScorePremiumContainer } from '../components/modals/scorePremiumModal/ScorePremiumComponent.tsx'
import { GeneralSettingsSheet } from '../components/modals/scoreSettings/GeneralSettingsTab.tsx'
import { MetronomeSettingsSheet } from '../components/modals/scoreSettings/MetronomeSettingsTab.tsx'
import { MixerSettingsSheet } from '../components/modals/scoreSettings/MixerSheetView.tsx'
import { NoteSizeSheet } from '../components/modals/scoreSettings/NoteSizeSheet.tsx'
import { TempoSheet } from '../components/modals/scoreSettings/TempoSheet'
import { TransposeSheet } from '../components/modals/scoreSettings/TransposeSheet'
import { ScoreReader } from '../components/score/ScoreReader'
import { ScoreScreenComponent } from '../components/score/ScoreScreenComponent.tsx'
import { useCurrentScore } from '../hooks/useCurrentScore.ts'
import { useFetchScore } from '../hooks/useFetchScore.ts'
import { useInitScore } from '../hooks/useInitScore'
import useScoreViewerAnalytics from '../hooks/useScoreViewerAnalytics.ts'
import useScoreViewerInit from '../hooks/useScoreViewerInit.tsx'

type TRouteParams = {
    Score: {
        score: MSScoreT
    }
}

export const ScoreScreenContainer = memo(() => {
    const navigation = useAppNavigation()
    const route = useRoute<RouteProp<TRouteParams, 'Score'>>()
    const { score: initialScore } = route.params
    const lastUpdatedScore = useRef(initialScore)
    const currentScore = useCurrentScore()
    const score = currentScore && currentScore.id === initialScore.id ? currentScore : initialScore
    const useAndroidReader = Platform.OS === 'android' && !initialScore.isPdf
    const [isScoreLoaded, pageLayoutType, isReaderLayoutInitialized] = useValues([
        scoreStoreChunk.props.getIsSuccessLoading,
        scoreStoreChunk.props.getPageLayoutType,
        scoreStoreChunk.props.getHasInitializedAndroidReaderLayout,
    ])
    const actions = useActions({
        setCurrentScore: scoreStoreChunk.actions.setCurrentScore,
        setSettingsSheetIndex: scoreStoreChunk.actions.setSettingsSheetIndex,
        initializeAndroidReaderLayout: scoreStoreChunk.actions.initializeAndroidReaderLayout,
    })

    useLayoutEffect(() => {
        if (useAndroidReader && !isReaderLayoutInitialized) actions.initializeAndroidReaderLayout()
    }, [actions, isReaderLayoutInitialized, useAndroidReader])

    const readerOrientation = isReaderLayoutInitialized && pageLayoutType !== 'horizontal'
        ? 'landscape'
        : 'portrait'
    useInitScore(useAndroidReader ? readerOrientation : null)

    useEffect(() => {
        if (currentScore && currentScore.id === initialScore.id) {
            lastUpdatedScore.current = currentScore
        }
    }, [currentScore, initialScore.id])

    useEffect(() => {
        let skipFirst = true
        const focus = navigation.addListener('focus', () => {
            if (skipFirst) {
                skipFirst = false
                return
            }
            actions.setCurrentScore(lastUpdatedScore.current)
        })

        return () => {
            actions.setSettingsSheetIndex(0)
            focus()
        }
    }, [])

    useScoreViewerInit(initialScore)
    useScoreViewerAnalytics(initialScore)

    const { source } = useFetchScore(initialScore)

    return (
        <TrackedScreen
            screenName={PerformanceScreen.score}
            interactive={isScoreLoaded}
            // String: score ids overflow the Int32 of `params.value`, so they travel as str_value
            tags={{ score_entity_id: String(initialScore.id), score_source: source?.type }}
        >
            <StatusBar barStyle="dark-content" />
            {useAndroidReader ? (
                <ScoreReader score={score} source={source} />
            ) : (
                <ScoreScreenComponent source={source} />
            )}

            <DownloadScoreSheet
                score={score}
                viewerPath={source?.uri.endsWith('.webscore') ? source.uri : undefined}
            />
            <MixerSettingsSheet />
            <GeneralSettingsSheet
                isPDF={initialScore.isPdf}
                hideTransposition={useAndroidReader}
                showScoreActions={useAndroidReader}
            />
            <MetronomeSettingsSheet hideTempo={useAndroidReader} />
            <NoteSizeSheet />
            {useAndroidReader && <TempoSheet />}
            {useAndroidReader && <TransposeSheet />}

            <ScoreBuyModalContainer />
            <ScorePremiumContainer />
            <ScoreFeatureModal />
        </TrackedScreen>
    )
})
