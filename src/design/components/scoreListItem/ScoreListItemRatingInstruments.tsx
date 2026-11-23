import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { star } from '@mu-native/icons/star'

import { AppText } from '../AppText/AppText'
import Icon from '../Icon/Icon'

type TProps = {
    text: string
    ratingTitle: string | undefined
}

export const ScoreListItemRatingInstruments = memo(({ text, ratingTitle }: TProps) => {
    const showRating = ratingTitle?.trim() !== '0.0'
    const _text = showRating ? text : text.replace(' · ', '')
    return (
        <View style={styles.rowContentCenter}>
            {showRating && (
                <>
                    <Icon source={star} size={16} style={styles.me2} />
                    {!!ratingTitle && (
                        <AppText numberOfLines={1} rawText={ratingTitle} font="f15w400" />
                    )}
                </>
            )}
            <AppText numberOfLines={1} font="f15w400" style={styles.flex} rawText={_text} />
        </View>
    )
})

const styles = StyleSheet.create({
    rowContentCenter: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    flex: {
        flex: 1,
    },

    me2: {
        marginEnd: 2,
    },
})
