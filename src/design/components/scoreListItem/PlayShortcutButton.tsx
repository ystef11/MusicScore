import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { brandColors } from '@mu-native/ds/constants/new/brandColors.ts'
import { play } from '@mu-native/icons/play'
import { translate } from '@mu-native/locale/i18n'

import { CommonTouchable } from '../../elements/CommonTouchable.tsx'
import { AppText } from '../AppText/AppText'
import Icon from '../Icon/Icon'

type Props = {
    onPress: () => void
    testID?: string
    style?: StyleProp<ViewStyle>
}

const OVERLAY_BACKGROUND = 'rgba(0, 0, 0, 0.05)'

export const PlayShortcutButton = ({ onPress, testID, style }: Props) => (
    <CommonTouchable
        onPress={onPress}
        isHapticEnabled
        style={[styles.container, style]}
        testID={testID}
    >
        <Icon
            source={play}
            size={8}
            tint="white"
            style={[styles.playButton, { backgroundColor: brandColors.accentPrimary }]}
        />
        <AppText
            font="f15w400"
            brandColor="contentPrimary"
            rawText={translate('native.score.play_button')}
        />
    </CommonTouchable>
)

const styles = StyleSheet.create({
    container: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        height: 24,
        paddingLeft: 8,
        paddingRight: 12,
        borderRadius: 9999,
        backgroundColor: OVERLAY_BACKGROUND,
        marginTop: 8,
    },

    playButton: {
        width: 16,
        height: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 100,
    },
})
