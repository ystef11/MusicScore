import { RNShare, TThunkAction, fileSystem } from '@mu-native/common'
import { debugStore } from './debugStoreChunk'
import type { TEvent, TRequest } from '../types/debugTypes'

const separator = '================================'

const shareAllEvents: TThunkAction = () => async (_, getState) => {
    try {
        const analytics = debugStore.props.getAnalytics(getState())

        let text = ''

        analytics.forEach(({ data, time, title }) => {
            text += `Time - ${time}\n\nTitle - ${title}\n\nData - ${JSON.stringify(
                data,
            )}\n\n${separator}\n\n`
        })

        const filePath = `${fileSystem.paths.cachesDirectory}/events.txt`

        await fileSystem.writeFile(filePath, text, 'utf8')

        RNShare.open({
            url: `file://${filePath}`,
            type: 'application/txt',
            title: 'Events',
            saveToFiles: true,
        })
    } catch (error) {
        console.log('@@shareAllEvents error', error)
    }
}

const shareAllRequest: TThunkAction = () => async (_, getState) => {
    try {
        const api = debugStore.props.getApi(getState())

        let text = ''

        api.forEach(({ body, method, headers, params, time, url }) => {
            text += `Time - ${time}\n\nUrl - ${url}\n\nMethod - ${method}\n\nHeaders - ${headers}\n\nParams - ${params}\n\n${
                body ? `Body - ${body}\n\n${separator}\n\n` : `${separator}\n\n`
            }`
        })

        const filePath = `${fileSystem.paths.cachesDirectory}/requests.txt`

        await fileSystem.writeFile(filePath, text, 'utf8')

        RNShare.open({
            url: `file://${filePath}`,
            type: 'application/txt',
            title: 'Events',
            saveToFiles: true,
        })
    } catch (error) {
        console.log('@@shareAllRequest error', error)
    }
}

const shareEvent: TThunkAction<TEvent> =
    ({ data, time, title }) =>
    async () => {
        try {
            const text = `Time - ${time}\n\nTitle - ${title}\n\nData - ${JSON.stringify(data)}`

            const filePath = `${fileSystem.paths.cachesDirectory}/${title.replace(/:/g, '')}.txt`

            await fileSystem.writeFile(filePath, text, 'utf8')

            RNShare.open({
                url: `file://${filePath}`,
                type: 'application/txt',
                title,
                saveToFiles: true,
            })
        } catch (error) {
            console.log('@@writeEventToFile error', error)
        }
    }

const shareRequest: TThunkAction<TRequest> =
    ({ body, method, headers, params, time, url }) =>
    async () => {
        try {
            const text = `Time - ${time}\n\nUrl - ${url}\n\nMethod - ${method}\n\nHeaders - ${headers}\n\nParams - ${params}\n\n${
                body ? `Body - ${body}\n\n\n` : '\n'
            }`

            const filePath = `${fileSystem.paths.cachesDirectory}/${url
                .slice(url.indexOf('v2') + 3)
                .replace(/\//g, '-')}.txt`

            await fileSystem.writeFile(filePath, text, 'utf8')

            RNShare.open({
                url: `file://${filePath}`,
                type: 'application/txt',
                title: url,
                saveToFiles: true,
            })
        } catch (error) {
            console.log('@@shareRequest error', error)
        }
    }

export const debugThunks = {
    get shareAllEvents() {
        return shareAllEvents
    },
    get shareAllRequest() {
        return shareAllRequest
    },
    get shareEvent() {
        return shareEvent
    },
    get shareRequest() {
        return shareRequest
    },
}
