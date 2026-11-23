import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { brandColors } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { BuyButton } from '@mu-native/marketing'

const styles = StyleSheet.create({
    firstStepTextButtonStyle: {
        color: brandColors.accentPrimary,
    },
    border: { borderTopWidth: 0 },
})

type ITourUpdateBottomElementProps = {
    text?: string
    onNextPress: () => void
    isFirstStep: boolean
    isShowCloseTourButton?: boolean
    onCloseTour?: () => void
    textAboveButton?: string
}

const TourUpdateBottomElement = ({
    text,
    onNextPress,
    isFirstStep,
    onCloseTour,
    isShowCloseTourButton = false,
    textAboveButton = '',
}: ITourUpdateBottomElementProps) => {
    return (
        <BuyButton
            textAboveButton={textAboveButton}
            buttonText={text}
            customButtonTextStyle={isFirstStep && styles.firstStepTextButtonStyle}
            onBuyPress={onNextPress}
            customStyleContainer={styles.border}
            onCloseAndDismissPage={isShowCloseTourButton ? onCloseTour : undefined}
            customDismissText={translate('native.screen_notifications.dismiss')}
        />
    )
}

export default memo(TourUpdateBottomElement)
