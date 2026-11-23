import { memo, useEffect } from 'react'
import {
    FlatList,
    SectionList,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    View,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import { AppText, colors, layout, layoutHelpers } from '@mu-native/ds'

import { getQuizTranslateString } from '../../helpers/quizTranslateHelper.ts'
import {
    TQuizAnswers,
    type TQuizDataItem,
    type TQuizFirstStepItem,
    type TQuizItem,
} from '../../types/quizTypes'

import TourVariantsListItem from './components/TourVariantsListItem'

const { getResponsiveSize } = layoutHelpers

const styles = StyleSheet.create({
    separator: {
        height: layoutHelpers.getResponsiveSizeExtended(8),
    },
    listContainer: {
        flex: 1,
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        alignSelf: 'center',
        paddingBottom: getResponsiveSize(120),
    },
    listSectionHeaderItem: {
        color: colors.text900,
        fontWeight: '600',
        fontSize: getResponsiveSize(18),
        lineHeight: getResponsiveSize(24),
        textAlign: 'left',
        letterSpacing: 0.36,
        paddingBottom: getResponsiveSize(8),
        paddingLeft: platform.isTablet ? 0 : getResponsiveSize(16),
        paddingTop: getResponsiveSize(24),
    },
    listSectionHeaderFirstItemNewDesign: {
        paddingBottom: getResponsiveSize(24),
        paddingTop: getResponsiveSize(8),
        paddingHorizontal: platform.isTablet ? 0 : getResponsiveSize(16),
    },
    listSectionSubTitle: {
        color: colors.text900,
        fontWeight: '500',
        fontSize: getResponsiveSize(14),
        textAlign: 'left',
        paddingBottom: getResponsiveSize(24),
        paddingHorizontal: platform.isTablet ? 0 : getResponsiveSize(16),
    },
    listSectionPadding: { paddingBottom: getResponsiveSize(8) },
})

const TourAccordionAnswersListSectionHeader = ({ title }: { title: string }) =>
    title ? (
        <TouchableWithoutFeedback>
            <Text style={styles.listSectionHeaderItem}>{getQuizTranslateString(title)}</Text>
        </TouchableWithoutFeedback>
    ) : null

const flatListKeyExtractor = (item: any) => item.id
const sectionKeyExtractor = (item: TQuizItem) => item.id.toString()
const renderSeparator = () => <View style={styles.separator} />

type TTourVariantsListComponent = {
    isMultiSelect: boolean
    questionIndex: number
    quizData: TQuizDataItem
    quizAnswers: TQuizAnswers
}

const TourAccordionAnswersListComponent = ({
    isMultiSelect,
    questionIndex,
    quizData: { id: quizId, answers = [], title, sub_title: subTitle },
    quizAnswers,
}: TTourVariantsListComponent) => {
    const id = `id${quizId}`

    const opacityText = useSharedValue(60)
    const opacityStyle = useAnimatedStyle(() => ({
        opacity: opacityText.value,
    }))

    useEffect(() => {
        opacityText.value = 0
        opacityText.value = withTiming(1, { duration: 400 })
    }, [questionIndex])

    const renderSectionHeader = ({ section: { title } }: { section: TQuizFirstStepItem }) => (
        <TourAccordionAnswersListSectionHeader title={title || ''} />
    )

    const renderFlatItem = ({ item: itemQuiz, index }: { item: TQuizItem; index: number }) => (
        <TourVariantsListItem
            item={itemQuiz}
            isMultiSelect={isMultiSelect}
            isSelected={quizAnswers[id]?.includes(itemQuiz.id)}
            index={index}
            isLastItem={answers.length === index + 1}
        />
    )

    return (
        <View style={styles.listContainer}>
            <AppText
                style={[
                    styles.listSectionHeaderFirstItemNewDesign,
                    !!subTitle && styles.listSectionPadding,
                ]}
                font="f24w600"
                rawText={getQuizTranslateString(title)}
                textAlign="left"
                adaptiveSize
            />
            {!!subTitle && (
                <Animated.Text style={[styles.listSectionSubTitle, opacityStyle]}>
                    {getQuizTranslateString(subTitle)}
                </Animated.Text>
            )}
            {!answers?.[0]?.data?.length ? (
                <FlatList
                    key={questionIndex}
                    extraData={quizAnswers[id]}
                    showsVerticalScrollIndicator={false}
                    data={answers as TQuizItem[]}
                    renderItem={renderFlatItem}
                    keyExtractor={flatListKeyExtractor}
                    ItemSeparatorComponent={renderSeparator}
                    maxToRenderPerBatch={8}
                    initialNumToRender={platform.isTablet ? 16 : 12}
                    windowSize={11}
                    removeClippedSubviews
                />
            ) : (
                <SectionList<TQuizItem, TQuizFirstStepItem>
                    key={questionIndex}
                    maxToRenderPerBatch={8}
                    initialNumToRender={platform.isTablet ? 16 : 12}
                    showsVerticalScrollIndicator={false}
                    sections={answers as TQuizFirstStepItem[]}
                    keyExtractor={sectionKeyExtractor}
                    renderItem={renderFlatItem}
                    stickySectionHeadersEnabled={false}
                    renderSectionHeader={renderSectionHeader}
                    ItemSeparatorComponent={renderSeparator}
                />
            )}
        </View>
    )
}

export default memo(TourAccordionAnswersListComponent)
