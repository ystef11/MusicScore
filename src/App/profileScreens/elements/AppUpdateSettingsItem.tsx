import { Platform } from 'react-native'
import { IconForwardElement } from '@mu-native/ds'
import { checkAppUpdates } from '../../Services/AppUpdates'
import ProfileSettingsListItem from '../components/ProfileSettingsListItem'

export const AppUpdateSettingsItem = () => Platform.OS === 'android' ? (
    <ProfileSettingsListItem
        title="Проверить обновления"
        text="Последний APK MusicScore на GitHub"
        onPress={() => { void checkAppUpdates() }}
        testID="Profile check updates"
    >
        <IconForwardElement />
    </ProfileSettingsListItem>
) : null
