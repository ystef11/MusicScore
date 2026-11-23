import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, colors, getScoreComplexity, Icon } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { localizeEnsemble, translate } from '@mu-native/locale'

import Utils from '../../../../../../App/Utils/Utils.ts'
import { MSScoreT } from '../../types/scoreTypes'

type TProps = {
    score: MSScoreT
}

export const ScoreDetailRatingView = memo(({ score }: TProps) => {
    const ratingString = Utils.toNumber(score.rating) || '-'
    const hitsString = score.hits
        ? translate('native.score_details_sheet.views_number', {
              number: Utils.formatNumber(score.hits),
          })
        : translate('native.score_details_sheet.no_views')
    const instrumentationsString = score.instrumentations?.map(localizeEnsemble).join(', ')
    const partsString = score.instruments?.map(({ name }) => name).join(', ')
    const complexityString = score.complexity ? getScoreComplexity(score.complexity) : ''
    const original = score.isOrigin ? translate('native.original') : ''

    const chips = [
        ratingString,
        hitsString,
        instrumentationsString,
        partsString,
        complexityString,
        original,
    ]
        .map((item, i, array) => {
            return [...(i > 0 && !!item ? ['·'] : []), ...(item?.split(' ') || [])]
        })
        .flat()

    return (
        <View style={styles.newMetadataContainer}>
            <Icon source={star} size={16} style={styles.newRatingIcon} />
            <AppText
                font="f15w400"
                numberOfLines={1}
                ellipsizeMode="tail"
                brandColor="contentPrimary"
                rawText={chips.join(' ')}
            />
        </View>
    )
})
ScoreDetailRatingView.displayName = 'ScoreDetailRatingView'

const styles = StyleSheet.create({
    newMetadataContainer: {
        flexDirection: 'row',
        marginBottom: 8,
        paddingEnd: 16,
        alignItems: 'center',
    },

    newRatingIcon: {
        tintColor: colors.summerColor,
        marginRight: 4,
    },
})
