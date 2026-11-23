import { StyleSheet } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { AppText, CommonTouchable, ebooksLayout } from '@mu-native/ds'

import { DigitalEbookModel } from '../api/digital.ebooks.models'

import { DigitalEbookCoverView } from './DigitalEbookCoverView'

type TProps = {
    item: DigitalEbookModel
    onPress: (item: DigitalEbookModel) => void
}

export const DigitalEbooksFeedListItem = ({ item, onPress }: TProps) => {
    return (
        <CommonTouchable
            testID={songbookTestIds.feedItem}
            onPress={() => onPress(item)}
            style={styles.item}
        >
            <DigitalEbookCoverView uri={item.generated_cover_path} style={styles.image} />
            <AppText
                rawText={item.name}
                style={styles.title}
                font="f15w500"
                numberOfLines={2}
                ellipsizeMode="tail"
            />
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    item: {
        height: ebooksLayout.listSectionHeight,
        width: ebooksLayout.listItemWidth,
    },

    image: {
        height: 213,
        width: '100%',
    },

    title: {
        marginTop: 8,
        marginBottom: 2,
    },
})
