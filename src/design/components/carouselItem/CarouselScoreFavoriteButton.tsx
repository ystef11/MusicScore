import { memo, useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'

import { heartFilled } from '@mu-native/icons/heartFilled'
import { heartOutlined } from '@mu-native/icons/heartOutlined'

import { brandColors } from '../../constants/new/brandColors.ts'
import { CommonTouchable } from '../../elements/CommonTouchable.tsx'
import Icon, { type IconSource } from '../Icon/Icon'

import { TScoreConstraints } from './carouselScoreItemTypes.ts'

type TCarouselScoreFavoriteButtonProps<TScore extends TScoreConstraints> = {
    score: TScore
    onFavoritePress: (score: TScore) => void
}

export const CarouselScoreFavoriteButton = memo(
    <TScore extends TScoreConstraints>({
        score,
        onFavoritePress,
    }: TCarouselScoreFavoriteButtonProps<TScore>) => {
        const [isFavorite, setIsFavorite] = useState(score.isFavorite)

        const isShowFavorite = !score.isOffline

        const onPress = useCallback(() => {
            setIsFavorite(prevState => !prevState)
            onFavoritePress(score)
        }, [isFavorite, onFavoritePress, score])

        if (!isShowFavorite) {
            return null
        }

        const icon: IconSource = isFavorite ? heartFilled : heartOutlined

        return (
            <CommonTouchable onPress={onPress} isHapticEnabled style={styles.button} hitSlop={8}>
                <Icon
                    source={icon}
                    tint={isFavorite ? brandColors.accentPrimary : brandColors.contentPrimary}
                    size={16}
                />
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 2,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.exceptionConstantWhite,
    },
})
