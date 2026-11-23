import { memo } from 'react'

import { translate } from '@mu-native/locale'

import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

import { IconForwardElement } from '@mu-native/ds'

type TProfileUserPedalListItemProps = {
    onPress: () => void
    testID?: string
}

export const ProfileUserPedalListItem = memo(
    ({ onPress, testID }: TProfileUserPedalListItemProps) => {
        return (
            <ProfileSettingsListItem
                {...(testID ? { testID } : {})}
                title={translate('native.bluetooth_pedal.profile_title')}
                cornerTitle="βeta"
                text={translate('native.bluetooth_pedal.profile_subtitle')}
                onPress={onPress}
            >
                <IconForwardElement />
            </ProfileSettingsListItem>
        )
    },
)
