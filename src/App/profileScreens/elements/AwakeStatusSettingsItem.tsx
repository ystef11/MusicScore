import { profileTestIds } from '@mu/mu-mobile-test-id'
import { translate } from '@mu-native/locale'

import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

import { Switch } from '@mu-native/ds'

type Props = {
    screenShouldBeAwake: boolean
    changeAwakeStatus: (value: boolean) => void
}

export const AwakeStatusSettingsItem = ({ screenShouldBeAwake, changeAwakeStatus }: Props) => (
    <ProfileSettingsListItem
        title={translate('native.my_profile.stay_awake_switch_title')}
        text={translate('native.my_profile.stay_awake_switch_subtitle')}
    >
        <Switch
            value={screenShouldBeAwake}
            onValueChange={changeAwakeStatus}
            testID={profileTestIds.profileSettings.stayAwakeSwitch}
        />
    </ProfileSettingsListItem>
)
