import { Image, ImageSourcePropType, Text, View } from 'react-native'

import { colors, CommonTouchable } from '@mu-native/ds'

import { styles } from './styles'

type Props = {
    source: ImageSourcePropType
    onPress: () => void
    text: string
    isActive?: boolean
}

export const FeedCommentButton = ({ onPress, text, source, isActive }: Props) => {
    const { textStyle, icon } = styles
    const activeIconStyles = {
        tintColor: colors.link,
    }
    const activeTextStyles = {
        color: colors.link,
    }
    return (
        <CommonTouchable onPress={onPress}>
            <View style={styles.btnContainer}>
                <Image source={source} style={[icon, isActive ? activeIconStyles : {}]} />
                <Text style={[textStyle, isActive ? activeTextStyles : {}]}>{text}</Text>
            </View>
        </CommonTouchable>
    )
}
