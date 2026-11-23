import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { DigitalEbookDetailsSampleButton } from './DigitalEbookDetailsSampleButton'
import {
    DigitalEbookGetFreeSongBookButton,
    DigitalEbookGetSongBookButton,
} from './DigitalEbookGetSongBookButton'
import { DigitalEbookShareButton } from './DigitalEbookShareButton'
import { DigitalEbookToggleFavoriteButton } from './DigitalEbookToggleFavoriteButton'
import { DigitalEbookToggleRatedButton } from './DigitalEbookToggleRatedButton'

type TProps = {
    style?: StyleProp<ViewStyle>
}

export const DigitalEbookDetailsButtons = memo(({ style }: TProps) => {
    return (
        <View style={[styles.base, style]}>
            <DigitalEbookGetFreeSongBookButton />
            <DigitalEbookGetSongBookButton />
            <View style={styles.bottomRow}>
                <View style={styles.bottomRow}>
                    <DigitalEbookToggleFavoriteButton />
                    <DigitalEbookDetailsSampleButton />
                </View>
                <DigitalEbookToggleRatedButton />
                <DigitalEbookShareButton />
            </View>
        </View>
    )
})

const styles = StyleSheet.create({
    base: {
        minHeight: 96,
        rowGap: 8,
    },
    bottomRow: {
        flex: 1,
        flexDirection: 'row',
        height: 44,
        columnGap: 4,
    },
})
