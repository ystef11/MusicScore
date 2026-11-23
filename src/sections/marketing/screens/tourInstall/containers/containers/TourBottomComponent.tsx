import { memo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'

import { globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { BuyButton } from '@mu-native/marketing'

// BuyButton anchors itself with position:absolute, which lands it outside this
// wrapper's (zero-height) bounds. Android then drops it from hit-testing and
// from the accessibility tree — unreachable for Detox and TalkBack alike, though
// still drawn. Move the anchoring up here so the button stays inside its parent.
const styles = StyleSheet.create({
    anchor: { position: 'absolute', bottom: 0, left: 0, right: 0 },
    inFlow: { position: 'relative' },
})

type TTourBottomComponentProps = {
    onPress: () => void
    disabled?: boolean
    styleContainer?: StyleProp<ViewStyle>
    testID: string
    textAboveButton?: string
}

const TourBottomComponent = ({
    onPress = () => null,
    disabled = false,
    styleContainer,
    testID,
    textAboveButton = '',
}: TTourBottomComponentProps) => (
    <Animated.View
        style={[globalStyles.fullWidth, styles.anchor, styleContainer]}
        entering={FadeIn.duration(600)}
    >
        <BuyButton
            customStyleContainer={styles.inFlow}
            testID={testID}
            textAboveButton={textAboveButton}
            buttonText={translate('native.marketing.continue')}
            onBuyPress={onPress}
            isDisabledButton={disabled}
        />
    </Animated.View>
)
export default memo(TourBottomComponent)
