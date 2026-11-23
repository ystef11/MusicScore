import { StyleSheet, ViewStyle } from 'react-native'

import { AppText, brandColors, colors, CommonTouchable, SvgAsset } from '@mu-native/ds'
import { hubConstants, THub } from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'

import { getHubIcon } from '../../constants/expHubsIcons'

type Props = {
    hub: THub
    onPress: (hub: THub) => void
    testID?: string | undefined
    style?: ViewStyle
    colorText?: keyof typeof colors
}

export const Hub = ({ hub, onPress, testID, style, colorText = 'text900' }: Props) => {
    const onHubPress = () => onPress(hub)
    let icon = getHubIcon(hub.imageBase, 'B')
    if (icon === 'ic_hub_video_game_tv') {
        icon = 'ic_hub_video_game_tv_2'
    }
    const translateKey = hubConstants.getTranslateKey(hub.title)
    const translation = translate(translateKey)
    const hubTitle = translation.includes('missing') ? hub.title : translation

    return (
        <CommonTouchable
            activeOpacity={0.9}
            testID={testID}
            onPress={onHubPress}
            style={[expStyles.hubCard2, style] as any}
        >
            {typeof icon === 'string' && <SvgAsset type={icon} style={expStyles.hubImage} />}
            <AppText
                font="f15w400"
                oldColor={colorText}
                style={expStyles.hubTitle}
                numberOfLines={1}
                rawText={hubTitle}
            />
        </CommonTouchable>
    )
}

const expStyles = StyleSheet.create({
    hubCard2: {
        flexDirection: 'row',
        paddingRight: 12,
        backgroundColor: brandColors.backgroundHighlight,
        borderRadius: 24,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    hubTitle: {
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    hubImage: {
        width: 48,
        height: 48,
        borderRadius: 12,
    },
})
