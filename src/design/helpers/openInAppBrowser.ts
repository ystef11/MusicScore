import { openBrowser } from '@swan-io/react-native-browser'

import { colors } from '../constants/colors'

export const openInAppBrowser = (url: string) =>
    openBrowser(url, {
        // iOS Properties
        barTintColor: colors.blue800,
        animationType: 'slide', // "fade" | "slide" (default to "slide")
        dismissButtonStyle: 'close', // "cancel" | "close" | "done" (default to "close")
        controlTintColor: 'white',
    })
