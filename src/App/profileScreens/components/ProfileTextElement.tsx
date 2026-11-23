import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { COLOR_GREY_400 } from '../../constants/styles'

const styles = StyleSheet.create({
    newContainer: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: 48,
        justifyContent: 'flex-start',
        alignSelf: 'center',
    },
    text: {
        fontSize: 14,
        lineHeight: 19,
        color: COLOR_GREY_400,
    },
})

type Props = {
    text: string
    children?: React.ReactNode
    onLongPress?: () => void
    testID?: string
}

const ProfileTextElement = ({ text, children, onLongPress, testID }: Props) => (
    <View style={styles.newContainer}>
        <Text
            {...(testID ? { testID } : {})}
            style={styles.text}
            onLongPress={onLongPress}
            suppressHighlighting
        >
            {text}
            &nbsp;
            {children}
        </Text>
    </View>
)

export default memo(ProfileTextElement)
