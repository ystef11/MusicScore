import { StyleSheet, View } from 'react-native'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import { layout, layoutHelpers, MuseButton, useAppSafeArea } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { getQuizTranslateString } from '../../../helpers/quizTranslateHelper.ts'
import { quizStoreChunk } from '../../../store/quizStoreChunk.ts'
import { TQuizFirstStepItem, TQuizItem } from '../../../types/quizTypes.ts'

const styles = StyleSheet.create({
    cardContainer: {
        width: platform.isTablet ? layout.maxWidthTabletContainer : '100%',
        flexDirection: 'row',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(16),
    },
})
export const ButtonsControlContainer = ({
    answers,
}: {
    answers: TQuizFirstStepItem[] | TQuizItem[]
}) => {
    const { bottom } = useAppSafeArea({ bottom: 20 })
    const actions = useActions({
        setTourQuizDataFlatItem: quizStoreChunk.actions.setTourQuizDataFlatItem,
        setIsOpenApproveModal: quizStoreChunk.actions.setIsOpenApproveModal,
        setQuizStep: quizStoreChunk.actions.setQuizStepCustom,
    })
    const [isOpenApproveModal] = useValues([quizStoreChunk.props.getIsOpenApproveModal])

    const onPressQuizItem = ({
        id,
        value,
        isShowModal,
    }: {
        id: number
        value: string
        isShowModal: boolean
    }) => {
        actions.setTourQuizDataFlatItem({
            answerId: id,
            title: value,
            isMultiSelect: false,
            isOverride: true,
        })
        if (isShowModal) {
            actions.setIsOpenApproveModal(true)
            return
        }
        actions.setQuizStep({ skipNextAnswersIds: null })
    }

    return (
        <View style={[styles.cardContainer, { marginBottom: bottom }]}>
            {!!answers?.length &&
                answers.map((item: TQuizFirstStepItem | TQuizItem, index: number) => (
                    <MuseButton
                        testID={tourTestIds.quizOption(index)}
                        onPress={() =>
                            onPressQuizItem({
                                id: item.id,
                                value: item.title || item.name || '',
                                isShowModal: index !== 0,
                            })
                        }
                        type={index === 0 ? 'secondary' : 'primary'}
                        key={item.title || item.name}
                        disabled={isOpenApproveModal}
                        style={{
                            flex: index === 0 ? 1 : 3,
                            marginLeft:
                                index === 0 ? 0 : layoutHelpers.getResponsiveSizeExtended(8),
                        }}
                        title={
                            item.title || item.name
                                ? getQuizTranslateString(item.title || item.name)
                                : ''
                        }
                        haptic={false}
                    />
                ))}
        </View>
    )
}
