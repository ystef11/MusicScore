import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import type { MSScoreT } from '../Model/MSScore'
import { getInstrumentTitle } from '../Model/MSScore'
import { isIOS } from '../Utils/Platform'
import SentryUtils from '../Utils/Sentry'
import Spotlight from '../Utils/Spotlight'

export const spotlightDomains = {
    OWNSCORES: 'own scores',
    FAVORITES: 'favorites',
    SONGBOOK: 'songbook',
    MAIN: 'main',
}

function createDescription({ partsCount, instruments }: MSScoreT) {
    return [
        partsCount > 1 ? translate('native.score.parts_count', { count: partsCount }) : null,
        (instruments || [])?.map(item => getInstrumentTitle(item)).join(', '),
    ]
        .filter(item => item)
        .join(': ')
}

function createSpotlightItem(score: MSScoreT, domain: string) {
    const { id, title, authorName, previewImageUrl } = score
    const contentDescription = [createDescription(score), authorName]
        .filter(item => item)
        .join('\n')
    return {
        uniqueIdentifier: String(id),
        title,
        domain,
        contentDescription,
        thumbnail: previewImageUrl
            ? {
                  uri: previewImageUrl,
              }
            : icons.nodeMd,
    }
}

// @TODO types
export async function updateSpotlightIndex(scores: Array<MSScoreT>, domain?: any) {
    if (!isIOS) return
    scores.forEach(async score => {
        try {
            const spotlightItem = createSpotlightItem(score, domain || spotlightDomains.MAIN)
            await Spotlight.indexSpotlightItem(spotlightItem)
        } catch (error) {
            // SentryUtils.sendMessage('updateSpotlightIndex', error)
        }
    })
}
export async function resetSpotlightIndex() {
    if (!isIOS) return

    try {
        await Spotlight.deleteAllSpotlightItems()
    } catch (error) {
        SentryUtils.sendMessage('resetSpotlightIndex', error)
    }
}
