import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, layout, layoutHelpers, MuseButton, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    pedalSettingItemContainer: style.view({
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    }),
    settingTitle: {
        maxWidth: '70%',
    },
    disabledText: {
        maxWidth: '50%',
    },
})

const arrowKeys = {
    UIKeyInputLeftArrow: '←',
    UIKeyInputRightArrow: '→',
    UIKeyInputDownArrow: ' ↓',
    UIKeyInputUpArrow: '↑',
}

type TPedalSettingItem = {
    settingTitle: string
    keySetting: string
    pedalKeyValue: string
    isSetupMode: boolean
    onPressSetupKey: (key: string) => void
}

const PedalSettingItem = ({
    settingTitle,
    isSetupMode,
    keySetting,
    onPressSetupKey,
    pedalKeyValue,
}: TPedalSettingItem) => {
    const onPressSetup = () => {
        onPressSetupKey(keySetting)
    }

    const assignedValue = arrowKeys[pedalKeyValue as keyof typeof arrowKeys] || pedalKeyValue

    const renderAction = () => {
        if (isSetupMode) {
            return (
                <AppText
                    font="f16w400"
                    brandColor="contentInactive"
                    style={styles.disabledText}
                    rawText={translate('native.bluetooth_pedal.press')}
                />
            )
        }
        if (assignedValue) {
            return (
                <MuseButton
                    type="tertiaryUnderlined"
                    size="small"
                    title={assignedValue}
                    onPress={onPressSetup}
                />
            )
        }
        return (
            <MuseButton
                type="tertiaryUnderlined"
                size="small"
                title={translate('native.bluetooth_pedal.set')}
                onPress={onPressSetup}
            />
        )
    }

    return (
        <View style={styles.pedalSettingItemContainer}>
            <AppText
                font="f16w400"
                brandColor="contentPrimary"
                style={styles.settingTitle}
                rawText={settingTitle}
            />
            {renderAction()}
        </View>
    )
}

export default memo(PedalSettingItem)
