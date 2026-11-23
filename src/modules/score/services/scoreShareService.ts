import { NativeModules, Platform } from 'react-native'
import { URL } from 'react-native-url-polyfill'

import { apiRequest, scoreContracts } from '@mu-native/api'
import { checkConnectionSafely } from '@mu-native/system'

import { ScorePrivacy, type MSScoreT } from '../../../App/Model/MSScore'
import { createSingleFlight } from '../../../App/Services/singleFlight'
import { findCachedWebScoreUrl } from '../../../App/Services/WebScoreProvider'

const shareUrls = new Map<string, string>()
const resolveShareOnce = createSingleFlight()

function publicScoreUrl(value: unknown) {
    if (typeof value !== 'string') return undefined
    try {
        const url = new URL(value, 'https://musescore.com')
        const isScorePage = /\/scores\/\d+(?:\/|$)/.test(url.pathname)
        if (url.origin === 'https://musescore.com' && !url.username && !url.password && isScorePage) {
            return `${url.origin}${url.pathname}`
        }
    } catch { /* Invalid website URL. */ }
    return undefined
}

async function resolveShareUrl(score: MSScoreT) {
    const isPublic = score.privacy === ScorePrivacy.PUBLIC
    const webSource = Platform.OS === 'android' ? NativeModules.WebScoreSource : undefined

    if (isPublic) {
        const knownUrl = publicScoreUrl(score.webSourceUrl)
        if (knownUrl) return knownUrl

        if (Platform.OS === 'android') {
            const cachedUrl = publicScoreUrl(await findCachedWebScoreUrl(score.id, score.revision))
            if (cachedUrl) return cachedUrl
        }
    }

    if (!checkConnectionSafely()) return undefined

    if (isPublic && webSource?.resolvePublicScoreUrl) {
        try {
            const result = await webSource.resolvePublicScoreUrl(
                score.title, score.authorId, score.authorName || '', score.largePreviewUrl || '',
            )
            const url = publicScoreUrl(result)
            if (url) return url
        } catch { /* Use the sharing API if the website could not resolve the score. */ }
    }

    const { url } = await apiRequest(scoreContracts.share, { params: { score_id: score.id } })
    if (typeof url !== 'string' || !/^https?:\/\/\S+$/i.test(url)) {
        throw new Error('The score sharing API returned an invalid URL')
    }
    return url
}

export function getScoreShareUrl(score: MSScoreT) {
    const key = `${score.privacy}:${score.id}`
    return resolveShareOnce(key, async () => {
        const cached = shareUrls.get(key)
        if (cached) return cached

        const url = await resolveShareUrl(score)
        if (url) shareUrls.set(key, url)
        return url
    })
}
