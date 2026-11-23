import { memo, type ReactNode } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, layout } from '@mu-native/ds'
import { search } from '@mu-native/icons/search'
import { translate } from '@mu-native/locale'

// Matches the DS SearchField height so the entry button can swap in-place
// with a real input.
const FIELD_HEIGHT = 44

type TProps = {
    placeholder?: string
    onPress: () => void
    trailingButton?: ReactNode
    testID?: string
}

export const SearchEntryButton = memo(
    ({ placeholder, onPress, trailingButton, testID }: TProps) => (
        <View style={styles.container}>
            <CommonTouchable onPress={onPress} style={styles.pressArea} testID={testID}>
                <Icon source={search} tint={brandColors.contentPrimary} />
                <AppText
                    font="f15w400"
                    brandColor="contentSecondary"
                    rawText={placeholder ?? translate('native.search.placeholder_scores')}
                    style={styles.placeholder}
                />
            </CommonTouchable>
            {trailingButton}
        </View>
    ),
)

const styles = StyleSheet.create({
    container: {
        height: FIELD_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: FIELD_HEIGHT,
        borderColor: brandColors.formDefault,
        backgroundColor: brandColors.backgroundDefault,
        paddingLeft: layout.marginXm,
    },
    pressArea: {
        flex: 1,
        height: '100%',
        flexDirection: 'row',
        alignItems: 'center',
    },
    placeholder: {
        flex: 1,
        marginLeft: layout.marginXm,
    },
})
