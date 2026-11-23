import { createStorage } from '@muse-native/mmkv'

export type TGlobalStorage = {
    currentUserId: number | null | undefined
    filterShowcased: boolean
    authShowedAfterMigration: boolean
    initRTAttributes: string
    isShowAnalyticsParams: boolean
    referer: string
    isDeepLinkEnabled: boolean
    isHideResponseLogs: boolean
    isDeepLinkWasOpen: boolean
    crashName: string
    deeplinkData: {
        link: string
        data: Record<string, string>
        isDeferred: boolean
    }
    migratedDailyReminderEnabled: boolean
    isKoreanFontDownloaded: boolean
}

export const globalStorage = createStorage<TGlobalStorage>()
