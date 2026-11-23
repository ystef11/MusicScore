import { memo } from 'react'
import { StyleProp, TextInput, TextStyle } from 'react-native'
import Animated, { SharedValue, useAnimatedProps } from 'react-native-reanimated'

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)
Animated.addWhitelistedNativeProps({ text: true })

type TReText = {
    text: SharedValue<number>
    textStyle: StyleProp<TextStyle>
}

const ReText = ({ text, textStyle }: TReText) => {
    const animatedProps = useAnimatedProps(() => {
        return { text: `${text.value}%` }
    })
    return (
        <AnimatedTextInput
            underlineColorAndroid="transparent"
            editable={false}
            style={textStyle}
            // @ts-ignore
            animatedProps={animatedProps}
        />
    )
}

export default memo(ReText)
