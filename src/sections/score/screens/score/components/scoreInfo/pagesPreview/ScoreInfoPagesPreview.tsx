import { memo, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSharedValue, withTiming } from 'react-native-reanimated'

import { BrandAppLoader, brandColors, PaginationDots } from '@mu-native/ds'
import { XtzView } from '@mu-native/xtz'

import { MSScoreT } from '../../../types/scoreTypes'

import { useScoreInfoPreviewEngine } from './useScoreInfoPreviewEngine'
import { useScoreInfoPreviewFile } from './useScoreInfoPreviewFile'
import { useScoreInfoPreviewSwipe } from './useScoreInfoPreviewSwipe'

type Props = {
    score: MSScoreT
    active: boolean
    /** Raised while a page swipe owns the touch, so the screen can hold its scroll. */
    onPagingChange: (isPaging: boolean) => void
    /** Raised when the engine has rendered the preview; drives the screen's FSR ScoreInfo. */
    onLoadedChange?: (isLoaded: boolean) => void
}

export const ScoreInfoPagesPreview = memo(
    ({ score, active, onPagingChange, onLoadedChange }: Props) => {
        const uri = useScoreInfoPreviewFile(score, active)
        const {
            isLoaded,
            pages: { current, total },
            turnPage,
        } = useScoreInfoPreviewEngine(uri, active, score.pagesCount ?? 0)
        const panHandlers = useScoreInfoPreviewSwipe(turnPage, onPagingChange)
        // PaginationDots interpolates a continuous carousel progress; our page index
        // arrives as discrete engine events, so drive it through timing.
        const progressValue = useSharedValue(0)

        useEffect(() => {
            progressValue.value = withTiming(current, { duration: 150 })
        }, [current, progressValue])

        useEffect(() => {
            onLoadedChange?.(isLoaded)
        }, [isLoaded, onLoadedChange])

        if (!active) return null

        return (
            <View style={styles.root} pointerEvents="box-none">
                {!!uri && (
                    <View
                        style={[styles.canvas, !isLoaded && styles.hidden]}
                        pointerEvents={isLoaded ? 'box-only' : 'none'}
                        {...panHandlers}
                    >
                        <XtzView style={styles.xtz} />
                        {total > 1 && (
                            <PaginationDots
                                length={total}
                                progressValue={progressValue}
                                dotSize={6}
                                backgroundColor={brandColors.contentSecondary}
                                inactiveBgColorDots={brandColors.strokeDefault}
                                customContainerStyle={styles.dots}
                                customDotContainer={styles.dot}
                            />
                        )}
                    </View>
                )}
                {!isLoaded && (
                    <View style={styles.loader} pointerEvents="none">
                        <BrandAppLoader size="s" />
                    </View>
                )}
            </View>
        )
    },
)
ScoreInfoPagesPreview.displayName = 'ScoreInfoPagesPreview'

const styles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFill,
    },
    canvas: {
        ...StyleSheet.absoluteFill,
        backgroundColor: brandColors.backgroundDefault,
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
    },
    hidden: {
        opacity: 0,
    },
    xtz: {
        flex: 1,
    },
    loader: {
        position: 'absolute',
        top: 8,
        right: 8,
    },
    dots: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 8,
        justifyContent: 'center',
    },
    dot: {
        marginHorizontal: 3,
    },
})
