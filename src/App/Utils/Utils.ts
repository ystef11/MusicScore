// eslint-disable-next-line react-native/split-platform-components
import { PermissionsAndroid } from 'react-native'

import { localizeNumber, translate } from '@mu-native/locale'
import escapeRegExp from 'lodash.escaperegexp'

import MetricaEvents from '../constants/MetricaEvents'
import { MSOfflineScoreT } from '../Model/MSOfflineScore'
import type { MSScoreT } from '../Model/MSScore'

import '../Model/MSScore'
import reportEvent from './Analytics'
import SentryUtils from './Sentry'

export type IndexedScoreT = {
    key: string
} & MSScoreT
const numberSuffixes = [
    {
        suffix: 'M',
        limit: 1e6,
    },
    {
        suffix: 'K',
        limit: 1e3,
    },
]
export default {
    searchScores<TScore extends MSScoreT | MSOfflineScoreT>(
        scores: TScore[],
        searchText: string,
    ): TScore[] {
        // https://git.wsmgroup.ru/react/react-native-musescore/issues/480
        const reg = new RegExp(escapeRegExp(searchText), 'gi')

        if (!scores) {
            return []
        }

        return scores.filter(score => String(score.title).match(reg))
    },
    isEmpty(value: any): boolean {
        switch (value) {
            case '':
            case 0:
            case '0':
            case null:
            case false:
            case undefined:
            case typeof this === 'undefined':
                return true

            default:
                return false
        }
    },

    formatDate(value: number): string {
        const date = new Date(value)
        return date.toISOString().slice(0, 10)
    },

    formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp * 1000)
        return date
            .toDateString()
            .slice(4)
            .replace(/(?=\s\d{4})/, ',')
    },

    formatNumber(value: number, precision = 1): string {
        // eslint-disable-next-line no-restricted-syntax
        for (const item of numberSuffixes) {
            if (value > item.limit) {
                return `${localizeNumber(value / item.limit, {
                    precision,
                    strip_insignificant_zeros: true,
                })}${item.suffix}`
            }
        }

        return value == null ? value : String(value)
    },

    toNumber(value: number, precision = 1): string {
        return value == null ? value : localizeNumber(value, { precision })
    },

    async requestStoragePermission(): Promise<string | null> {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: translate('native.permissions.storage.initial_alert_title'),
                    message: translate('native.permissions.storage.initial_alert_message'),
                    buttonPositive: translate('native.actions.okay'),
                },
            )
            return granted
        } catch (error) {
            SentryUtils.sendMessage('requestStoragePermission', error)
        }

        return null
    },

    async onGrantStoragePermission(
        successCb: (...args: Array<any>) => any,
        failCb: (...args: Array<any>) => any,
    ) {
        const granted = await this.requestStoragePermission()

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            reportEvent(MetricaEvents.PERMISSION_STORAGE_SUCCESS)
            successCb()
        } else {
            reportEvent(MetricaEvents.PERMISSION_STORAGE_FAILURE, {
                status: granted || undefined,
            })
            failCb()
        }
    },

    hashCode(str: string): number {
        let hash = 0

        if (str?.length === 0) {
            return hash
        }

        for (let i = 0; i < str?.length; i++) {
            const chr = str.charCodeAt(i)
            // eslint-disable-next-line no-bitwise
            hash = (hash << 5) - hash + chr
            // eslint-disable-next-line no-bitwise
            hash |= 0 // Convert to 32bit integer
        }

        if (hash < 0) {
            return -hash
        }

        return hash
    },

    makeIndexed(scores: MSScoreT[]): IndexedScoreT[] {
        if (!scores) {
            return []
        }

        return scores?.map((score, index) => ({ ...score, key: `${index}` }))
    },
}
