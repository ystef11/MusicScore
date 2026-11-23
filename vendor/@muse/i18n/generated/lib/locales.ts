const i18nLocalesMap = { frFR: 'fr-FR' , deDE: 'de-DE' , elGR: 'el-GR' , jaJP: 'ja-JP' , koKR: 'ko-KR' , esES: 'es-ES' , enUS: 'en-US' } as const

export const i18nLocales = {
    ...i18nLocalesMap,
    get values() {
        return Object.values(i18nLocalesMap)
    },
    default: i18nLocalesMap.enUS,
} as const

const i18nLangMap = { fr: 'fr' , de: 'de' , el: 'el' , ja: 'ja' , ko: 'ko' , es: 'es' , en: 'en' } as const

export const i18nLanguages = {
    ...i18nLangMap,
    get values() {
        return Object.values(i18nLangMap)
    },
    default: i18nLangMap.en,
} as const        
