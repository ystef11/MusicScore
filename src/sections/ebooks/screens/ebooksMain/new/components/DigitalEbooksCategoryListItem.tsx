import { StyleSheet, View } from 'react-native'

import { useDimensions } from '@mu-native/common'
import {
    AppText,
    brandColors,
    CommonTouchable,
    ebooksLayout,
    globalStyles,
    Icon,
    layout,
} from '@mu-native/ds'
import { heartFilled } from '@mu-native/icons/heartFilled'

import { isTablet } from '../../../../../../App/Utils/Platform'
import { DigitalEbookModel } from '../api/digital.ebooks.models'

import { DigitalEbookCoverView } from './DigitalEbookCoverView'

type TProps = {
    item: DigitalEbookModel
    onPress: (item: DigitalEbookModel) => void
    isInFavorites?: boolean
    onRemoveFromFavoritePress?: (id: string) => void
}

export const DigitalEbooksCategoryListItem = ({
    item,
    onPress,
    isInFavorites,
    onRemoveFromFavoritePress,
}: TProps) => {
    const dimensions = useDimensions('window')
    const itemWidth = isTablet
        ? (dimensions.width - layout.baseMarginFromEdges * 2) / 2 - 20
        : undefined

    return (
        <CommonTouchable onPress={() => onPress(item)} style={[styles.item, { width: itemWidth }]}>
            <DigitalEbookCoverView uri={item.generated_cover_path} style={styles.image} />
            <View style={globalStyles.flex1}>
                <View style={styles.titleWrapper}>
                    <AppText
                        rawText={item.name}
                        style={styles.title}
                        font="f15w500"
                        numberOfLines={5}
                        ellipsizeMode="tail"
                    />
                    {isInFavorites && (
                        <CommonTouchable onPress={() => onRemoveFromFavoritePress?.(item.id)}>
                            <Icon source={heartFilled} tint={brandColors.contentPrimary} />
                        </CommonTouchable>
                    )}
                </View>
            </View>
        </CommonTouchable>
    )
}

const styles = StyleSheet.create({
    item: {
        height: ebooksLayout.categoryItemHeight,
        flexDirection: 'row',
        columnGap: 8,
    },

    image: {
        height: ebooksLayout.categoryItemHeight,
        width: 132,
    },

    title: {
        marginBottom: 2,
        flex: 1,
    },

    titleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10,
    },
})
