import { ReactNode } from 'react'

import { I18nProvider } from '@muse/i18n'

import { locale } from '../constants/locale.ts'

export const LocaleSetupHoc = ({ children }: { children: ReactNode }) => {
    return <I18nProvider locale={locale}>{children}</I18nProvider>
}
