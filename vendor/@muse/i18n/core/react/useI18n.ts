import { useContext } from 'react'
import { MuseI18nContext } from './i18nContext'
import { TMuseI18nDefault } from '../types/libTypes'

export const useI18n = <TI18n extends TMuseI18nDefault>() => useContext(MuseI18nContext) as TI18n
