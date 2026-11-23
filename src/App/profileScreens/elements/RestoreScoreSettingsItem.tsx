import { useState } from 'react'

import { ListItem } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { billingThunks } from '@mu-native/marketing'
import { useActions } from '@ug/store'

export const RestoreScoreSettingsItem = () => {
    const [isRestoring, setRestoring] = useState(false)
    const actions = useActions({ restorePurchases: billingThunks.restorePurchases })

    const onRestorePress = async () => {
        setRestoring(true)
        await actions.restorePurchases({})
        setRestoring(false)
    }

    return (
        <ListItem
            title={translate('native.my_profile.restore_purchases_title')}
            subTitle={translate('native.settings_screen.restore_purchases_subtitle')}
            onPress={isRestoring ? () => null : onRestorePress}
        />
    )
}
