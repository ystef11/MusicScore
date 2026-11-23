import { StyleSheet, View, ViewStyle } from 'react-native'

import { COLOR_WHITE } from '../constants/styles'

type Props = {
    children: any
    style?: ViewStyle
}

const ScreenLayoutWrapperElement = ({ style, ...props }: Props) => (
    <View {...props} style={[styles.container, style]} />
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR_WHITE,
    },
})

export default ScreenLayoutWrapperElement
