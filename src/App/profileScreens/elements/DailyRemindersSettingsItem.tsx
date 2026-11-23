import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

import { IconForwardElement } from '@mu-native/ds'

export const DailyRemindersSettingsItem = () => {
    const navigation = useAppNavigation()

    const onPress = () => navigation.navigate(Screen.userSetting, { mode: 'daily_reminder' })

    return (
        <ProfileSettingsListItem
            title={translate('native.my_profile.daily_reminder_settings_title')}
            text={translate('native.my_profile.daily_reminder_settings_subtitle')}
            onPress={onPress}
        >
            <IconForwardElement />
        </ProfileSettingsListItem>
    )
}
