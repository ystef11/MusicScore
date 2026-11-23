import { StyleSheet, Text, View } from 'react-native'

import { colors, CommonTouchable, IconForwardElement } from '@mu-native/ds'
import { hqSoundfontThunkActions } from '@mu-native/hq-soundfont'
import { translate } from '@mu-native/locale'
import { useActions } from '@ug/store'

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
    },
    leftColumn: {
        flex: 1,
        paddingRight: 12,
    },
    newSettingsRowTitle: {
        marginBottom: 2,
        fontSize: 14,
        lineHeight: 20,
        color: colors.text900,
    },
    newSettingsRowText: {
        fontSize: 12,
        lineHeight: 16,
        color: colors.gray500,
        marginTop: 2,
    },
})

const SFGeneralSettingsProfileComponent = ({ testID }: { testID?: string }) => {
    const actions = useActions({
        openHQSettings: hqSoundfontThunkActions.openHQSettings,
    })

    return (
        <CommonTouchable
            testID={testID}
            onPress={actions.openHQSettings}
            activeOpacity={1}
            style={styles.row}
        >
            <View style={styles.leftColumn}>
                <Text style={styles.newSettingsRowTitle}>
                    {translate('native.my_profile.hq_sound_settings_title')}
                </Text>
                <Text style={styles.newSettingsRowText}>
                    {translate('native.my_profile.hq_sound_settings_subtitle')}
                </Text>
            </View>
            <IconForwardElement />
        </CommonTouchable>
    )
}

export default SFGeneralSettingsProfileComponent
