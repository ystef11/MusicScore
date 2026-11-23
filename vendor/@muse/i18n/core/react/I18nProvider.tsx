import { i18n as linguiI18n } from '@lingui/core'
import { PropsWithChildren, useSyncExternalStore } from 'react'
import { TLocale } from '../types/libTypes'
import { i18n as i18nLib } from '../lib/i18n'
import { MuseI18nContext } from './i18nContext'

type TMuseProviderProps = {
    /**
     * target locale
     */
    locale: TLocale
}

const subscribe: Parameters<typeof useSyncExternalStore>[0] = onStoreChange => {
    linguiI18n.on('change', onStoreChange)
    return () => {
        linguiI18n.removeListener('change', onStoreChange)
    }
}

const getSnapshot = () => i18nLib

export const I18nProvider = ({ locale, children }: PropsWithChildren<TMuseProviderProps>) => {
    const i18n = useSyncExternalStore(subscribe, getSnapshot)

    if (i18n.locale !== locale) {
        i18n.activate(locale)
    }

    return <MuseI18nContext.Provider value={i18n}>{children}</MuseI18nContext.Provider>
}
