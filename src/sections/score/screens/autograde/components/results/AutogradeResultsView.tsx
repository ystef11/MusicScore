import { useEffect, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'
import Reanimated, { SlideInDown, SlideOutDown } from 'react-native-reanimated'

import { AppText, brandColors, Divider, icons, MuseButton, SafeAreaView } from '@mu-native/ds'
import { close as closeIcon } from '@mu-native/icons/close'
import { PlainLocaleKey, translate } from '@mu-native/locale'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents.ts'
import { getScoreMetaEvent } from '../../../../../../App/constants/scoreAnalytic.ts'
import reportEvent from '../../../../../../App/Utils/Analytics.ts'
import autogradeScreenStoreChunk from '../../store/autogradeScreenStoreChunk.ts'
import { AutogradeState } from '../../types/autogradeScreenAppTypes.ts'

import { FinalGradeView } from './FinalGradeView.tsx'

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    container: {
        flex: 1,
        backgroundColor: brandColors.accentPrimary,
    },
    flex: {
        flex: 1,
    },
    screenHalf: {
        flex: 1,
        marginHorizontal: 16,
        justifyContent: 'center',
        height: '100%',
    },
    divider: {
        backgroundColor: brandColors.backgroundDefault,
        marginHorizontal: 0,
        marginVertical: 16,
        height: 1,
    },
    gradeTypeText: {
        opacity: 0.5,
    },
    leftHalf: {
        marginTop: 16,
    },
    rightHalf: { paddingBottom: 20 },
    closeButton: {
        marginTop: 20,
        marginLeft: 16,
    },
    row: {
        flexDirection: 'row',
    },
    finalGrade: {
        alignItems: 'center',
    },
    gradeBlock: {
        flex: 1,
        alignItems: 'center',
        marginVertical: 20,
    },
    gradeBlockValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gradeBlockImage: {
        height: 40,
        width: 40,
    },
    reviewButton: {
        marginTop: 20,
    },
})

type TGradeType = 'accuracy' | 'rhythm'

const gradeTitleKeys: Record<TGradeType, PlainLocaleKey> = {
    accuracy: 'native.practice_mode.results.pitch',
    rhythm: 'native.practice_mode.results.rhythm',
}

const GradeBlock = ({ type, grade }: { type: TGradeType; grade: number }) => {
    const title = translate(gradeTitleKeys[type])
    const icon = { accuracy: icons.autogradePitch, rhythm: icons.autogradeRhythm }[type]

    return (
        <View style={styles.gradeBlock}>
            <View style={styles.gradeBlockValue}>
                <Image source={icon} style={styles.gradeBlockImage} resizeMode="contain" />
                <AppText brandColor="backgroundDefault" font="f44w400Accent">
                    {grade}%
                </AppText>
            </View>
            <AppText
                font="f13w500"
                style={styles.gradeTypeText}
                textTransform="uppercase"
                brandColor="backgroundDefault"
            >
                {title}
            </AppText>
        </View>
    )
}

export const AutogradeResultsView = () => {
    const [score, state, results] = useValues([
        autogradeScreenStoreChunk.props.getScore,
        autogradeScreenStoreChunk.props.getState,
        autogradeScreenStoreChunk.props.getResults,
    ])
    const [visible, setVisible] = useState<boolean | null>(null)

    useEffect(() => {
        if (visible && results) {
            reportEvent(MetricaEvents.SCORE_PRACTICE_MODE_COMPLETE, getScoreMetaEvent(score))
        }
    }, [visible, results, score])

    if (state === AutogradeState.Reviewing && visible === null) {
        setVisible(true)
    }

    if (state === AutogradeState.Preparing && visible !== null) {
        setVisible(null)
    }

    const onClose = () => setVisible(false)
    const onReview = () => {
        setVisible(false)
    }

    if (!visible || !results) return null

    const { accuracy, rhythm } = results
    let finalGrade = Math.round((accuracy + rhythm) / 2)
    finalGrade = isNaN(finalGrade) ? 0 : finalGrade

    return (
        <View style={styles.wrapper}>
            <Reanimated.View entering={SlideInDown} exiting={SlideOutDown} style={styles.flex}>
                <SafeAreaView style={styles.container}>
                    <View style={styles.row}>
                        <MuseButton
                            type="secondary"
                            startIcon={closeIcon}
                            style={styles.closeButton}
                            onPress={onClose}
                        />
                    </View>
                    <View style={[styles.row, styles.flex]}>
                        <View style={[styles.screenHalf, styles.leftHalf]}>
                            <View>
                                <AppText
                                    font="f10w500"
                                    brandColor="backgroundDefault"
                                    textTransform="uppercase"
                                >
                                    {translate('native.practice_mode.results.song_complete')}
                                </AppText>
                                <Divider style={styles.divider} />
                                <AppText
                                    font="f20w400"
                                    numberOfLines={2}
                                    brandColor="backgroundDefault"
                                >
                                    {score?.title ?? ''}
                                </AppText>
                                <Divider style={styles.divider} />
                                <View style={styles.row}>
                                    <GradeBlock type="accuracy" grade={accuracy} />
                                    <GradeBlock type="rhythm" grade={rhythm} />
                                </View>
                                <Divider style={styles.divider} />
                            </View>
                        </View>
                        <View style={[styles.screenHalf, styles.rightHalf]}>
                            <FinalGradeView final={finalGrade}>
                                <View style={styles.finalGrade}>
                                    <AppText
                                        textTransform="uppercase"
                                        brandColor="backgroundDefault"
                                        font="f13w400"
                                    >
                                        {translate('native.practice_mode.results.score')}
                                    </AppText>
                                    <AppText font="f56w400Accent" brandColor="backgroundDefault">
                                        {finalGrade}%
                                    </AppText>
                                </View>
                            </FinalGradeView>
                            <MuseButton
                                title={translate(
                                    'native.practice_mode.results.review_and_try_again',
                                )}
                                style={styles.reviewButton}
                                type="secondary"
                                onPress={onReview}
                            />
                        </View>
                    </View>
                </SafeAreaView>
            </Reanimated.View>
        </View>
    )
}
