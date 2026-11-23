import { memo } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable } from '@mu-native/ds'

import { TPlaylistCardProps } from '../types/playlistTypes.ts'

export const PLAYLIST_CARD_SIZE = 171

const Divider = ({ isWhite }: { isWhite: boolean }) => (
    <View style={[styles.line, isWhite && styles.whiteLine]} />
)

type TProps = TPlaylistCardProps & {
    size?: number
    onPress?: () => void
    testID?: string
}

export const PlaylistCard = memo(
    ({
        imageUrl,
        title,
        imageType,
        backgroundColor,
        isWhite,
        size = PLAYLIST_CARD_SIZE,
        onPress,
        testID,
    }: TProps) => {
        const isImageBg = imageType === 'fullSizeBg'
        const isImageInCorner = imageType === 'fitRight'

        return (
            <CommonTouchable onPress={onPress} testID={testID}>
                <View
                    style={[
                        styles.container,
                        { width: size, height: size },
                        !isImageBg && !!backgroundColor && { backgroundColor },
                    ]}
                >
                    {isImageBg && (
                        <>
                            <Image
                                source={{ uri: imageUrl }}
                                style={styles.backgroundImage}
                                resizeMode="cover"
                            />
                            <View style={styles.shadow} />
                        </>
                    )}
                    <Divider isWhite={isWhite} />
                    <View
                        style={[
                            styles.imageWrapper,
                            { justifyContent: isImageInCorner ? 'flex-end' : 'center' },
                        ]}
                    >
                        {!isImageBg && !!imageUrl && (
                            <Image
                                style={isImageInCorner ? styles.squareImage : styles.fullWidthImage}
                                source={{ uri: imageUrl }}
                                resizeMode={isImageInCorner ? 'cover' : 'contain'}
                            />
                        )}
                    </View>
                    <View style={styles.titleContainer}>
                        <Divider isWhite={isWhite} />
                        <AppText
                            font="f28w400Accent"
                            numberOfLines={2}
                            rawText={title}
                            style={[styles.title, isWhite && styles.whiteText]}
                        />
                        <Divider isWhite={isWhite} />
                    </View>
                </View>
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    container: {
        padding: 6,
        borderRadius: 1,
        gap: 4,
        overflow: 'hidden',
    },
    imageWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        // Keeps the square art clear of the left edge, per the design.
        paddingLeft: 40,
    },
    squareImage: {
        height: '100%',
        aspectRatio: 1,
    },
    fullWidthImage: {
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFill,
    },
    shadow: {
        ...StyleSheet.absoluteFill,
        backgroundColor: brandColors.additionalDarkImageOverlay,
    },
    titleContainer: {
        gap: 2,
    },
    line: {
        height: 1,
        backgroundColor: brandColors.contentPrimary,
    },
    whiteLine: {
        backgroundColor: brandColors.exceptionConstantWhite,
    },
    title: {
        color: brandColors.contentPrimary,
    },
    whiteText: {
        color: brandColors.exceptionConstantWhite,
    },
})
