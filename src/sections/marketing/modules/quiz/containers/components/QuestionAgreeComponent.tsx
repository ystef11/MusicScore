import { memo, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { globalStyles, layout, layoutHelpers, OnboardingTitleComponent } from '@mu-native/ds'

import { getQuizTranslateString } from '../../helpers/quizTranslateHelper.ts'
import { TQuizAnswers, type TQuizDataItem } from '../../types/quizTypes'

import { CardQuestion } from './components/CardQuestion.tsx'
import { ApproveModalContainer } from './containers/AproveModalContainer.tsx'
import { ButtonsControlContainer } from './containers/ButtonsControlContainer.tsx'

const styles = StyleSheet.create({
    dynamicPageContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    newBrandStyleTitle: {
        textAlign: 'center',
        lineHeight: layoutHelpers.getResponsiveSizeExtended(42),
        fontSize: layoutHelpers.getResponsiveSizeExtended(46),
    },
    onboardingWrapper: {
        flex: 1,
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        justifyContent: 'center',
    },
})

type TQuizAgreeComponent = {
    quizData: TQuizDataItem
    quizAnswers: TQuizAnswers
}

export const QuizAgreeComponent = memo(
    ({
        quizData: {
            id: quizId,
            content = 'title/subtitle',
            answers = [],
            title,
            sub_title: subTitle = '',
            settings,
        },
        quizAnswers,
    }: TQuizAgreeComponent) => {
        const opacityStyle = useSharedValue(0)
        const [{ agreeModalData, backgroundColor }, setAgreeModalData] = useState<{
            agreeModalData: Record<string, Record<string, string>>
            backgroundColor: string
        }>({
            agreeModalData: {},
            backgroundColor: '',
        })

        useEffect(() => {
            opacityStyle.value = withTiming(1, {
                duration: 500,
            })
        }, [])

        useEffect(() => {
            try {
                const settingsData = JSON.parse(settings)

                setAgreeModalData({
                    agreeModalData: settingsData.answers,
                    backgroundColor: settingsData.backgroundColor,
                })
            } catch (e) {
                console.error('@@---->error parse agree modal data')
            }
        }, [quizId])

        const opacityStyleView = useAnimatedStyle(() => ({
            opacity: opacityStyle.value,
        }))

        const contentSplit = content?.split('/')
        const currentAnswerId = quizAnswers?.[`id${quizId}`]?.[0]

        return (
            <Animated.View style={[styles.dynamicPageContainer, opacityStyleView]}>
                <View style={styles.onboardingWrapper}>
                    <OnboardingTitleComponent
                        titleStyle={styles.newBrandStyleTitle}
                        contentStyle={globalStyles.mb32}
                        title={getQuizTranslateString(title)}
                        borderWidth={0}
                        titleContainerStyle={globalStyles.alignItemsCenter}
                    />
                    <CardQuestion
                        title={getQuizTranslateString(subTitle)}
                        quizId={quizId}
                        backgroundColor={backgroundColor}
                    />
                </View>
                <ButtonsControlContainer answers={answers} />
                <ApproveModalContainer
                    title={getQuizTranslateString(contentSplit[0])}
                    quizId={quizId}
                    subTitle={contentSplit[1]}
                    emoji={contentSplit[2]}
                    answerData={agreeModalData?.[currentAnswerId]}
                />
            </Animated.View>
        )
    },
)
