import { createContext } from 'react'
import { TMuseI18nDefault } from '../types/libTypes'
import { i18n } from '../lib/i18n'

export const MuseI18nContext = createContext<Omit<TMuseI18nDefault, 'activate' | 'load'>>(i18n)
