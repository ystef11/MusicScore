import { StyleSheet, View } from 'react-native'

import { AppText } from '@mu-native/ds'

import { ProLabel } from '../../../Components/CommentListItem/Elements/ProLabel.tsx'
import { MSScoreT } from '../../../Model/MSScore.ts'

export const ScoreItemAuthor = ({ score, isPro }: { score: MSScoreT; isPro: boolean }) => {
    return (
        <View style={styles.authorContainer}>
            <AppText
                font="f15w400"
                brandColor="contentSecondary"
                style={styles.mt2}
                numberOfLines={1}
            >
                {score.authorName}
                <ProLabel experiment="B" isPro={isPro} blocked={score.score_blocked_by_country} />
            </AppText>
        </View>
    )
}

const styles = StyleSheet.create({
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mt2: { marginTop: 2 },
})
