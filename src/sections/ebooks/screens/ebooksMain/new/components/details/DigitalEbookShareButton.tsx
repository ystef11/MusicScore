import { memo, useCallback } from 'react'
import { Platform } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { getStoreValue, RNShare } from '@mu-native/common'
import { MuseButton } from '@mu-native/ds'
import { share } from '@mu-native/icons/share'
import { translate } from '@mu-native/locale'
import { Screen } from '@mu-native/navigation'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import Sentry from '../../../../../../../App/Utils/Sentry'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

export const DigitalEbookShareButton = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()

    const onSharePress = useCallback(async () => {
        try {
            const ebook = getStoreValue(chunk.props.getEbook)
            if (!ebook) return
            reportEvent(MetricaEvents.SONGBOOK_SHARE_CLICK, {
                screen: Screen.ebookDetails,
                songbook_id: ebook.id,
            })
            const url = ebook.web_url
            const title = ebook.name

            const message = translate('native.share.title')
            const options = Platform.select({
                ios: {
                    activityItemSources: [
                        {
                            placeholderItem: { type: 'url', content: url },
                            item: { default: { type: 'url', content: url } },
                            subject: { default: title },
                            linkMetadata: { originalUrl: url, url, title },
                        },
                    ],
                    failOnCancel: false,
                },
                default: {
                    title,
                    subject: title,
                    message: `${message} ${title}\n${url}`,
                    failOnCancel: false,
                },
            })
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            await RNShare.open(options)
        } catch (e) {
            Sentry.sendMessage('shareEbook', e)
        }
    }, [chunk])

    return (
        <MuseButton
            testID={songbookTestIds.detailsShareButton}
            type="secondary"
            startIcon={share}
            onPress={onSharePress}
        />
    )
})
