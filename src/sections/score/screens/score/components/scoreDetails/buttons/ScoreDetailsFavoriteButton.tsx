import FavoritesProvider from '../../../../../../../App/Services/FavoritesProvider'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, type ViewInstance } from 'react-native'

import { scoreTestIds } from '@mu/mu-mobile-test-id'
import { authStoreChunk } from '@mu-native/auth'
import { brandColors, CommonTouchable, Icon } from '@mu-native/ds'
import { heartFilled } from '@mu-native/icons/heartFilled'
import { heartOutlined } from '@mu-native/icons/heartOutlined'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import { toggleFavoriteAndRateScore } from '../../../../../../../App/Controllers/ScoreActionsController'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { getScoreMetaEvent } from '../../../helpers/scoreHelpers.ts'
import { MSScoreT } from '../../../types/scoreTypes'
import { FirstSessionSaveHintAnchor } from '../../onboarding/FirstSessionSaveHintAnchor.tsx'

type TProps = {
    score: MSScoreT
    isNew?: boolean
    transparent?: boolean
}

export const ScoreDetailsFavoriteButton = memo(({ score, isNew, transparent }: TProps) => {
    const [currentUser] = useValues([authStoreChunk.props.getUser])
    const actions = useActions({ toggleFavoriteAndRateScore })
    const buttonRef = useRef<ViewInstance>(null)
    const busy = useRef(false)
    const [isFavorite, setIsFavorite] = useState(() => FavoritesProvider.isFavorite(score))
    useEffect(() => { setIsFavorite(FavoritesProvider.isFavorite(score)) }, [score, score.isFavorite])

    const scoreIsMine = score.authorId === currentUser?.id
    const showFavorite = !scoreIsMine && !score.isOffline
    const onPress = useCallback(async () => {
        if (busy.current) return
        busy.current = true
        try { await actions.toggleFavoriteAndRateScore(score); setIsFavorite(FavoritesProvider.isFavorite(score)) }
        finally { busy.current = false }
        reportEvent(score.isFavorite ? RT_EVENTS.SCORE_UNLIKE_CLICK : RT_EVENTS.SCORE_LIKE_CLICK, {
            ...getScoreMetaEvent(score),
            'params.key': ['placement'],
            'params.str_value': ['score'],
            'params.value': [0],
        })
    }, [actions, score])

    if (showFavorite) {
        const iconTint = brandColors.exceptionInverseLight

        return (
            <>
                <CommonTouchable
                    ref={buttonRef}
                    onPress={onPress}
                    isHapticEnabled
                    testID={
                        isFavorite
                            ? scoreTestIds.scoreDetailsFavoriteButtonLiked
                            : scoreTestIds.scoreDetailsFavoriteButtonUnliked
                    }
                    style={[
                        styles.button,
                        {
                            width: isNew ? 44 : 36,
                            height: isNew ? 44 : 36,
                            marginStart: isNew ? 0 : 12,
                        },
                        transparent && styles.transparent,
                    ]}
                >
                    <Icon
                        source={isFavorite ? heartFilled : heartOutlined}
                        tint={iconTint}
                        size={isNew ? 20 : 16}
                    />
                </CommonTouchable>
                <FirstSessionSaveHintAnchor anchor={buttonRef} />
            </>
        )
    }

    return null
})
const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        borderRadius: 100,
        backgroundColor: brandColors.actionSecondaryDefault,
    },
    transparent: {
        backgroundColor: brandColors.transparent,
    },
})
