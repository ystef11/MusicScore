import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, Divider } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import Utils from '../../../../../../App/Utils/Utils.ts'
import { MSScoreT } from '../../types/scoreTypes.ts'
import { useScoreRate } from '../scoreDetails/buttons/ScoreDetailsRateButton.tsx'

type TNameValue = {
    name: string
    value: string
    onPress?: () => void
}

const NewInfoChip = (props: TNameValue) => {
    return (
        <CommonTouchable style={styles.alignCenter} onPress={props.onPress}>
            <AppText font="f17w500" rawText={props.value} />
            <AppText font="f11w400" rawText={props.name} />
        </CommonTouchable>
    )
}

type TProps = {
    score: MSScoreT
}

export const ScoreDescriptionModalInfo = memo(({ score }: TProps) => {
    const { showRate, onPress } = useScoreRate(score)
    const ratingString = score.rating !== undefined ? Utils.toNumber(score.rating) : '-'
    const hitsString =
        score.hits !== undefined
            ? Utils.formatNumber(score.hits)
            : translate('native.score_details_sheet.no_views')

    return (
        <>
            <Divider style={styles.divider} />
            <View style={styles.infoContainer}>
                <NewInfoChip
                    name={translate('native.sorting_type.rating')}
                    value={ratingString}
                    onPress={showRate ? onPress : undefined}
                />
                <Divider style={styles.vDivider} />
                <NewInfoChip name={translate('native.score.views')} value={hitsString} />
                <Divider style={styles.vDivider} />
                <NewInfoChip
                    name={translate('native.score_action_sheet.duration')}
                    value={score.duration}
                />
            </View>
            <Divider style={styles.divider} />
        </>
    )
})
ScoreDescriptionModalInfo.displayName = 'ScoreDescriptionModalInfo'

const styles = StyleSheet.create({
    infoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
    },

    divider: {
        marginVertical: 16,
        marginHorizontal: 0,
    },

    vDivider: {
        marginHorizontal: 0,
        marginVertical: 0,
        width: StyleSheet.hairlineWidth,
        height: '100%',
    },

    alignCenter: {
        alignItems: 'center',
    },
})
