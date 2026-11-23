import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, layout, SvgAsset } from '@mu-native/ds'

import type { TSearchGenre } from '../constants/searchGenres'

type TProps = {
    genre: TSearchGenre
    onPress: (genre: TSearchGenre) => void
    testID?: string
}

const ICON_SIZE = 48

export const GenreRow = memo(({ genre, onPress, testID }: TProps) => (
    <CommonTouchable
        onPress={() => onPress(genre)}
        style={[styles.container, { backgroundColor: genre.color }]}
        testID={testID}
    >
        <View style={styles.titleRow}>
            <AppText
                font="f44w400Accent"
                rawColor={brandColors.contentPrimary}
                rawText={genre.name}
            />
            {!!genre.count && (
                <AppText
                    font="f15w400"
                    rawColor={brandColors.contentPrimary}
                    rawText={genre.count}
                    style={styles.countText}
                />
            )}
        </View>
        {!!genre.icon && (
            <SvgAsset
                type={genre.icon}
                width={ICON_SIZE}
                height={ICON_SIZE}
                tint={brandColors.contentPrimary}
            />
        )}
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 1,
        paddingHorizontal: layout.marginSm,
        paddingVertical: layout.marginMd,
    },
    titleRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: layout.marginSm,
    },
    countText: {
        lineHeight: 26,
    },
})
