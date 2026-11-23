import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { FastImage, layoutHelpers } from '@mu-native/ds'
import { dynamicDecorStoreChunk } from '@mu-native/dynamic-decor'
import {
    get70SaleSubscriptions,
    marketingConstants,
    PaymentLayerCloseBlockComponent,
} from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import PlansSaleComponent from './components/PlansSaleComponent'

const { gameSteps } = marketingConstants

const styles = StyleSheet.create({
    background: {
        flex: 1,
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    gameWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    closeIconContainerStyle: {
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
    },
})

const delayExitingAnimation = 900
const currentGameStep = gameSteps.giftPlans

const ScreenScratchGameContainer = () => {
    const [
        subscriptions,
        { card, closeIconProfileStyle, profileCancelTextStyle, closeIconBgProfileStyle },
    ] = useValues([get70SaleSubscriptions, dynamicDecorStoreChunk.props.getActiveDecorData])

    const { goBack } = useNavigation()

    const onCloseGame = useCallback(() => {
        goBack()
    }, [])

    const imageSource = layoutHelpers.getUriSourceByImageUrl(card)

    return (
        <View style={styles.gameWrapper}>
            {!!imageSource.uri && (
                <FastImage source={imageSource} style={styles.background as any} />
            )}
            <PaymentLayerCloseBlockComponent
                containerStyle={styles.closeIconContainerStyle}
                onClose={onCloseGame}
                closeIconStyle={closeIconProfileStyle}
                closeIconBgStyle={closeIconBgProfileStyle}
            />
            {currentGameStep === gameSteps.giftPlans && (
                <PlansSaleComponent
                    {...{
                        subscriptions,
                        goBack,
                        delayExitingAnimation,
                        profileCancelTextStyle,
                    }}
                />
            )}
        </View>
    )
}

export default ScreenScratchGameContainer
