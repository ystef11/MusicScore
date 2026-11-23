import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { translate } from '@mu-native/locale'

import { COLOR_DEEP_BLUE, MAX_TABLET_WIDTH } from '../constants/styles'

const styles = StyleSheet.create({
    container: {
        maxWidth: MAX_TABLET_WIDTH / 2,
        flexDirection: 'column',
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: 36,
        paddingHorizontal: 52,
    },
    text: {
        paddingVertical: 6,
        fontSize: 16,
        lineHeight: 21,
        textAlign: 'center',
        color: COLOR_DEEP_BLUE,
    },
})

const EmptySearchFilterElement = () => (
    <View style={styles.container}>
        <Text style={styles.text}>{translate('native.new_search.empty_condition.top_string')}</Text>
        <Text style={styles.text}>{translate('native.new_search.empty_condition.bottom_string')}</Text>
    </View>
)

export default memo(EmptySearchFilterElement)
