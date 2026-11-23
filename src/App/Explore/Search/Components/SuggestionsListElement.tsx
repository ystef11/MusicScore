import { Image, StyleSheet } from 'react-native'

import { AppText, CommonTouchable, icons, layout } from '@mu-native/ds'

type Props = {
    suggestion: string
    onPress: (suggestion: string) => void
}

export const SuggestionsListItem = ({ suggestion, onPress }: Props) => {
    return (
        <CommonTouchable onPress={() => onPress(suggestion)} style={styles.container}>
            <Image source={icons.searchMd} />
            <AppText rawText={suggestion} font="f15w400" brandColor="contentPrimary" />
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: layout.baseMarginFromEdges,
    },
})
