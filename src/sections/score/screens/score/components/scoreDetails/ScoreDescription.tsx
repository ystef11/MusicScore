import { memo, useCallback, useRef } from 'react'
import { StyleSheet } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    brandColors,
    brandFontsStyles,
    CommonTouchable,
    ExpandableText,
    globalStyles,
    NativeBottomSheetRef,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { useCurrentScore } from '../../hooks/useCurrentScore'
import { MSScoreT } from '../../types/scoreTypes.ts'
import { DescriptionScoreSheet } from '../modals/DescriptionModalComponent.tsx'

import { ScoreDetailRatingView } from './ScoreDetailRatingView.tsx'

type Props = {
    score: MSScoreT
}

export const ScoreDescriptionText = ({ score }: Props) => {
    const description = score.description?.replaceAll(/\s/g, ' ')
    if (description) {
        return (
            <ExpandableText
                text={description}
                alwaysShowBadge
                badgeStyle={styles.badge}
                moreLabel={translate('native.view.all')}
                textStyle={styles.newDescription}
                numberOfLines={3}
            />
        )
    }

    return (
        <AppText font="f15w400">
            {translate('native.score_action_sheet.pages_value', {
                pages: String(score.pagesCount ?? ''),
            })}
            {'\n'}
            {translate('native.score_action_sheet.duration_value', {
                duration: score.duration,
            })}
            {'\n'}
            <AppText
                brandColor="accentPrimary"
                rawText={translate('native.view.all')}
                font="f15w400"
                style={globalStyles.mt2}
            />
        </AppText>
    )
}

export const ScoreDescription = memo(({ score }: Props) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    // The sheet renders nothing without a current score, collapsing to a sliver.
    const currentScore = useCurrentScore()
    const onPress = useCallback(() => {
        if (!currentScore) return
        sheetRef.current?.present()
    }, [currentScore])

    return (
        <CommonTouchable onPress={onPress} testID={scoreTestIds.scoreDetailsDescription}>
            <ScoreDetailRatingView score={score} />
            <ScoreDescriptionText score={score} />

            <DescriptionScoreSheet ref={sheetRef} />
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    newDescription: {
        color: brandColors.contentPrimary,
        ...brandFontsStyles.f15w400,
    },

    badge: {
        marginTop: 2,
        color: brandColors.accentPrimary,
    },
})
