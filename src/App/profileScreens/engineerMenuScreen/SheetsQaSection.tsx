import { useState } from 'react'
import { StyleProp, Text, TextStyle, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { omrStoreChunk } from '@mu-native/omr'
import { recentlyViewedScoresStoreChunk } from '@mu-native/recently-viewed-scores'
import { scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

import { TourAuthModalMode } from '../../../modules/auth/types/authTypes'
import { CompleteModalContainer } from '../../../sections/marketing/screens/giftChecklistScreen/container/components/CompleteModal'
import { AiScanModalComponent } from '../../../sections/omr/omrUploadPhotosScreen/containers/components/AiScanModalComponent'
import { CancelScanModalComponent } from '../../../sections/omr/omrUploadPhotosScreen/containers/components/CancelScanModalComponent'
import { ScoreBuyModalContainer } from '../../../sections/score/screens/score/components/modals/scoreBuyModal/ScoreBuyModalComponent'
import { ScorePremiumContainer } from '../../../sections/score/screens/score/components/modals/scorePremiumModal/ScorePremiumComponent'

type TProps = {
    titleStyle: StyleProp<TextStyle>
    itemStyle: StyleProp<TextStyle>
}

export const SheetsQaSection = (props: TProps) => {
    const { navigate } = useAppNavigation()
    const [scores] = useValues([recentlyViewedScoresStoreChunk.props.getScores])
    const [isCancelScanShown, setCancelScanShown] = useState(false)
    const [isCompleteGiftShown, setCompleteGiftShown] = useState(false)
    const actions = useActions({
        setCurrentScore: scoreStoreChunk.actions.setCurrentScore,
        setIsOpenBuyScoreModal: scoreStoreChunk.actions.setIsOpenBuyScoreModal,
        setIsOpenScorePremiumModal: scoreStoreChunk.actions.setIsOpenScorePremiumModal,
        setIsOpenAiScanModalComponent: omrStoreChunk.actions.setIsOpenAiScanModalComponent,
        setIsOpenTourAuthModal: authStoreChunk.actions.setIsOpenTourAuthModal,
        setTourModalMode: authStoreChunk.actions.setTourModalMode,
        addPhoto: omrStoreChunk.actions.addPhoto,
    })

    const score = scores[0]

    const withScore = (open: () => void) => () => {
        if (!score) return
        actions.setCurrentScore(score)
        open()
    }

    const openTourAuth = (mode: TourAuthModalMode) => () => {
        actions.setTourModalMode(mode)
        actions.setIsOpenTourAuthModal(true)
    }

    return (
        <View>
            <Text style={props.titleStyle}>Sheets QA</Text>
            <Text
                style={props.itemStyle}
                onPress={withScore(() => actions.setIsOpenBuyScoreModal(true))}
            >
                {`Buy score sheet${score ? '' : ' (open any score first)'}`}
            </Text>
            <Text
                style={props.itemStyle}
                onPress={withScore(() => actions.setIsOpenScorePremiumModal(true))}
            >
                Score premium sheet
            </Text>
            <Text
                style={props.itemStyle}
                onPress={() => actions.setIsOpenAiScanModalComponent(true)}
            >
                AI scan sheet
            </Text>
            <Text style={props.itemStyle} onPress={() => setCancelScanShown(true)}>
                Cancel scan sheet
            </Text>
            <Text style={props.itemStyle} onPress={openTourAuth(TourAuthModalMode.SIGN_UP)}>
                Tour auth sheet (sign up)
            </Text>
            <Text style={props.itemStyle} onPress={openTourAuth(TourAuthModalMode.SIGN_IN)}>
                Tour auth sheet (sign in)
            </Text>
            <Text style={props.itemStyle} onPress={() => setCompleteGiftShown(true)}>
                Gift completed sheet
            </Text>
            <Text
                style={props.itemStyle}
                onPress={() => !!score && navigate(Screen.artist, { artistId: score.artistId })}
            >
                Artist info sheet (tap info in header)
            </Text>
            <Text
                style={props.itemStyle}
                onPress={withScore(() => {
                    actions.addPhoto(score?.previewImageUrl ?? 'file:///dev/null')
                    navigate(Screen.screenOmrUploadPhotos)
                })}
            >
                OMR upload screen with a photo (tap back for cancel sheet)
            </Text>
            <ScoreBuyModalContainer />
            <ScorePremiumContainer />
            <AiScanModalComponent />
            {isCancelScanShown && (
                <CancelScanModalComponent onClose={() => setCancelScanShown(false)} />
            )}
            {isCompleteGiftShown && <CompleteModalContainer currentGiftId={1} />}
        </View>
    )
}
