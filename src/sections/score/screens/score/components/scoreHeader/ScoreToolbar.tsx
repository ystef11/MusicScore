import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View, type ViewInstance, ViewStyle } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import {
    usePdfAnnotationsFeatureFlag,
    usePracticeModeFeatureFlag,
    useRegisterPdfAnnotationsExp,
} from '@mu-native/ab'
import { brandColors, FloatButton, FloatButtonSize, nativePresentFittedSheet } from '@mu-native/ds'
import { annotation } from '@mu-native/icons/annotation'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { chevronUp } from '@mu-native/icons/chevronUp'
import { metronome } from '@mu-native/icons/metronome'
import { mixer } from '@mu-native/icons/mixer'
import { settings } from '@mu-native/icons/settings'
import { sparkles } from '@mu-native/icons/sparkles'
import { zoomIn } from '@mu-native/icons/zoomIn'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'
import { quizHelpers } from '@mu-native/quiz'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { scoreStoreChunk } from '@mu-native/score'
import { useValues } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../helpers/scoreHelpers.ts'
import { useAutoGradeLogic } from '../../hooks/useAutoGradeLogic.ts'
import { useCurrentScore } from '../../hooks/useCurrentScore'
import {
    TOOLBAR_SURFACE_RADIUS,
    useFirstSessionOnboarding,
} from '../onboarding/useFirstSessionOnboarding'

const ANIMATION_DURATION = 300
const fadeIn = FadeIn.duration(ANIMATION_DURATION)

