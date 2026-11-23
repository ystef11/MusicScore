import { PlayInstallReferrer } from 'react-native-play-install-referrer'

import { handleError } from '@mu-native/api'
import { platform, TThunkAction } from '@mu-native/common'

import { deepLinkService } from '../services/deepLinkService.ts'

import { deferredDeeplinkStoreChunk } from './deferredDeeplinkStoreChunk.ts'

const getDeferredDeeplinkData: TThunkAction = () => async dispatch => {
    try {
        if (platform.isAndroid) {
            PlayInstallReferrer.getInstallReferrerInfo((installReferrerInfo, error) => {
                if (!error) {
                    // Колбэк вызывается после завершения thunk, поэтому внешний
                    // try/catch ошибки отсюда не ловит — нужен свой.
                    ;(async () => {
                        try {
                            const { deeplinks } = installReferrerInfo?.referrerClickTimestampSeconds
                                ? await deepLinkService.fetchDeeplinkData(
                                      installReferrerInfo?.referrerClickTimestampSeconds,
                                  )
                                : { deeplinks: [] }

                            if (deeplinks) {
                                dispatch(deferredDeeplinkStoreChunk.actions.setData(deeplinks))
                            }
                        } catch (e) {
                            handleError(e)
                        }
                    })()
                }
            })
            return
        }
        const { deeplinks } = await deepLinkService.fetchDeeplinkData()

        if (deeplinks) {
            dispatch(deferredDeeplinkStoreChunk.actions.setData(deeplinks))
        }
    } catch (error) {
        handleError(error)
    }
}

export const deferredDeeplinkThunks = {
    getDeferredDeeplinkData,
}
