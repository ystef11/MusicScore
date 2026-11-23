import { StyleProp, ViewStyle } from 'react-native'

import { CarouselScoreItem } from '../carouselItem/CarouselScoreItem.tsx'
import { TScoreConstraints } from '../carouselItem/carouselScoreItemTypes.ts'
import { ScoreSkeletonItem } from '../skeletonItem/ScoreSkeletonItem.tsx'

import { CarouselList } from './CarouselList.tsx'

const keyExtractor = (item: { id: number | string }) => String(item.id)
const itemLayout = (_: any, index: number) => ({ index, offset: 160 * index, length: 160 })

type TCarouselScoreListProps<TScore> = {
    testID?: string
    titleTestID?: string
    itemTestID?: string
    title?: string
    data: TScore[]
    onScorePress: (score: TScore) => void
    onTitlePress?: () => void
    isLoading?: boolean
    onFavoritePress?: (score: TScore) => void
    onScorePlayPress?: (score: TScore) => void
    contentContainerStyle?: StyleProp<ViewStyle>
}

const renderLoadingItem = () => <ScoreSkeletonItem />

export const CarouselScoreList = <TScore extends TScoreConstraints>({
    testID,
    titleTestID,
    itemTestID,
    title,
    data,
    onScorePress,
    onTitlePress,
    isLoading,
    onFavoritePress,
    onScorePlayPress,
    contentContainerStyle,
}: TCarouselScoreListProps<TScore>) => {
    const renderItem = ({ item, index }: { item: TScore; index: number }) => (
        <CarouselScoreItem
            key={item?.id}
            score={item}
            onPress={onScorePress}
            testID={itemTestID ? `${itemTestID}_${index}` : undefined}
            onFavoritePress={onFavoritePress}
            onPlayPress={onScorePlayPress}
        />
    )

    return (
        <CarouselList
            testID={testID}
            titleTestID={titleTestID}
            title={title}
            onTitlePress={onTitlePress}
            data={data}
            renderItem={renderItem}
            getItemLayout={itemLayout}
            keyExtractor={keyExtractor}
            extraData={data.length}
            isLoading={isLoading}
            renderLoadingItem={renderLoadingItem}
            contentContainerStyle={contentContainerStyle}
        />
    )
}
