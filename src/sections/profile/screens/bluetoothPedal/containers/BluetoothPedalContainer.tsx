import React, { useCallback, useEffect, useState } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import KeyEvent from 'react-native-keyevent'

import { profileTestIds } from '@mu/mu-mobile-test-id'
import { brandColors, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { mainAppScreens, useAppNavigation } from '@mu-native/navigation'
import { PedalSettings, scoreStoreChunk } from '@mu-native/score'
import { useActions, useValues } from '@ug/store'

/* eslint-disable import/no-relative-packages */
import { NavHeader } from '../../../../../App/Components/NavHeader/NavHeader'
import MetricaEvents from '../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../App/Utils/Analytics'

import FeedbackButton from './components/FeedbackButton'
import InstructionConnectBlock from './components/InstructionConnectBlock'
import PedalSettingItem from './components/PedalSettingItem'

const styles = StyleSheet.create({
    bluetoothPedalContainer: style.view({
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
        width: '100%',
        alignItems: 'center',
    }),
})

const pedalKeys = [
    {
        key: PedalSettings.nextPage,
        title: translate('native.bluetooth_pedal.next_page'),
        isSetupMode: false,
    },
    {
        key: PedalSettings.prevPage,
        title: translate('native.bluetooth_pedal.prev_page'),
        isSetupMode: false,
    },
    {
        key: PedalSettings.playPause,
        title: translate('native.bluetooth_pedal.play'),
        isSetupMode: false,
    },
    {
        key: PedalSettings.autoScroll,
        title: translate('native.bluetooth_pedal.autoscroll'),
        isSetupMode: false,
    },
]

const osName =
    Platform.select({
        ios: 'iOS',
        android: 'Android',
    }) || ''

const instructionsData = [
    translate('native.bluetooth_pedal.instruction_1_with_os', { osName }),
    translate('native.bluetooth_pedal.instruction_2'),
    translate('native.bluetooth_pedal.instruction_3'),
    translate('native.bluetooth_pedal.instruction_4'),
    translate('native.bluetooth_pedal.instruction_5'),
]

const BluetoothPedalContainer = () => {
    const [activeKey, setActiveKey] = useState('')
    const [pedalKeysData, setPedalKeysData] = useState(pedalKeys)

    const { navigate, setOptions } = useAppNavigation()
    const [pedalSettings] = useValues([scoreStoreChunk.props.getPedalSettings])
    const { resetPedalSettingsCustom, setPedalSettings } = useActions({
        resetPedalSettingsCustom: scoreStoreChunk.actions.resetPedalSettingsCustom,
        setPedalSettings: scoreStoreChunk.actions.setPedalSettingsCustom,
    })

    React.useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    testID={profileTestIds.pedalScreen.back}
                    headerTitle={translate('native.bluetooth_pedal.profile_title')}
                    onResetPress={resetPedalSettingsCustom}
                    noNotifications
                />
            ),
        })
    }, [])

    const onKeyUpAction = (event: Record<string, string>) => {
        reportEvent('Pedal Handler', {
            eventData: JSON.stringify(event),
        })
        const currentCode = event?.keyCode ? event?.keyCode?.toString() : event?.pressedKey

        if (activeKey && currentCode) {
            setPedalSettings({
                activeKey,
                activeCode: currentCode,
            })
            setActiveKey('')
            setPedalKeysData(prevState =>
                prevState.map(item => (item.isSetupMode ? { ...item, isSetupMode: false } : item)),
            )
            reportEvent(MetricaEvents.PROFILE_PEDAL_SETUP_SUCCESS, {
                value: activeKey,
            })
        }
    }

    useEffect(() => {
        KeyEvent.onKeyUpListener(onKeyUpAction)

        return () => {
            KeyEvent.removeKeyUpListener()
        }
    }, [activeKey, pedalSettings])

    useEffect(() => {
        reportEvent(MetricaEvents.PROFILE_PEDAL_SETUP_VIEW)
    }, [])

    const onPressSetupKey = useCallback((keyName: string) => {
        setPedalKeysData(prevState =>
            prevState.map(item => {
                if (item.isSetupMode) return { ...item, isSetupMode: false }
                return item.key === keyName ? { ...item, isSetupMode: item.key === keyName } : item
            }),
        )
        setActiveKey(keyName)
        reportEvent(MetricaEvents.PROFILE_PEDAL_SETUP_CLICK, {
            value: keyName,
        })
    }, [])

    const onGoToFeedbackScreen = useCallback(() => {
        navigate(mainAppScreens.pedalFeedback)
    }, [])

    return (
        <View style={styles.bluetoothPedalContainer}>
            {pedalKeysData.map(({ key, isSetupMode, title }) => (
                <PedalSettingItem
                    key={key}
                    keySetting={key}
                    settingTitle={title}
                    isSetupMode={isSetupMode}
                    pedalKeyValue={pedalSettings[key] || ''}
                    onPressSetupKey={onPressSetupKey}
                />
            ))}
            <FeedbackButton onGoToFeedbackScreen={onGoToFeedbackScreen} />
            <InstructionConnectBlock instructionData={instructionsData} />
        </View>
    )
}

export default BluetoothPedalContainer
