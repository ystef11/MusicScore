import { Linking } from 'react-native'

import reportEvent from './Analytics'
import { isOpenableUrl } from './isOpenableUrl'

export const openUrl = (url: string) => {
    if (!isOpenableUrl(url)) {
        reportEvent('Linking: error', { url })
        return
    }

    Linking.canOpenURL(url)
        .then(supported => {
            if (supported) {
                Linking.openURL(url)
            } else {
                reportEvent('Linking: error', { url })
            }
        })
        .catch(() => reportEvent('Linking: error', { url }))
}
