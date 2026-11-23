import { memo } from 'react'
import { FlatList, Image, StyleSheet } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { getStoreValue } from '@mu-native/common'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    layout,
    randomBrandColor,
} from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

export const DigitalEbooksDetailsSimilarView = memo(() => {
    const chunk = useDigitalEbookDetailsChunk()
    const navigation = useAppNavigation()
    const [similar] = useValues([chunk.props.getSimilarEbooks])
    if (similar.length === 0) return null

    const onSimilarPress = () => {
        navigation.push(Screen.ebooksSimilarScreen, {
            ebookId: getStoreValue(chunk.props.getEbook).id,
        })
    }
    if (!similar || similar.length === 0) return null

    return (
        <>
            <CommonTouchable
                testID={songbookTestIds.detailsSimilar}
                onPress={onSimilarPress}
                style={styles.header}
            >
                <AppText rawText={translate('native.ebooks.you_may_also_like')} font="f17w500" />
                <Icon source={chevronRight} size={24} tint={brandColors.contentPrimary} />
            </CommonTouchable>
            <FlatList
                data={similar}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                renderItem={info => {
                    return (
                        <CommonTouchable
                            onPress={() => {
                                reportEvent(MetricaEvents.SONGBOOK_CLICK, {
                                    screen: Screen.ebookDetails,
                                    songbook_id: info.item.id,
                                })
                                navigation.push(Screen.ebookDetailsStack, { id: info.item.id })
                            }}
                        >
                            <Image
                                source={{ uri: info.item.generated_cover_path ?? undefined }}
                                style={styles.item}
                            />
                        </CommonTouchable>
                    )
                }}
            />
        </>
    )
})
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    contentContainer: {
        columnGap: 8,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    item: {
        width: 132,
        height: 176,
        borderRadius: 2,
        overflow: 'hidden',
        backgroundColor: randomBrandColor(),
    },
})
