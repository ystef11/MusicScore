import { useCallback, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
    AppText,
    BrandCheckboxWithTitle,
    brandColors,
    FilterButton,
    layout,
    NativeBottomSheet,
    type NativeBottomSheetRef,
    staticSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { MAX_GENRES } from '../constants.ts'
import { type ApiGenre } from '../services/makePublicApi.ts'

type Props = {
    ref: React.Ref<NativeBottomSheetRef>
    genres: number[]
    referenceGenres: ApiGenre[]
    onChange: (genres: number[]) => void
}

export const GenreBottomSheet = ({ genres, referenceGenres, onChange, ref }: Props) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [localGenres, setLocalGenres] = useState<number[]>(genres)

    useImperativeHandle(ref, () => ({
        present: () => {
            setLocalGenres(genres)
            sheetRef.current?.present()
        },
        dismiss: () => sheetRef.current?.dismiss(),
    }))

    const isAtMax = localGenres.length >= MAX_GENRES

    const onToggleGenre = useCallback((genreId: number) => {
        setLocalGenres(prev => {
            if (prev.includes(genreId)) {
                return prev.filter(g => g !== genreId)
            }
            if (prev.length >= MAX_GENRES) return prev
            return [...prev, genreId]
        })
    }, [])

    const onApply = useCallback(() => {
        onChange(localGenres)
        sheetRef.current?.dismiss()
    }, [localGenres, onChange])

    return (
        <NativeBottomSheet ref={sheetRef}>
            <ScrollView style={styles.content}>
                <AppText
                    font="f44w400Accent"
                    rawText={translate('native.make_public.select_genre')}
                    style={styles.title}
                />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    rawText={translate('native.make_public.genre_subtitle', {
                        count: String(MAX_GENRES),
                    })}
                    style={styles.subtitle}
                />
                {referenceGenres.map(genre => {
                    const isSelected = localGenres.includes(genre.id)
                    const isDisabled = isAtMax && !isSelected

                    return (
                        <View key={genre.id} style={styles.item}>
                            <BrandCheckboxWithTitle
                                title={genre.name}
                                selected={isSelected}
                                onToggle={() => !isDisabled && onToggleGenre(genre.id)}
                                brandColor={isDisabled ? 'contentTertiary' : 'contentPrimary'}
                            />
                        </View>
                    )
                })}
            </ScrollView>
            <View style={styles.buttons}>
                <FilterButton
                    onPress={onApply}
                    type="secondary"
                    rawText={translate('native.filter.actions.apply')}
                />
            </View>
        </NativeBottomSheet>
    )
}

const styles = StyleSheet.create({
    content: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    title: {
        marginBottom: 4,
    },
    subtitle: {
        marginBottom: 16,
    },
    item: {
        paddingVertical: 12,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingTop: 8,
        paddingBottom: staticSafeArea().bottomWithAndroid,
        paddingHorizontal: 20,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: brandColors.strokeDefault,
    },
})
