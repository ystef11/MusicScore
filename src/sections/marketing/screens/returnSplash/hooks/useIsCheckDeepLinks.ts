import { useEffect } from 'react'
import { Linking } from 'react-native'

import { translate } from '@mu-native/locale'

/* eslint-disable import/no-relative-packages */
import { showAlertNotification } from '../../../../../App/Elements/NewAlertNotifications.tsx'

export const useIsCheckDeepLinks = (goBack: () => void, isPro: boolean) => {
    useEffect(() => {
        ;(async () => {
            const link = await Linking.getInitialURL()
            if (link && link.includes('pro_offer') && isPro) {
                goBack()
                showAlertNotification({
                    text: translate('native.marketing.already_have_pro'),
                })
            }
        })()
    }, [])
}
