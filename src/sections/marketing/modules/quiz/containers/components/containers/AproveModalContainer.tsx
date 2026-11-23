import { memo, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    globalStyles,
    layout,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    type NativeBottomSheetRef,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { quizStoreChunk } from '@mu-native/quiz'
import { useActions, useValues } from '@ug/store'

import { getQuizTranslateString } from '../../../helpers/quizTranslateHelper.ts'

const styles = StyleSheet.create({
    questionInfoContainer: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
    },
    controlButton: {
        marginBottom: layoutHelpers.getResponsiveSizeExtended(16),
    },
    marginBottom: { marginBottom: layoutHelpers.getResponsiveSizeExtended(120) },
})

const defaultEmojiById = {
    577: '🎼',
    580: '👍',
    583: '🎼',
    586: '⏰',
}

const AgreeContainerModal = ({
    title,
    quizId,
    subTitle,
    emoji,
    onConfirm,
}: {
    title: string
    quizId: keyof typeof defaultEmojiById
    subTitle: string
    emoji?: string
    onConfirm?: () => void
}) => {
    return (
        <View style={styles.questionInfoContainer}>
            <AppText
                textAlign="center"
                font="f64w400Accent"
                rawText={emoji || defaultEmojiById[quizId as keyof typeof defaultEmojiById] || '🎼'}
                adaptiveSize
                lineHeight={90}
            />
            <AppText
                textAlign="center"
                font="f44w400Accent"
                adaptiveSize
                rawText={title}
                style={globalStyles.mb16}
            />
            <AppText
                font="f17w400"
                textAlign="center"
                adaptiveSize
                rawText={subTitle}
                style={styles.marginBottom}
            />
            <MuseButton
                testID={tourTestIds.buttons.approveModalConfirm}
                style={styles.controlButton}
                onPress={onConfirm}
                title={translate('native.actions.okay')}
            />
        </View>
    )
}

export const ApproveModalContainer = memo(
    ({
        title,
        quizId,
        subTitle,
        emoji,
        answerData,
    }: {
        title: string
        quizId: number
        subTitle: string
        emoji: string
        answerData?: Record<string, string>
    }) => {
        const [isOpenApproveModal] = useValues([quizStoreChunk.props.getIsOpenApproveModal])
        const actions = useActions({
            setIsOpenSubscriptionModal: quizStoreChunk.actions.setIsOpenApproveModal,
            setQuizStep: quizStoreChunk.actions.setQuizStepCustom,
        })
        const sheetRef = useRef<NativeBottomSheetRef>(null)

        const onGoToNextPage = () => {
            actions.setIsOpenSubscriptionModal(false)
            actions.setQuizStep({ skipNextAnswersIds: [] })
        }

        useEffect(() => {
            if (isOpenApproveModal) {
                sheetRef.current?.present()
            } else {
                sheetRef.current?.dismiss()
            }
        }, [isOpenApproveModal])

        return (
            <NativeBottomSheet
                ref={sheetRef}
                onDismiss={onGoToNextPage}
                enablePanDownToClose={false}
            >
                <AgreeContainerModal
                    quizId={quizId as keyof typeof defaultEmojiById}
                    title={
                        answerData?.title
                            ? getQuizTranslateString(answerData.title)
                            : getQuizTranslateString(title)
                    }
                    subTitle={
                        answerData?.text
                            ? getQuizTranslateString(answerData.text)
                            : getQuizTranslateString(subTitle)
                    }
                    emoji={answerData?.icon || emoji}
                    onConfirm={sheetRef.current?.dismiss}
                />
            </NativeBottomSheet>
        )
    },
)