export const ScoreToolbar = memo(
    ({ paddingTop, size = 'large' }: { size?: FloatButtonSize; paddingTop: number }) => {
        const [isExpandedByUser, setExpanded] = useState(false)
        const toolbarRef = useRef<ViewInstance>(null)
        const { step: firstSessionStep, isActive: isFirstSessionOnboarding } =
            useFirstSessionOnboarding()

        const isFirstSessionSpotlight = isFirstSessionOnboarding && firstSessionStep === 0
        const isExpanded = isExpandedByUser || isFirstSessionSpotlight

        const score = useCurrentScore()
        const isInteractiveScore = !score?.isPdf
        const { navigate } = useAppNavigation()
        const [scoreUri] = useValues([scoreStoreChunk.props.getScoreUri])
        const { onNavigateAutoGradeScreen, isAutoGradeRights } = useAutoGradeLogic()
        const zoomButtonRef = useRef<ViewInstance>(null)

        const isPracticeModeAvailable = usePracticeModeFeatureFlag() || isAutoGradeRights
        const autogradeButtonRef = useRef<ViewInstance | null>(null)

        const isPdfAnnotationsEligible = !!score?.isAnnotationsAllowed && !!score?.isPdf
        useRegisterPdfAnnotationsExp(isPdfAnnotationsEligible)
        const isPdfAnnotationsEnabled = usePdfAnnotationsFeatureFlag()

        useEffect(() => {
            if (isPracticeModeAvailable && isInteractiveScore) {
                reportEvent(
                    RT_EVENTS.SCORE_AUTOGRADE_SHOW,
                    quizHelpers.getUserInstrumentsFromTour(),
                )
            }
        }, [isPracticeModeAvailable, isInteractiveScore])

        const onOpenMixerSettings = useCallback(() => {
            reportEvent(RT_EVENTS.TEMP_SCORE_MIXER_BUTTON_CLICK, getScoreMetaEvent(score))
            nativePresentFittedSheet('mixerSheet')
        }, [score])

        const onDrawOpen = useCallback(() => {
            reportEvent(RT_EVENTS.TEMP_SCORE_DRAW_BUTTON_CLICK, getScoreMetaEvent(score))
            navigate('PdfDrawingScreen', { uri: scoreUri, score })
        }, [score])

        const onOpenSettings = useCallback(() => {
            nativePresentFittedSheet('scoreSettingsSheet')
            reportEvent(RT_EVENTS.SCORE_SETTINGS_CLICK, getScoreMetaEvent(score))
        }, [score])

        const onOpenMetronome = useCallback(() => {
            reportEvent(RT_EVENTS.TEMP_SCORE_METRONOME_BUTTON_CLICK, getScoreMetaEvent(score))
            nativePresentFittedSheet('metronomeSheet')
        }, [score])

        const onZoomPress = useCallback(() => {
            reportEvent(RT_EVENTS.SCORE_ZOOM_CLICK, getScoreMetaEvent(score))
            nativePresentFittedSheet('zoomSheet')
        }, [score])

        const toggleExpanded = useCallback(() => {
            setExpanded(prevExpanded => {
                reportEvent(
                    prevExpanded
                        ? RT_EVENTS.TEMP_SCORE_EXPAND_CLOSE_BUTTON_CLICK
                        : RT_EVENTS.TEMP_SCORE_EXPAND_BUTTON_CLICK,
                    getScoreMetaEvent(score),
                )

                return !prevExpanded
            })
        }, [score])

        const baseStyle: ViewStyle = {
            top: paddingTop,
        }

        return (
            <Animated.View
                ref={toolbarRef}
                style={[baseStyle, styles.base, isFirstSessionSpotlight && styles.spotlightSurface]}
            >
                {isInteractiveScore && (
                    <>
                        <View ref={zoomButtonRef} collapsable={false}>
                            <FloatButton
                                endIcon={zoomIn}
                                onPress={onZoomPress}
                                title={
                                    isExpanded ? translate('native.score.settings.zoom') : undefined
                                }
                                size={size}
                            />
                        </View>

                    </>
                )}
                {isPracticeModeAvailable && isInteractiveScore && (
                    <View ref={autogradeButtonRef} collapsable={false}>
                        <FloatButton
                            endIcon={sparkles}
                            onPress={onNavigateAutoGradeScreen}
                            title={
                                isExpanded
                                    ? translate('native.score.settings.practice_mode')
                                    : undefined
                            }
                            size={size}
                        />
                    </View>
                )}
                <FloatButton
                    endIcon={settings}
                    onPress={onOpenSettings}
                    title={isExpanded ? translate('native.score.settings.settings') : undefined}
                    size={size}
                    testID={scoreTestIds.scoreSettingsButton}
                />
                {!!score?.isAnnotationsAllowed && isPdfAnnotationsEnabled && (
                    <FloatButton endIcon={annotation} onPress={onDrawOpen} size={size} />
                )}
                {isExpanded && !score?.isPdf && (
                    <Animated.View entering={fadeIn}>
                        <FloatButton
                            endIcon={mixer}
                            onPress={onOpenMixerSettings}
                            title={translate('native.screens_titles.mixer_screen')}
                            size={size}
                            testID={scoreTestIds.scoreToolbarMixerButton}
                        />
                    </Animated.View>
                )}
                {isExpanded && !score?.isPdf && (
                    <Animated.View entering={fadeIn}>
                        <FloatButton
                            endIcon={metronome}
                            onPress={onOpenMetronome}
                            title={translate('native.key_words.metronome')}
                            size={size}
                            testID={scoreTestIds.scoreToolbarMetronomeButton}
                        />
                    </Animated.View>
                )}
                {!score?.isPdf && (
                    <FloatButton
                        endIcon={isExpanded ? chevronUp : chevronDown}
                        onPress={toggleExpanded}
                        title={isExpanded ? translate('native.actions.close') : undefined}
                        size={size}
                        testID={scoreTestIds.scoreToolbarExpandButton}
                    />
                )}
            </Animated.View>
        )
    },
)

const styles = StyleSheet.create({
    base: {
        gap: 8,
        alignItems: 'flex-end',
    },
    spotlightSurface: {
        backgroundColor: brandColors.backgroundDefault,
        borderRadius: TOOLBAR_SURFACE_RADIUS,
        padding: 12,
    },
})
