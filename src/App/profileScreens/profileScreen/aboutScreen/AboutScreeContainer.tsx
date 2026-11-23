import { useLayoutEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { device } from '@mu-native/common'
import { colors, layout, RootViewScreenComponent, SvgAsset } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { xtz } from '@mu-native/xtz'

import { NavHeader } from '../../../Components/NavHeader/NavHeader.tsx'

const { appName } = device
const appVersion = `${device.appVersion} (${device.buildNumber})`

export const AboutScreenContainer = () => {
    const { setOptions, navigate } = useAppNavigation()

    useLayoutEffect(() => {
        setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => (
                <NavHeader
                    headerTitle={translate('native.screens_titles.about_screen')}
                    noNotifications
                />
            ),
        })
    }, [])

    const onOpenDevMenu = () => {
        navigate(Screen.engineerMenu)
    }

    return (
        <RootViewScreenComponent>
            <View style={styles.container}>
                <SvgAsset style={styles.logoMS} type="ic_logo" />
                <Text style={styles.appNameText}>{appName}</Text>
                <Text style={styles.generalText}>
                    {translate('native.about_screen.made_by', { version: appVersion })}
                </Text>
                <Text
                    testID="About musescore bvba"
                    style={styles.generalText}
                    onLongPress={onOpenDevMenu}
                    suppressHighlighting
                >
                    © 2017 Musescore BVBA
                </Text>
                <Text style={styles.generalText}>
                    {translate('native.about_screen.powered_by', { version: xtz.version })}
                </Text>
            </View>
        </RootViewScreenComponent>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: layout.marginMd,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    logoMS: {
        alignItems: 'stretch',
    },
    appNameText: {
        fontSize: 18,
        lineHeight: layout.marginLg,
        fontWeight: 'bold',
        color: colors.text900,
        paddingVertical: layout.marginMd,
    },
    generalText: {
        color: colors.text900,
        fontSize: 14,
        textAlign: 'center',
        paddingVertical: layout.marginMd,
    },
})
