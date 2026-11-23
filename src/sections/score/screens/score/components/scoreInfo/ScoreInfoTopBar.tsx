import { memo, useCallback } from 'react'
import { StyleSheet } from 'react-native'

import {
    AppNavigationHeaderView,
    BrandAppLoader,
    brandColors,
    CommonTouchable,
    Icon,
} from '@mu-native/ds'
import { share as shareIcon } from '@mu-native/icons/share'

import { useShareScore } from '../../hooks/useShareScore'
import { MSScoreT } from '../../types/scoreTypes'
import { ScoreDetailsFavoriteButton } from '../scoreDetails/buttons/ScoreDetailsFavoriteButton'

type Props = {
    score: MSScoreT
    goBack: () => void
}

const ShareButton = memo(({ score }: { score: MSScoreT }) => {
    const { isSharing, shareScore } = useShareScore(score)

    if (score.isOffline) return null

    return (
        <CommonTouchable style={styles.iconButton} onPress={shareScore} isHapticEnabled>
            {isSharing ? (
                <BrandAppLoader size="s" color={brandColors.exceptionInverseLight} />
            ) : (
                <Icon source={shareIcon} tint={brandColors.exceptionInverseLight} size={20} />
            )}
        </CommonTouchable>
    )
})
ShareButton.displayName = 'ShareButton'

/**
 * Top bar of the Score Info screen ("TopBar / Default"): reuses the shared
 * {@link AppNavigationHeaderView} (which handles the safe-area top inset) with a
 * back button on the left and favorite + share actions on the right.
 */
export const ScoreInfoTopBar = memo(({ score, goBack }: Props) => {
    const rightBlock = useCallback(
        () => (
            <>
                <ScoreDetailsFavoriteButton score={score} isNew transparent />
                <ShareButton score={score} />
            </>
        ),
        [score],
    )

    return <AppNavigationHeaderView goBack={goBack} rightBlock={rightBlock} />
})
ScoreInfoTopBar.displayName = 'ScoreInfoTopBar'

const styles = StyleSheet.create({
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
