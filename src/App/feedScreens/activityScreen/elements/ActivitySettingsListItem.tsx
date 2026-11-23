import { profileTestIds } from '@mu/mu-mobile-test-id'
import { TActivitySetting, activityThunkActions } from '@mu-native/activity'
import { BrandSwitcherListCell } from '@mu-native/ds'
import { useActions } from '@ug/store'

const ActivitySettingsListItem = ({ text, value, verb }: TActivitySetting) => {
    const actions = useActions({ onValueChange: activityThunkActions.toggleActivitySetting })
    const onValueChange = () => actions.onValueChange(verb)

    return (
        <BrandSwitcherListCell
            title={text ?? ''}
            switchValue={value}
            onSwitchChange={onValueChange}
            testID={profileTestIds.settingsScreen.activitySwitch(verb)}
        />
    )
}

export default ActivitySettingsListItem
