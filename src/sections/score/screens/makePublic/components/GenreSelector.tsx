import { memo, useCallback, useMemo, useRef } from 'react'
import { Pressable, StyleSheet } from 'react-native'

import {
    AppText,
    brandColors,
    FormField,
    Icon,
    layout,
    type NativeBottomSheetRef,
} from '@mu-native/ds'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { translate } from '@mu-native/locale'

import { type ApiGenre } from '../services/makePublicApi.ts'

import { GenreBottomSheet } from './GenreBottomSheet.tsx'

type Props = {
    genres: number[]
    referenceGenres: ApiGenre[]
    onChange: (genres: number[]) => void
}

export const GenreSelector = memo(({ genres, referenceGenres, onChange }: Props) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const displayText = useMemo(() => {
        if (genres.length === 0) return translate('native.make_public.genre_placeholder')
        return genres
            .map(id => referenceGenres.find(g => g.id === id)?.name)
            .filter(Boolean)
            .join(', ')
    }, [genres, referenceGenres])

    const isPlaceholder = genres.length === 0

    const onPress = useCallback(() => {
        sheetRef.current?.present()
    }, [])

    return (
        <FormField label={translate('native.make_public.genre_label')} style={styles.container}>
            <Pressable style={styles.selector} onPress={onPress}>
                <AppText
                    font="f17w400"
                    rawText={displayText}
                    brandColor={isPlaceholder ? 'contentTertiary' : 'contentPrimary'}
                    style={styles.selectorText}
                />
                <Icon source={chevronDown} tint={brandColors.contentPrimary} />
            </Pressable>
            <GenreBottomSheet
                ref={sheetRef}
                genres={genres}
                referenceGenres={referenceGenres}
                onChange={onChange}
            />
        </FormField>
    )
})

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
    selector: {
        borderWidth: 1,
        borderColor: brandColors.formDefault,
        borderRadius: 1,
        padding: layout.marginXm,
        flexDirection: 'row',
        alignItems: 'center',
    },
    selectorText: {
        flex: 1,
    },
})
