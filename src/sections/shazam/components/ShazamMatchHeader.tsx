import { Image, Linking, Platform, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    CommonTouchable,
    FastImage,
    Icon,
    layout,
    NavigationIconButton,
    useAppSafeArea,
} from '@mu-native/ds'
import { chevronLeft } from '@mu-native/icons/chevronLeft'
import { image } from '@mu-native/icons/image'
import { translate } from '@mu-native/locale'
import type { ShazamMatch } from '@mu-native/shazam'

import MetricaEvents from '../../../App/constants/MetricaEvents.ts'
import reportEvent from '../../../App/Utils/Analytics.ts'

type Props = {
    match: ShazamMatch
    onBackPress: () => void
}

export const ShazamMatchHeader = ({ match, onBackPress }: Props) => {
    const insets = useAppSafeArea()
    const topInset = insets.top - (Platform.OS === 'ios' ? 13 : 0)
    const hasArtwork = !!match.artworkURL
    const subtitle = match.artist
        ? translate('native.shazam.by_artist', { artist: match.artist })
        : undefined
    const appleMusicURL =
        match.appleMusicURL ||
        `https://music.apple.com/search?term=${encodeURIComponent(
            [match.title, match.artist].filter(Boolean).join(' '),
        )}`

    const onAppleMusicPress = () => {
        reportEvent(MetricaEvents.SHAZAM_OPEN_APPLE_MUSIC_CLICK, {
            has_apple_music_url: !!match.appleMusicURL,
        })
        Linking.openURL(appleMusicURL).catch(() => undefined)
    }

    return (
        <View style={styles.container}>
            {hasArtwork ? (
                <>
                    {/* FastImage doesn't support blurRadius — keep raw Image for the blurred backdrop. */}
                    <Image
                        source={{ uri: match.artworkURL }}
                        style={styles.backgroundImage}
                        blurRadius={34}
                        resizeMode="cover"
                    />
                    <View style={styles.overlay} />
                </>
            ) : (
                <View style={styles.placeholderBackground} />
            )}

            <View style={{ paddingTop: topInset }}>
                <View style={styles.navBar}>
                    <NavigationIconButton
                        icon={chevronLeft}
                        color={brandColors.contentPrimary}
                        onPress={onBackPress}
                    />
                    <CommonTouchable onPress={onAppleMusicPress} style={styles.appleMusicButton}>
                        <AppText
                            rawText={translate('native.shazam.open_in_apple_music')}
                            font="f15w400"
                            brandColor="contentPrimary"
                            decorationLine="underline"
                            lineHeight={20}
                        />
                    </CommonTouchable>
                </View>
                <View style={styles.content}>
                    {hasArtwork ? (
                        <FastImage source={{ uri: match.artworkURL }} style={styles.artwork} />
                    ) : (
                        <Icon source={image} size={120} />
                    )}
                    <View style={styles.textBlock}>
                        <AppText
                            style={styles.title}
                            rawText={match.title}
                            font="f44w400Accent"
                            brandColor="contentPrimary"
                            textAlign="center"
                            lineHeight={40}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.5}
                        />
                        {!!subtitle && (
                            <AppText
                                rawText={subtitle}
                                font="f15w400"
                                brandColor="contentPrimary"
                                textAlign="center"
                                lineHeight={20}
                                numberOfLines={1}
                            />
                        )}
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        height: 384,
        overflow: 'hidden',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFill,
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: brandColors.exceptionFrost,
    },
    placeholderBackground: {
        ...StyleSheet.absoluteFill,
        backgroundColor: brandColors.colorBackgroundDisabled,
    },
    navBar: {
        height: 56,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    appleMusicButton: {
        paddingVertical: 8,
    },
    content: {
        alignItems: 'center',
        paddingTop: 24,
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: 24,
    },
    artwork: {
        width: 120,
        height: 120,
        borderRadius: 1,
        backgroundColor: brandColors.backgroundHighlight,
    },
    textBlock: {
        alignSelf: 'stretch',
        gap: 8,
    },
    title: {
        letterSpacing: 0.5,
    },
})
