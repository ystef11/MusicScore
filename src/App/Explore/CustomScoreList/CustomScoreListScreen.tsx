import { useEffect, useLayoutEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors, BrandAppLoader } from '@mu-native/ds'
import { useAppNavigation } from '@mu-native/navigation'
import { TUniversalScoreListDynamicStoreChunk } from '@mu-native/universal-score-list'

import { NavHeader } from '../../Components/NavHeader/NavHeader.tsx'
import MSFlashList from '../../MSComponents/MSFlashList.tsx'
import { useScoreListProps } from '../hooks/useScoreListProps.ts'

type Props = {
    storeChunk: TUniversalScoreListDynamicStoreChunk
    onRefresh?: (storeChunk: TUniversalScoreListDynamicStoreChunk) => Promise<unknown>
    onLoadMore?: (storeChunk: TUniversalScoreListDynamicStoreChunk) => void
    title: string
    analyticsPlace: string
}

export const CustomScoreListScreen = ({
    storeChunk,
    title,
    onRefresh,
    onLoadMore,
    analyticsPlace,
}: Props) => {
    const navigation = useAppNavigation()
    const { scores, onScorePress, isInitialLoading } = useScoreListProps(storeChunk, analyticsPlace)

    const [refreshing, setRefreshing] = useState(false)

    const onRefreshInternal = async () => {
        if (!onRefresh) return
        setRefreshing(true)
        try {
            await onRefresh(storeChunk)
        } finally {
            setRefreshing(false)
        }
    }

    useEffect(() => {
        // Load initially only if the list is empty on first render
        if (scores.length === 0) {
            onRefreshInternal()
        }
    }, [])

    useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            // eslint-disable-next-line react/no-unstable-nested-components
            header: () => {
                return <NavHeader headerTitle={title} noNotifications />
            },
        })
    }, [])

    const loadMore = () => {
        onLoadMore?.(storeChunk)
    }

    if (isInitialLoading && scores.length === 0) {
        return (
            <View style={styles.loaderContainer}>
                <BrandAppLoader />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <MSFlashList
                scores={scores}
                hasSearchFilter={false}
                onItemPress={onScorePress}
                loadMore={loadMore}
                refreshing={refreshing}
                onRefresh={onRefreshInternal}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    loaderContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: brandColors.backgroundDefault,
    },
})
