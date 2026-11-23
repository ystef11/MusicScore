import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { platform } from '@mu-native/common'
import { AppText, brandColors, CommonTouchable, Icon, layout, layoutHelpers, useAppSafeArea, } from '@mu-native/ds'
import { emailVerificationStoreChunk, useLoadEmailVerificationStoreChunk, } from '@mu-native/email-verification'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { marketingConstants, subscriptionsRtHelpers, TSources } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { getCurrentQuizQuestionId, getLastProgressBarStep, quizStoreChunk, } from '../../store/quizStoreChunk'

import { QuizProgressSegment } from './components/QuizProgressSegment'

const { getResponsiveSizeExtended } = layoutHelpers

const STAR_SIZE = getResponsiveSizeExtended(20)
const STAR_ICON_SIZE = getResponsiveSizeExtended(11)
const ROW_MARGIN_TOP = getResponsiveSizeExtended(8)

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        height: getResponsiveSizeExtended(24),
        marginTop: ROW_MARGIN_TOP,
        marginBottom: getResponsiveSizeExtended(4),
        paddingHorizontal: platform.isTablet ? 0 : getResponsiveSizeExtended(20),
    },
    bar: {
        flex: 1,
        flexDirection: 'row',
    },
    segmentWrapper: {
        flex: 1,
        height: STAR_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentGap: {
        marginLeft: getResponsiveSizeExtended(4),
    },
    star: {
        position: 'absolute',
        width: STAR_SIZE,
        height: STAR_SIZE,
        borderRadius: STAR_SIZE / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.colorBackgroundDisabled,
    },
    starLit: {
        backgroundColor: brandColors.contentPrimary,
    },
    skip: {
        marginLeft: getResponsiveSizeExtended(12),
    },
})

const dynamicStyles = {
    getRowStyles: (marginTop: number) => StyleSheet.flatten([styles.row, { marginTop }]),
}

type TQuizProgressBarComponent = {
    source?: TSources
    isNeedTopInset?: boolean
}

export const QuizProgressBarComponent = memo(
    ({
        source = marketingConstants.sources.tourInstall,
        isNeedTopInset = false,
    }: TQuizProgressBarComponent) => {
        useLoadEmailVerificationStoreChunk()
        const { top } = useAppSafeArea()

        const [
            quizStep,
            lastQuizStep,
            lastProgressBarStep,
            quizId,
            quizAnalyticsQuestions,
            quizAnalyticsUi,
            isNeedVerifyEmail,
        ] = useValues([
            quizStoreChunk.props.getQuizStep,
            quizStoreChunk.props.getLastQuizStep,
            getLastProgressBarStep,
            getCurrentQuizQuestionId,
            quizStoreChunk.props.getQuizAnalyticsQuestions,
            quizStoreChunk.props.getQuizAnalyticsUi,
            emailVerificationStoreChunk.props.getIsNeedVerifyEmail,
        ])
        const actions = useActions({ setQuizStep: quizStoreChunk.actions.setQuizStep })

        const isExistingAccountUser = isNeedVerifyEmail === false
        const stepsCount = lastProgressBarStep + 1
        const isLastStepReached = quizStep >= lastProgressBarStep

        const onSkipPress = useCallback(() => {
            reportEvent(MetricaEvents.TOUR_QUIZ_SKIP_CLICK, {
                ...subscriptionsRtHelpers.getRtParamsBySource({ source }),
                value: quizAnalyticsQuestions[quizId],
                ui: quizAnalyticsUi[quizId],
            })

            actions.setQuizStep(lastQuizStep + 1)
        }, [source, quizId, quizAnalyticsQuestions, quizAnalyticsUi, lastQuizStep])

        if (quizStep > lastProgressBarStep) return null

        return (
            <View
                style={
                    isNeedTopInset ? dynamicStyles.getRowStyles(top + ROW_MARGIN_TOP) : styles.row
                }
            >
                <View style={styles.bar}>
                    {Array.from({ length: stepsCount }, (_, index) => (
                        <View key={index} style={[styles.segmentWrapper, styles.segmentGap]}>
                            <QuizProgressSegment isFilled={index <= quizStep} />
                            {index === stepsCount - 1 && (
                                <View
                                    style={
                                        isLastStepReached
                                            ? [styles.star, styles.starLit]
                                            : styles.star
                                    }
                                >
                                    <Icon
                                        source={star}
                                        size={STAR_ICON_SIZE}
                                        tint={
                                            isLastStepReached
                                                ? brandColors.backgroundDefault
                                                : brandColors.contentInactive
                                        }
                                    />
                                </View>
                            )}
                        </View>
                    ))}
                </View>
                {isExistingAccountUser && (
                    <CommonTouchable
                        testID="Tour quiz skip"
                        style={styles.skip}
                        hitSlop={12}
                        onPress={onSkipPress}
                    >
                        <AppText
                            font="f15w600"
                            brandColor="contentInactive"
                            rawText={translate('native.score_action_sheet.cancel')}
                        />
                    </CommonTouchable>
                )}
            </View>
        )
    },
)
