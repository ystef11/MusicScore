import { TMuseI18n } from '../../core/types/libTypes'
import { Ti18nTranslation } from './i18nTypes'
import { i18nLocales, i18nLanguages } from '../lib/locales'

export type TI18n = TMuseI18n<
    Ti18nTranslation,
    (typeof i18nLocales)['values'][number],
    (typeof i18nLanguages)['values'][number]
>

type TKeys = keyof Ti18nTranslation

export type TI18nKey<TSelectedKeys extends TKeys> = Extract<TKeys, TSelectedKeys>
export type TI18nParams<TKey extends TKeys> = Ti18nTranslation[TKey]
