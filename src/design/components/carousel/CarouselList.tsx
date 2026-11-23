import { ReactElement } from 'react'
import { FlatList, FlatListProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { layout } from '../../constants/layout'
import { SkeletonLoaderWrapper } from '../skeletonLoader/SkeletonLoaderWrapper.tsx'

import { CarouselListTitle } from './CarouselListTitle.tsx'

export const styles = StyleSheet.create({
    container: {
        justifyContent: 'flex-start',
        marginBottom: 24,
    },
    carouselContent: {
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: 12,
    },
    titleContainer: {
        paddingHorizontal: layout.baseMarginFromEdges,
        marginTop: 2,
        marginBottom: 12,
    },
})

type TCarouselProps<TItem> = {
    testID?: string
    titleTestID?: string
    title?: string
    onTitlePress?: () => void
    containerStyle?: StyleProp<ViewStyle>
    isLoading?: boolean
    renderLoadingItem?: () => ReactElement
} & FlatListProps<TItem>

const loaderData = [0, 1, 2, 3, 4]

const SkeletonLoader = ({
    renderItem,
    contentContainerStyle,
}: Pick<FlatListProps<number>, 'renderItem' | 'contentContainerStyle'>) => {
    return (
        <SkeletonLoaderWrapper>
            <FlatList
                data={loaderData}
                renderItem={renderItem}
                contentContainerStyle={[styles.carouselContent, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                scrollEnabled={false}
                horizontal
            />
        </SkeletonLoaderWrapper>
    )
}

export const CarouselList = <TItem,>({
    testID,
    titleTestID,
    title,
    onTitlePress,
    containerStyle,
    contentContainerStyle,
    isLoading,
    renderLoadingItem,
    ...flatListProps
}: TCarouselProps<TItem>) => {
    return (
        <View testID={testID} style={[styles.container, containerStyle]}>
            {!!title && (
                <CarouselListTitle
                    text={title}
                    onPress={onTitlePress}
                    style={styles.titleContainer}
                    testID={titleTestID}
                />
            )}
            {isLoading && renderLoadingItem ? (
                <SkeletonLoader renderItem={renderLoadingItem} />
            ) : (
                <FlatList
                    horizontal
                    contentContainerStyle={[styles.carouselContent, contentContainerStyle]}
                    showsHorizontalScrollIndicator={false}
                    {...flatListProps}
                />
            )}
        </View>
    )
}
