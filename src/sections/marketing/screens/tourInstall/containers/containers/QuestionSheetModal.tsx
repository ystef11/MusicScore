import { StyleSheet, View } from 'react-native'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    globalStyles,
    layoutHelpers,
    MuseButton,
    NativeBottomSheet,
    useSheetDismiss,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { getInstrumentValues } from '@mu-native/quiz'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics.ts'

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        padding: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(60),
    },
    yesButtonStyle: {
        flex: 3,
        marginLeft: layoutHelpers.getResponsiveSizeExtended(8),
    },
})

const getAuthorName = (instrumentsValue: number[] = []) => {
    if (instrumentsValue.includes(358)) return 'Mozart'
    if (instrumentsValue.includes(361)) return 'Vivaldi'
    if (instrumentsValue.includes(364)) return 'Bach'
    if (instrumentsValue.includes(367)) return 'Clarke'
    if (instrumentsValue.includes(370)) return 'Parker'
    if (instrumentsValue.includes(373)) return 'Cage'
    if (instrumentsValue.includes(376)) return 'Hendrix'

    return 'Mozart'
}

const QuestionModalContent = () => {
    const close = useSheetDismiss()
    const [instruments] = useValues([getInstrumentValues])

    const authorName = getAuthorName(instruments)

    const onCloseYes = () => {
        close()

        reportEvent(RT_EVENTS.PERSONALIZATION_QUESTION, {
            'params.key': ['author', 'answer'],
            'params.str_value': [authorName.toLowerCase(), 'yes'],
            'params.value': [0, 0],
        })
    }

    const onCloseNo = () => {
        close()

        reportEvent(RT_EVENTS.PERSONALIZATION_QUESTION, {
            'params.key': ['author', 'answer'],
            'params.str_value': [authorName.toLowerCase(), 'no'],
            'params.value': [0, 0],
        })
    }

    return (
        <View style={styles.container}>
            <AppText
                adaptiveSize
                font="f24w600"
                style={globalStyles.mb24}
                rawText={translate('native.marketing.question.do_yo_like', {
                    authorName,
                })}
            />
            <View style={globalStyles.flexDirectionRow}>
                <MuseButton
                    testID={tourTestIds.questionSheet.no}
                    onPress={onCloseNo}
                    type="secondary"
                    style={globalStyles.flex1}
                    title={translate('native.marketing.questions.agree.no')}
                    haptic={false}
                />
                <MuseButton
                    testID={tourTestIds.questionSheet.yes}
                    onPress={onCloseYes}
                    type="primary"
                    style={styles.yesButtonStyle}
                    title={translate('native.marketing.questions.agree.yes')}
                    haptic={false}
                />
            </View>
        </View>
    )
}

export const QuestionSheetModal = ({
    isOpenQuestionModal,
    onCloseModal,
}: {
    isOpenQuestionModal: boolean
    onCloseModal: () => void
}) => {
    if (!isOpenQuestionModal) return null

    return (
        <NativeBottomSheet presentOnMount onDismiss={onCloseModal} enablePanDownToClose={false}>
            <QuestionModalContent />
        </NativeBottomSheet>
    )
}
