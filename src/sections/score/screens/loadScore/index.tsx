import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { useAppRoute } from '@mu-native/navigation'

import { useLoadAndOpenScore } from './hooks/useLoadAndOpenScore.ts'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    loader: {
        marginTop: 20,
    },
})

export const LoadScoreScreen = memo(() => {
    const { scoreId } = useAppRoute<{ scoreId: string }>()

    useLoadAndOpenScore(scoreId)

    return (
        <View style={styles.container}>
            <AppText textAlign="center" font="f20w600">
                {translate('native.load_score.title')}
            </AppText>
            <BrandAppLoader style={styles.loader} />
        </View>
    )
})
