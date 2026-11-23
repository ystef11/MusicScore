import { PropsWithChildren, useRef } from 'react'
import { I18nProvider as I18nProviderDefault } from '../../core/react/I18nProvider'
import { i18n } from '../lib/i18n'
import { transitions } from '../translations'
import { TI18n } from '../types/libTypes'

export const I18nProvider = ({
    children,
    locale,
}: PropsWithChildren<{ locale: TI18n['locale'] }>) => {
    const isTranslationsLoadedRef = useRef(false)

    if (!isTranslationsLoadedRef.current) {
        i18n.load(transitions)
        isTranslationsLoadedRef.current = true
    }

    return <I18nProviderDefault locale={locale}>{children}</I18nProviderDefault>
}
