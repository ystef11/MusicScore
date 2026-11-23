import React, { useEffect } from 'react'

import { abStorage, abStoreChunk, getExperimentsIds, updateUnifiedId } from '@mu-native/ab'
import { apiEndpoints, AppsFlyerService, setupApi } from '@mu-native/api'
import { authStoreChunk, authThunks } from '@mu-native/auth'
import { store } from '@mu-native/common'
import { navigationStoreChunk } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

const tokenlessEndpoints = [apiEndpoints.authRefresh, apiEndpoints.commonHello]

/**
 * Тот же single-flight для завершения сессии: параллельные 401 иначе зовут
 * logout каждый и показывают экран форс-логаута столько же раз.
 */
let endSessionRequest: Promise<void> | null = null

export const SetupApiContainer = ({ children }: { children: React.ReactElement }) => {
    const [isUnifiedIdLoading, currentScreenName, session, experimentIds] = useValues([
        abStoreChunk.props.getIsUnifiedIdLoading,
        navigationStoreChunk.props.getCurrentScreenName,
        abStoreChunk.props.getSession,
        getExperimentsIds,
    ])

    const actions = useActions({
        setToken: authStoreChunk.actions.setToken,
        setRefreshToken: authStoreChunk.actions.setRefreshToken,
        updateUnifiedId,
        runRefreshToken: authThunks.refreshToken,
        runLogout: authThunks.logout,
    })

    useEffect(() => {
        return () => AppsFlyerService.dispose()
    }, [])

    useEffect(() => {
        if (isUnifiedIdLoading) {
            actions.updateUnifiedId()
        }
    }, [actions, isUnifiedIdLoading])

    setupApi({
        token: {
            // Токены читаем из стора напрямую, а не из значений рендера:
            // запрос, ожидающий обновления токена в onNotAuthorized, держит
            // замыкания старого рендера и после refresh ретраился бы со
            // старым токеном (снова 401 и refresh с уже ротированным
            // refresh-токеном).
            get: urlPath => {
                if (urlPath && tokenlessEndpoints.find(path => new RegExp(path).test(urlPath))) {
                    return null
                }
                return authStoreChunk.props.getToken(store.getState()) as string | null
            },
            getExpiresAt: () =>
                authStoreChunk.props.getTokenExpiresAt(store.getState()) as number | null,
            getRefresh: () =>
                authStoreChunk.props.getRefreshToken(store.getState()) as string | null,
            set: actions.setToken,
            setRefresh: actions.setRefreshToken,
            requestRefresh: async token => {
                await actions.runRefreshToken(token)
            },
            endSession: () => {
                if (endSessionRequest) return
                endSessionRequest = Promise.resolve(actions.runLogout(true))
                    .then(() => undefined)
                    .finally(() => {
                        endSessionRequest = null
                    })
            },
        },
        headerParams: [
            { title: 'x-mu-client-screen', get: () => currentScreenName },
            ...(session?.id ? [{ title: 'x-mu-session-id', get: () => session.id }] : []),
            ...(abStorage.get('unifiedId')
                ? [
                      {
                          title: 'x-mu-unified-id',
                          get: () => abStorage.get('unifiedId'),
                      },
                  ]
                : []),
            { title: 'x-mu-ab-experiment', get: () => experimentIds },
        ],
    })

    if (isUnifiedIdLoading) return null
    return children
}
