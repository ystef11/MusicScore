import { StyleSheet } from 'react-native'

import { AppText, CommonTouchable } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { Chevron } from './Chevron/Chevron.tsx'

export const ShowMoreButton = ({
    onPress,
    expanded,
    testID,
}: {
    onPress: () => void
    expanded: boolean
    testID?: string
}) => {
    return (
        <CommonTouchable testID={testID} style={styles.container} onPress={onPress}>
            <AppText
                rawText={
                    expanded
                        ? translate('native.ebook.filter_show_less')
                        : translate('native.ebook.filter_show_more')
                }
                font="f15w400"
            />
            <Chevron hidden={false} expanded={expanded} defaultState="down" />
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
        marginVertical: 12,
    },
})
