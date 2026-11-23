import { getLocales } from 'react-native-localize'

import { i18nLocales } from '@muse/i18n'

export const locale =
    i18nLocales.values.find(locale => locale.includes(getLocales()?.[0].languageTag)) ||
    i18nLocales.values.find(locale => locale.includes(getLocales()?.[0].languageCode)) ||
    'en-US'
