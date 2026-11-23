import { setTestIds } from '@mu/mu-mobile-test-id'
import { NavigationIconButton, presentBottomSheetAlert } from '@mu-native/ds'
import { trashBin } from '@mu-native/icons/trashBin'
import { translate } from '@mu-native/locale'

import MetricaEvents from '../../../constants/MetricaEvents'
import reportEvent from '../../../Utils/Analytics'

type TParams = {
    titleSet: string
    onDeleteSet: () => void
    setId: number
}

export const SetDeleteButton = ({ titleSet, onDeleteSet, setId }: TParams) => {
    const onDeletePress = async () => {
        reportEvent(MetricaEvents.SET_DELETE_CLICK, {
            item: 'set',
            item_id: setId,
        })
        const buttonId = await presentBottomSheetAlert({
            rawTitle: translate('native.sets.be_careful_warning'),
            rawMessage: translate('native.sets.delete_set', { setName: titleSet }),
            cancelable: true,
            buttons: [
                {
                    rawText: translate('native.sets.delete_set_button'),
                    style: 'destructive',
                    id: 'delete',
                },
            ],
        })
        if (buttonId === 'delete') onDeleteSet()
    }
    return (
        <NavigationIconButton
            icon={trashBin}
            onPress={onDeletePress}
            testID={setTestIds.actions.deleteSetButton}
        />
    )
}
