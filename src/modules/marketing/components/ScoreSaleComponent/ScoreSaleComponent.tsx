import { memo } from 'react'
import { View, ViewStyle } from 'react-native'

import { marketingTestIds } from '@mu/mu-mobile-test-id'

import { type TInAppForShow, type TProductId } from '../../types/marketingTypes'

import ScoreItemComponent from './components/ScoreItemComponent'

type TScoreSaleComponent = {
    isActiveScore: boolean
    setActiveSubscribePlan: (productId: TProductId) => void
    inAppInfo: TInAppForShow
    creditBalance?: number
    contentContainerStyle?: ViewStyle
    imageInAppUri?: string
}
const ScoreSaleComponent = ({
    isActiveScore,
    setActiveSubscribePlan,
    inAppInfo,
    creditBalance,
    contentContainerStyle = {},
    imageInAppUri,
}: TScoreSaleComponent) => {
    if (!inAppInfo?.id || !inAppInfo?.scoreId) return null
    return (
        <View
            style={contentContainerStyle}
            testID={marketingTestIds.offScoresLongLandingScoreSaleBlock}
        >
            <ScoreItemComponent
                setActiveSubscribePlan={setActiveSubscribePlan}
                score={inAppInfo}
                isActiveScore={isActiveScore}
                creditBalance={creditBalance}
                imageInAppUri={imageInAppUri}
            />
        </View>
    )
}

export default memo(ScoreSaleComponent)
