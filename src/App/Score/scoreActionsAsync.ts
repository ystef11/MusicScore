import { findSavedWebScoreFile, findWebScoreFile } from '../Services/WebScoreProvider'
import { MSOfflineScoreT } from '../Model/MSOfflineScore'
import type { MSScoreT } from '../Model/MSScore'
import * as ScoreInfoProvider from '../Services/ScoreInfoProvider'

export async function getLocalFileUrl(score: MSOfflineScoreT | MSScoreT, isOffline?: boolean) {
    const offline = isOffline ?? score.isOffline
    if (offline && !score.isPdf) {
        const saved = await findSavedWebScoreFile(score.id)
        if (saved) return saved
    }
    if (!offline && !score.isPdf) {
        const webFile = await findWebScoreFile(score.id, 'revision' in score ? score.revision : 0)
        if (webFile) return webFile
    }
    return ScoreInfoProvider.getExistingScoreUrl(score.id, offline)
}

export async function isExportToPdfRestrictedWithinTrial(scoreId: number): Promise<boolean> {
    return ScoreInfoProvider.hasScoreRestriction(scoreId, 'EXPORT_PDF_FOR_PAYERS_ONLY')
}
