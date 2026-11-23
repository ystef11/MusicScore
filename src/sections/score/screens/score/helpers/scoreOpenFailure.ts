import { presentAlert } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { exists } from '../../../../../App/Services/FilesProvider.ts'
import { deleteCachedScoreFile } from '../../../../../App/Services/ScoreInfoProvider.ts'
import Sentry from '../../../../../App/Utils/Sentry.ts'

export const onScoreOpenFailed = async (uri: string, error: unknown) => {
    const fileExists = await exists(uri).catch(() => null)
    Sentry.sendMessage('openScore', error, { fileExists })
    presentAlert({ rawTitle: translate('native.score.failed_to_open_score'), rawMessage: error instanceof Error ? error.message : String(error) })
    await deleteCachedScoreFile(uri).catch(() => null)
}
