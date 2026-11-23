import { memo, useCallback, useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { FormField, FormTextInput, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { type ApiSongResult } from '../services/makePublicApi.ts'

import { SongSuggestionsList } from './SongSuggestionsList.tsx'

type Props = {
    value: string
    onChange: (value: string) => void
    onSelectSong: (song: ApiSongResult) => void
    onSearch: (query: string) => void
    songResults: ApiSongResult[]
    error?: string | null
}

const DEBOUNCE_MS = 300

export const CompositionInput = memo(
    ({ value, onChange, onSelectSong, onSearch, songResults, error }: Props) => {
        const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

        useEffect(() => {
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current)
            }
        }, [])

        const onChangeText = useCallback(
            (text: string) => {
                onChange(text)

                if (timerRef.current) clearTimeout(timerRef.current)
                timerRef.current = setTimeout(() => {
                    onSearch(text)
                }, DEBOUNCE_MS)
            },
            [onChange, onSearch],
        )

        const onSelect = useCallback(
            (song: ApiSongResult) => {
                onSelectSong(song)
                onSearch('')
            },
            [onSelectSong, onSearch],
        )

        return (
            <View style={styles.container}>
                <FormField label={translate('native.make_public.based_on_label')} error={error}>
                    <FormTextInput
                        value={value}
                        onChangeText={onChangeText}
                        placeholder={translate('native.make_public.based_on_placeholder')}
                        error={!!error}
                    />
                </FormField>
                <SongSuggestionsList songs={songResults} onSelect={onSelect} />
            </View>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        marginTop: layout.marginMd,
    },
})
