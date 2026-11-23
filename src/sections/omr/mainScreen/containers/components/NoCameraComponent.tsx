import { View } from 'react-native'

import { AppText, globalStyles } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { CloseLayerCircle } from './CloseLayerCircle.tsx'

export const NoCameraComponent = ({ goBack }: { goBack: () => void }) => {
    return (
        <View style={globalStyles.flex1FullWidthCenterPadding}>
            <CloseLayerCircle goBack={goBack} />
            <AppText
                adaptiveSize
                font="f24w600"
                textAlign="center"
                rawText={translate('native.screen_omr.no_camera_message')}
            />
        </View>
    )
}
