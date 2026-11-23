import { translate } from '@mu-native/locale'

import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

import { IconForwardElement } from '@mu-native/ds'

type Props = {
    onPress: () => void
    testID?: string
}

export const ActivityNotificationSettingsItem = ({ onPress, testID }: Props) => (
    <ProfileSettingsListItem
        {...(testID ? { testID } : {})}
        title={translate('native.my_profile.notification_settings_title')}
        text={translate('native.my_profile.notification_settings_subtitle')}
        onPress={onPress}
    >
        <IconForwardElement />
    </ProfileSettingsListItem>
)
