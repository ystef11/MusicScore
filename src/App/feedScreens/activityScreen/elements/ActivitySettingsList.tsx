import { View } from 'react-native'

import { TActivitySetting } from '@mu-native/activity'

import ActivitySettingsListItem from './ActivitySettingsListItem'

type IActivitySettingsListProps = {
    settings: TActivitySetting[]
}

const ActivitySettingsList = ({ settings }: IActivitySettingsListProps) => {
    return (
        <View>
            {settings?.map(setting => {
                return <ActivitySettingsListItem {...setting} key={setting.text} />
            })}
        </View>
    )
}

export default ActivitySettingsList
