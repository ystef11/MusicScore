import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, IconSource, layout } from '@mu-native/ds'

type TProps = {
    title: string
    icon: IconSource
    /** Brand background color token value (see LibraryTilesCarousel palette). */
    color: string
    iconOpacity?: number
    onPress: () => void
    testID?: string
}

const TILE_SIZE = 111
const ICON_SIZE = 32

export const LibraryTile = memo(({ title, icon, color, iconOpacity, onPress, testID }: TProps) => (
    <CommonTouchable
        onPress={onPress}
        style={[styles.container, { backgroundColor: color }]}
        testID={testID}
    >
        <View style={styles.icon}>
            <Icon
                source={icon}
                size={ICON_SIZE}
                tint={brandColors.contentPrimary}
                style={iconOpacity != null && { opacity: iconOpacity }}
            />
        </View>
        <AppText
            font="f26w400Accent"
            rawColor={brandColors.contentPrimary}
            numberOfLines={2}
            lineHeight={22}
            rawText={title}
            style={styles.title}
        />
    </CommonTouchable>
))

const styles = StyleSheet.create({
    container: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        borderRadius: 1,
        paddingTop: layout.marginMd,
        paddingBottom: layout.marginSm,
        paddingHorizontal: 10,
        justifyContent: 'space-between',
    },
    icon: {
        opacity: 0.5,
    },
    title: {
        marginTop: layout.marginSm,
    },
})
