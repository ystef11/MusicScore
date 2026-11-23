import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout, ScorePreviewImage } from '@mu-native/ds'

import { MSScoreT } from '../../types/scoreTypes'

import { ScoreInfoPagesPreview } from './pagesPreview/ScoreInfoPagesPreview'

type Props = {
    score: MSScoreT
    /** Whether the screen currently owns the XTZ engine slot (MUP-14066). */
    isXtzActive?: boolean
    /** Raised while a page swipe owns the touch, so the screen can hold its scroll. */
    onPagingChange: (isPaging: boolean) => void
    /** Raised when the engine has rendered the preview; drives the screen's FSR ScoreInfo. */
    onLoadedChange?: (isLoaded: boolean) => void
}

/**
 * Score thumbnail preview ("Card box" block). Reuses the shared
 * {@link ScorePreviewImage} so it gets the correct rounded corners, border,
 * preview-url upscaling and fallback placeholder.
 *
 * The screen first renders from the list data (lower-res `large`) and swaps to
 * the full-info `original` once `openScoreInfo` resolves. Both fill the same
 * fixed box via `cover`, so the swap only sharpens the image — no size jump.
 *
 * For interactive scores the image is then covered by {@link ScoreInfoPagesPreview},
 * a live XTZ render the user can swipe through (MUP-14066); the image stays as
 * the placeholder while the score downloads and lays out.
 */
export const ScoreInfoPreview = memo(
    ({ score, isXtzActive = false, onPagingChange, onLoadedChange }: Props) => {
        return (
            <View style={styles.container}>
                <View style={styles.preview}>
                    <ScorePreviewImage
                        url={
                            score.originalPreviewUrl ||
                            score.largePreviewUrl ||
                            score.previewImageUrl
                        }
                        blocked={score.score_blocked_by_country}
                        size={styles.preview}
                        fullPage
                    />
                    {!score.isPdf && !score.score_blocked_by_country && (
                        <ScoreInfoPagesPreview
                            score={score}
                            active={isXtzActive}
                            onPagingChange={onPagingChange}
                            onLoadedChange={onLoadedChange}
                        />
                    )}
                </View>
            </View>
        )
    },
)
ScoreInfoPreview.displayName = 'ScoreInfoPreview'

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: layout.marginSm,
    },
    preview: {
        width: 271,
        height: 388,
        // Clips the XTZ overlay to the same box as the placeholder image.
        overflow: 'hidden',
    },
})
