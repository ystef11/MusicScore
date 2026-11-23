import {
    useRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    forwardRef,
    type ReactNode,
} from 'react'
import type { TextInputInstance } from 'react-native'

import { globalStyles, SearchField } from '@mu-native/ds'

type Props = {
    searchTerm: string
    placeholder?: string
    onSubmitEditing?: () => void
    onChangeText: (text: string) => void
    clearInputValue: () => void
    onSearchBlur?: () => void
    onSearchFocus?: () => void
    trailingButton?: ReactNode
    testID?: string
    isSearching?: boolean
    onEndEditing?: () => void
}

export const SearchInputContainer = forwardRef<TextInputInstance, Props>(
    (
        {
            testID,
            searchTerm,
            placeholder = '',
            onSubmitEditing,
            onChangeText,
            clearInputValue,
            onSearchBlur,
            onSearchFocus,
            trailingButton,
            onEndEditing,
            isSearching,
        }: Props,
        ref,
    ) => {
        const internalRef = useRef<TextInputInstance>(null)
        useImperativeHandle<TextInputInstance | null, TextInputInstance | null>(
            ref,
            () => internalRef.current,
        )

        useEffect(() => {
            return clearInputValue
        }, [])

        const handleSearchBlur = useCallback(() => {
            onSearchBlur?.()
        }, [onSearchBlur])

        const handleSearchFocus = useCallback(() => {
            onSearchFocus?.()
        }, [onSearchFocus])

        return (
            <SearchField
                ref={internalRef}
                testID={testID}
                value={searchTerm}
                placeholder={placeholder}
                isLoading={isSearching}
                onChangeText={onChangeText}
                onClear={clearInputValue}
                trailingButton={trailingButton}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onSubmitEditing={onSubmitEditing}
                onEndEditing={onEndEditing}
                style={globalStyles.flex1}
            />
        )
    },
)
