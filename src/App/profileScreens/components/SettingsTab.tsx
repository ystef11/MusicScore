import { useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { layout, layoutHelpers } from '@mu-native/ds'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import APP_VERSION from '../../appVersion.ts'

import ProfileFeedbackList from './ProfileFeedbackList.tsx'
import { ProfileSettingsList } from './ProfileSettingsList.tsx'
import ProfileTextElement from './ProfileTextElement.tsx'

const styles = StyleSheet.create({
    containerStyle: {
        marginHorizontal: layout.baseMarginFromEdges,
        paddingTop: layoutHelpers.getResponsiveSizeExtended(20),
    },
})

export const SettingsTab = () => {
    const navigation = useAppNavigation()

    const openAboutScreen = useCallback(() => {
        navigation.navigate(Screen.about)
    }, [])

    return (
        <View style={styles.containerStyle}>
            <ProfileSettingsList testID="Profile settings" />
            <ProfileFeedbackList />
            <ProfileTextElement
                testID="Profile musescore version"
                text={`MuseScore ${APP_VERSION}`}
                onLongPress={openAboutScreen}
            />
        </View>
    )
}
