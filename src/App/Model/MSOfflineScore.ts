import { translate } from '@mu-native/locale'
import isNumber from 'lodash.isnumber'

export type MSOfflineScoreT = {
    offline: 'offline'
    id: number
    isOffline: boolean
    revision?: number
    webScoreSaved?: boolean
    catalogScoreId?: number
    importedFromArchive?: boolean
    title: string
    source: Record<string, any> | undefined
    subtitle: string
    previewImageUrl: string | null | undefined
    dateUpdated: number
    lastTouchedAt: number
    isPurchased?: boolean
    idAnalytics?: string
    isOfficial?: boolean
    isPdf?: boolean
    authorId?: number
    authorName?: string
    isAiScan?: boolean
}

export function createMSOfflineScore({
    id,
    title,
    isAiScan,
    authorName,
    source,
    options,
}: Pick<MSOfflineScoreT, 'id' | 'title' | 'source' | 'authorName' | 'isAiScan'> & {
    options: Record<string, any>
}): MSOfflineScoreT {
    return {
        offline: 'offline',
        isOffline: true,
        revision: options.revision,
        webScoreSaved: options.webScoreSaved,
        catalogScoreId: options.catalogScoreId,
        importedFromArchive: options.importedFromArchive,
        id,
        title: title || id.toString(),
        source,
        subtitle: options.subtitle,
        previewImageUrl: options.previewImageUrl,
        isPurchased: source?.isPurchased,
        dateUpdated: Date.now(),
        lastTouchedAt: Date.now(),
        idAnalytics: options.idAnalytics,
        isOfficial: options.isOfficial,
        isPdf: options.isPdf,
        authorId: options.authorId,
        authorName,
        isAiScan,
    }
}

export function fromExtasyMetaData(
    scoreId: number,
    scoreMetaData: Record<string, any> | undefined,
): MSOfflineScoreT {
    // const { name, title, parts, partsCount, composer, arranger, fileName } = scoreMetaData
    let subtitle

    if (Array.isArray(scoreMetaData?.parts) && scoreMetaData?.parts?.length) {
        subtitle = `${scoreMetaData?.name} • ${translate('native.score.parts_count', {
            count: scoreMetaData?.parts?.length,
        })}`
    } else if (scoreMetaData?.partsCount && isNumber(scoreMetaData?.partsCount)) {
        subtitle = `${
            scoreMetaData?.composer ||
            scoreMetaData?.arranger ||
            scoreMetaData?.title ||
            scoreMetaData?.fileName
        } • ${translate('native.score.parts_count', { count: scoreMetaData?.partsCount })}`
    } else {
        subtitle = `${scoreMetaData?.name}`
    }

    const titleOfLocalFile = scoreMetaData?.title || scoreMetaData?.fileName || scoreMetaData?.name

    return createMSOfflineScore({
        id: scoreId,
        title: titleOfLocalFile,
        authorName: scoreMetaData?.isAiScan
            ? translate('native.screen_omr.recognized_via_ai_scan')
            : '',
        isAiScan: scoreMetaData?.isAiScan,
        source: scoreMetaData,
        options: {
            subtitle,
            previewImageUrl: scoreMetaData?.previewImageUrl,
            idAnalytics: scoreMetaData?.idAnalytics,
        },
    })
}
