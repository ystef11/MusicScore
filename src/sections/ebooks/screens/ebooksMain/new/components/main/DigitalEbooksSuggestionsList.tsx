import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, Image, Keyboard, ListRenderItemInfo, StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, icons, KeyboardSpacer, layout } from '@mu-native/ds'
import { useActions, useValues } from '@ug/store'

import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import { digitalEbooksStore } from '../../stores/DigitalEbooksStore.ts'

type Props = {
    top?: number
    onSearch: () => void
}

const keyExtractor = (item: any) => item

const getItemLayout = (_: any, index: number) => ({ length: 44, offset: 44 * index, index })

const SuggestionsListItem = ({
    suggestion,
    onPress,
}: {
    suggestion: string
    onPress: (suggestion: string) => void
}) => {
    return (
        <CommonTouchable onPress={() => onPress(suggestion)} style={styles.itemContainer}>
            <Image source={icons.searchMd} />
            <AppText rawText={suggestion} font="f15w400" brandColor="contentPrimary" />
        </CommonTouchable>
    )
}

export const DigitalEbooksSuggestionsList = memo(({ top, onSearch }: Props) => {
    const suggestionTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const [paddingBottom, setPaddingBottom] = useState(0)
    const prevSearch = useRef<string | undefined>(undefined)

    const [suggestions, searchTerm] = useValues([
        digitalEbooksStore.props.getSuggestions,
        digitalEbooksStore.props.getSearchText,
    ])

    const actions = useActions({
        requestSuggestions: digitalEbooksThunk.searchSuggestions,
        changeSuggestions: digitalEbooksStore.actions.setSuggestions,
        setSearchText: digitalEbooksStore.actions.setSearchText,
    })

    useEffect(() => {
        if (suggestionTimer.current) clearTimeout(suggestionTimer?.current)

        if (prevSearch.current === searchTerm) {
            prevSearch.current = searchTerm
            return
        }
        prevSearch.current = searchTerm

        if (!searchTerm) {
            actions.changeSuggestions([])
            return
        }
        suggestionTimer.current = setTimeout(() => {
            actions.requestSuggestions(searchTerm)
        }, 300)
    }, [actions, searchTerm])

    const onPressSuggestion = useCallback(
        (suggestion: string) => {
            // reportEvent(reportEventName, { suggestion })
            prevSearch.current = suggestion
            actions.setSearchText(suggestion)
            onSearch()
            actions.changeSuggestions([])
            Keyboard.dismiss()
        },
        [actions, onSearch],
    )

    if (!suggestions?.length) return null

    const renderItem = (info: ListRenderItemInfo<string>) => (
        <SuggestionsListItem suggestion={info.item} onPress={onPressSuggestion} />
    )

    return (
        <View style={[styles.list, { top, paddingBottom: paddingBottom - 79 }]}>
            <FlatList
                keyboardShouldPersistTaps="handled"
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                data={suggestions}
                getItemLayout={getItemLayout}
                renderItem={renderItem}
            />
            <KeyboardSpacer onToggle={setPaddingBottom} />
        </View>
    )
})

const styles = StyleSheet.create({
    list: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: brandColors.backgroundDefault,
        zIndex: 10,
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    itemContainer: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },
})
