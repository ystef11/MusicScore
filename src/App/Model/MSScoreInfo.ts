import type { TScoreInfoDto } from '@mu-native/api'

import type { MSScoreT } from './MSScore'
import MSScore from './MSScore'

type TSourceDataCheck = { type: 'valid'; data: TScoreInfoDto } | { type: 'invalid'; error: string }

export default class MSScoreInfo {
    urls: Record<string, string>

    score: MSScoreT

    constructor(apiResponse: TScoreInfoDto) {
        this.urls = apiResponse.urls
        this.score = new MSScore(apiResponse)
    }

    get encrypted() {
        return !!this.fileUrl('mscze')
    }

    get revision() {
        return this.score.revision
    }

    fileUrl(fileType: string): string {
        return this.urls[fileType]
    }

    static processSourceData(apiResponse: unknown): MSScoreInfo | string {
        const check = MSScoreInfo.isSourceDataValid(apiResponse)
        if (check.type === 'invalid') return check.error
        return new MSScoreInfo(check.data)
    }

    static isSourceDataValid(apiResponse: unknown): TSourceDataCheck {
        const candidate = apiResponse as Partial<TScoreInfoDto> | null | undefined
        if (!candidate?.urls) return { type: 'invalid', error: 'noUrlsInResponse' }

        const hasFileUrl = candidate.is_pdf ? !!candidate.urls.pdfe : !!candidate.urls.mscze

        if (!hasFileUrl) return { type: 'invalid', error: 'noMsczOrMscZeInResponse' }
        const invalidField = MSScore.findInvalidField(apiResponse)
        if (invalidField) {
            // IOS-4ZE9 / ANDROID-1864 never said which field or score, so nobody could act on them.
            return {
                type: 'invalid',
                error: `isScoreSourceItemValid:${invalidField} score:${candidate.id}`,
            }
        }
        return { type: 'valid', data: apiResponse as TScoreInfoDto }
    }
}
