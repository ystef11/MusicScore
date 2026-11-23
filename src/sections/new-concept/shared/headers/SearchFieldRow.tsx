import { type ReactNode } from 'react'
import { Keyboard, type ReturnKeyTypeOptions, StyleSheet, View } from 'react-native'

import { AppText, CommonTouchable, Icon, layout, SearchField } from '@mu-native/ds'
import { chevronLeft } from '@mu-native/icons/chevronLeft'
import { translate } from '@mu-native/locale'

type TProps = {
    // When set, renders the leading 44x44 back button.
    onBack?: () => void
    // When set, renders a trailing "Cancel" text button (LibraryScreen variant).
    onCancel?: () => void
    // Passthrough SearchField props.
    value?: string
    onChangeText?: (text: string) => void
    onSubmitEditing?: () => void
    onClear?: () => void
    placeholder?: string
    autoFocus?: boolean
    isLoading?: boolean
    returnKeyType?: ReturnKeyTypeOptions
    trailingButton?: ReactNode
}

export const SearchFieldRow = ({
    onBack,
    onCancel,
    value,
    onChangeText,
    onSubmitEditing,
    onClear,
    placeholder,
    autoFocus,
    isLoading,
    returnKeyType,
    trailingButton,
}: TProps) => (
    <View style={[styles.row, onBack ? styles.rowWithBack : styles.rowPlain]}>
        {!!onBack && (
            <CommonTouchable onPress={onBack} style={styles.backButton}>
                <Icon source={chevronLeft} size={ICON_SIZE} />
            </CommonTouchable>
        )}
        <SearchField
            style={styles.searchField}
            value={value}
            onChangeText={onChangeText}
            onSubmitEditing={onSubmitEditing}
            onClear={onClear}
            placeholder={placeholder}
            autoFocus={autoFocus}
            isLoading={isLoading}
            returnKeyType={returnKeyType}
            trailingButton={trailingButton}
        />
        {!!onCancel && (
            <CommonTouchable
                // Android keeps the keyboard up when the focused input merely
                // unmounts, so dismiss it explicitly before leaving search.
                onPress={() => {
                    Keyboard.dismiss()
                    onCancel()
                }}
            >
                <AppText font="f15w400" rawText={translate('native.search.cancel_button')} />
            </CommonTouchable>
        )}
    </View>
)

const ICON_SIZE = 20
const BACK_BUTTON_SIZE = 44

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: layout.marginXm,
    },
    // With a back button the leading edge hugs the button (marginSm) to keep the
    // 44x44 tap target aligned; the trailing edge keeps the base page margin.
    rowWithBack: {
        paddingLeft: layout.marginSm,
        paddingRight: layout.baseMarginFromEdges,
        gap: layout.marginSm,
    },
    // Search-in-place variant (LibraryScreen): symmetric page margins.
    rowPlain: {
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: layout.marginSm,
        gap: layout.marginMd,
    },
    backButton: {
        width: BACK_BUTTON_SIZE,
        height: BACK_BUTTON_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchField: {
        flex: 1,
    },
})
