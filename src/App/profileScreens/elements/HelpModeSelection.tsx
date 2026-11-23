import { StyleSheet, Text, View } from 'react-native'

import { translate } from '@mu-native/locale'

import { COLOR_DEEP_BLUE, MARGIN_LG, MARGIN_MD } from '../../constants/styles'

import { HelpMode } from './HelpMode'

const styles = StyleSheet.create({
    container: {
        padding: MARGIN_LG,
    },
    title: {
        fontWeight: '500',
        fontSize: 20,
        lineHeight: 23,
        color: COLOR_DEEP_BLUE,
        paddingBottom: MARGIN_MD,
    },
})

export const HelpModeSelection = (props: any) => {
    const { showConversations, showHelpCenter } = props
    const helpModes = [
        {
            title: translate('native.help_center.step_first.variants.first'),
            onPress: showHelpCenter,
        },
        {
            title: translate('native.help_center.step_first.variants.second'),
            onPress: showConversations,
        },
    ]
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate('native.help_center.step_first.title')}</Text>
            {helpModes?.map(props => <HelpMode {...props} key={props.title} />)}
        </View>
    )
}
