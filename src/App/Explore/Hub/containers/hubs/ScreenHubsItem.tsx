import { Image, StyleSheet } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, SvgAsset } from '@mu-native/ds'
import { hubConstants, THub } from '@mu-native/hub-common'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { translate } from '@mu-native/locale'

import { getHubIcon } from '../../../../constants/expHubsIcons'

type Props = {
    hub: THub
    onPress: (hub: THub) => void
    testID?: string | undefined
    isAuthorized: boolean
}

export const ScreenHubsItem = ({ hub, onPress, testID, isAuthorized }: Props) => {
    const noAuthIcon =
        hub.imageBase === 'icon-top-100-view' && !isAuthorized
            ? getHubIcon('icon-selected-for-you', 'B')
            : getHubIcon(hub.imageBase, 'B')

    const translateTitle = translate(hubConstants.getTranslateKey(hub.title)).includes('missing')
        ? hub.title
        : translate(hubConstants.getTranslateKey(hub.title))

    const noAuthTitle =
        hub.imageBase === 'icon-top-100-view' && !isAuthorized
            ? translate('native.hub_popular.noAuthTitle')
            : translateTitle

    return (
        <CommonTouchable
            testID={testID}
            style={styles.hubContainer}
            onPress={() => onPress && onPress(hub)}
        >
            {typeof noAuthIcon !== 'string' && <Image source={noAuthIcon} style={styles.hubIcon} />}
            {typeof noAuthIcon === 'string' && (
                <SvgAsset type={noAuthIcon} style={styles.hubIcon} />
            )}
            <AppText
                font="f15w400"
                ellipsizeMode="tail"
                numberOfLines={1}
                style={styles.flex}
                rawText={noAuthTitle}
            />
            <Icon source={chevronRight} size={24} tint={brandColors.contentSecondary} />
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    hubContainer: {
        height: 48,
        width: '100%',
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 12,
    },

    hubIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginEnd: 12,
        overflow: 'hidden',
    },

    flex: {
        flex: 1,
    },
})
