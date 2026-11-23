import { useEffect, useMemo } from 'react'
import { StatusBar, StyleSheet, View } from 'react-native'

import { RootViewScreenComponent, useAppSafeArea } from '@mu-native/ds'
import { useAppRoute } from '@mu-native/navigation'
import { useActions } from '@ug/store'

import MetricaEvents from '../../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../../App/constants/scoreAnalytic.ts'
import { MSScoreT } from '../../../../../App/Model/MSScore.ts'
import reportEvent from '../../../../../App/Utils/Analytics.ts'
import autogradeScreenStoreChunk from '../store/autogradeScreenStoreChunk.ts'

import { AutogradeCalibrationOverlay } from '../components/AutogradeCalibrationOverlay.tsx'
import { AutogradeLoadingOverlay } from '../components/AutogradeLoadingOverlay.tsx'
import { AutogradePreparingOverlay } from '../components/AutogradePreparingOverlay.tsx'
import { AutogradeScreenFooter } from '../components/AutogradeScreenFooter.tsx'
import { AutogradeScreenHeader } from '../components/AutogradeScreenHeader.tsx'
import { AutogradeXTZWrapper } from '../components/AutogradeXTZWrapper.tsx'
import { AutogradeResultsView } from '../components/results/AutogradeResultsView.tsx'

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    root: { alignItems: undefined },
})

export const AutogradeContainer = () => {
    const route = useAppRoute<{ uri: string; score: MSScoreT }>()
    const { score, uri } = route

    const actions = useActions({
        ...autogradeScreenStoreChunk.actions,
    })

    useEffect(() => {
        actions.setScore(score)
    }, [score])

    useEffect(() => {
        reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_VIEW, getScoreMetaEvent(score))
        return () => {
            actions.reset()
        }
    }, [])

    useEffect(() => {
        StatusBar.setHidden(true)
        return () => {
            StatusBar.setHidden(false)
        }
    }, [])

    const insets = useAppSafeArea({ top: 20, bottom: 20, left: 20, right: 20 })
    const paddings = useMemo(
        () => ({
            paddingTop: insets.top,
            paddingRight: insets.right,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
        }),
        [insets.bottom, insets.left, insets.right, insets.top],
    )

    return (
        <RootViewScreenComponent style={styles.root}>
            <View style={[styles.flex, paddings]}>
                <AutogradeXTZWrapper score={score} uri={uri} />
                <AutogradeScreenHeader />
                <AutogradeScreenFooter />
            </View>
            <AutogradePreparingOverlay />
            <AutogradeResultsView />
            <AutogradeLoadingOverlay />
            <AutogradeCalibrationOverlay />
        </RootViewScreenComponent>
    )
}
