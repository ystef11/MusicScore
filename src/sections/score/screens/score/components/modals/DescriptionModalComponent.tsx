import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import { layout, NativeBottomSheet, NativeBottomSheetRef, useAppSafeArea } from '@mu-native/ds'
import { AppNavigationType, Screen, useAppNavigation } from '@mu-native/navigation'

import { useCurrentScore } from '../../hooks/useCurrentScore'
import { ScoreDetailsTitle } from '../scoreDetails/ScoreDetailsTitle.tsx'

import { DescriptionModalBasedOnBy } from './DescriptionModalBasedOnBy.tsx'
import { DescriptionModalMetaInfo } from './DescriptionModalMetaInfo.tsx'
import { ScoreDescriptionModalDescription } from './ScoreDescriptionModalDescription.tsx'
import { ScoreDescriptionModalInfo } from './ScoreDescriptionModalInfo.tsx'

export const DescriptionScoreSheet = memo(
    forwardRef<NativeBottomSheetRef>((_props, ref) => {
        const navigation = useAppNavigation()
        const sheetRef = useRef<NativeBottomSheetRef>(null)
        useImperativeHandle(ref, () => sheetRef.current!)
        useEffect(() => {
            return navigation.addListener('blur', () => {
                sheetRef.current?.dismiss()
            })
        }, [])
        return (
            <NativeBottomSheet ref={sheetRef}>
                <DescriptionModalComponent navigation={navigation} />
            </NativeBottomSheet>
        )
    }),
)

type TProps = {
    navigation: AppNavigationType
}

const DescriptionModalComponent = ({ navigation }: TProps) => {
    const score = useCurrentScore()

    const { bottom } = useAppSafeArea({ bottom: 16 })

    const onOpenSongPress = useCallback(
        (compositionId: number) => {
            navigation.push(Screen.songSheetmusic, { compositionId })
        },
        [navigation],
    )

    const onOpenArtistPress = useCallback(
        (artistId: number) => {
            navigation.push(Screen.artist, { artistId })
        },
        [navigation],
    )

    if (!score) return null

    return (
        <>
            <View style={{ paddingHorizontal: layout.baseMarginFromEdges }}>
                <ScoreDetailsTitle
                    numberOfLines={30}
                    title={score?.title ?? ''}
                    textAlign="center"
                />
            </View>
            <ScrollView contentContainerStyle={[styles.container, { paddingBottom: bottom }]}>
                <ScoreDescriptionModalInfo score={score} />
                <ScoreDescriptionModalDescription />
                <DescriptionModalBasedOnBy
                    onOpenSongPress={onOpenSongPress}
                    onOpenArtist={onOpenArtistPress}
                />
                <DescriptionModalMetaInfo />
            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 16,
        paddingHorizontal: layout.baseMarginFromEdges,
    },
})
