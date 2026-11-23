import { StyleSheet, View } from 'react-native'

import { AppText, globalStyles } from '@mu-native/ds'

import { MSScoreT } from '../../../Model/MSScore.ts'

export const ScoreItemTitle = ({ score }: { score: MSScoreT }) => {
    return (
        <View style={styles.scoreTitle}>
            <AppText
                font="f15w500"
                numberOfLines={3}
                rawText={score.title}
                style={globalStyles.flex1}
                brandColor="contentPrimary"
            />
        </View>
    )
}

const styles = StyleSheet.create({
    scoreTitle: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
})
