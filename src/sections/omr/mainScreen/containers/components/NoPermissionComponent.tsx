import { Linking, View } from 'react-native'

import { AppText, globalStyles, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { CloseLayerCircle } from './CloseLayerCircle.tsx'

export const NoPermissionComponent = ({ goBack }: { goBack: () => void }) => {
    const openSettings = () => {
        Linking.openSettings()
    }

    return (
        <View style={globalStyles.flex1FullWidthCenterPadding}>
            <CloseLayerCircle goBack={goBack} />
            <AppText
                adaptiveSize
                font="f24w600"
                textAlign="center"
                rawText={translate('native.screen_omr.no_camera_permission_message')}
                style={globalStyles.mb16}
            />
            <MuseButton
                size="large"
                onPress={openSettings}
                title={translate('native.screen_omr.open_settings')}
            />
        </View>
    )
}
