import { memo, useEffect } from 'react'
import { StyleSheet } from 'react-native'

import { CarouselList } from '@mu-native/ds'
import { hubConstants, THub } from '@mu-native/hub-common'
import { translate } from '@mu-native/locale'

import reportEvent from '../../Utils/Analytics'

import { GiftChecklistHub } from './GiftChecklistHub.tsx'
import { Hub } from './Hub'

type THubsScrollViewProps = {
    hubs: THub[]
    onHubPress: (hub: THub) => void
    onAllHubsPress: () => void
    limit: number
    tourInstrument: string | null
    isAuthorized: boolean
}

export const HubsScrollView = memo(
    ({
        hubs,
        onHubPress,
        onAllHubsPress,
        limit,
        tourInstrument,
        isAuthorized,
    }: THubsScrollViewProps) => {
        useEffect(() => {
            reportEvent('Personal Hub: show', { tourInstrument })
        }, [])

        if (!hubs?.length) return null

        const renderItem = ({ item: hub, index }: { item: THub; index: number }) => {
            if (
                (hub.id === hubConstants.hubPopular.id && !isAuthorized) ||
                (hub.id === hubConstants.hubSelectedForYou.id && isAuthorized)
            )
                return null

            if (hub.id === hubConstants.hubGift.id) {
                return <GiftChecklistHub />
            }

            return (
                <Hub
                    testID={!index ? 'Hubs scroll view hub' : undefined}
                    hub={hub}
                    key={hub.id}
                    onPress={onHubPress}
                />
            )
        }

        return (
            <CarouselList
                title={translate('native.screen_explore.top_hubs')}
                onTitlePress={onAllHubsPress}
                contentContainerStyle={styles.scrollContent}
                data={hubs.slice(0, limit)}
                renderItem={renderItem}
            />
        )
    },
)
const styles = StyleSheet.create({
    scrollContent: {
        gap: 8,
        flexGrow: 1,
        height: 48,
    },
})
