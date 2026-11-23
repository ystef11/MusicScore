import { useState } from 'react'
import { Linking, StyleSheet, Text, View } from 'react-native'

import { colors, CommonTouchable, staticSafeArea } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_GREY_900 } from '../../../constants/styles'

const getWebsiteText = (url: string) => {
    if (url.includes('instagram')) return 'Instagram'
    if (url.includes('facebook')) return 'Facebook'
    if (url.includes('bandcamp')) return 'Bandcamp'
    if (url.includes('music.apple')) return 'Apple Music'
    if (url.includes('youtube')) return 'YouTube'
    if (url.includes('spotify')) return 'Spotify'
    return 'Website'
}

export const ArtistInfoContainer = (params: any) => {
    const { info } = params
    const [isBioExpanded, setBioExpanded] = useState(false)

    const expandBio = () => {
        setBioExpanded(true)
    }

    const handleLinkPress = (link: string) => {
        try {
            Linking.openURL(link)
        } catch (error) {
            console.log('ERROR', error)
        }
    }

    const renderLinks = (item: string) => (
        <CommonTouchable key={item} onPress={() => handleLinkPress(item)}>
            <Text style={styles.link}>{getWebsiteText(item)}</Text>
        </CommonTouchable>
    )

    if (!info?.bio) {
        return (
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{translate('native.artists.artist_info')}</Text>
                <Text style={styles.info}>{translate('native.artists.no_bio')}</Text>
            </View>
        )
    }

    return (
        <>
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{translate('native.artists.artist_info')}</Text>
                <Text style={styles.subTitle}>{translate('native.artists.bio')}</Text>
                <Text style={styles.info} {...(!isBioExpanded ? { numberOfLines: 3 } : {})}>
                    {info?.bio}
                </Text>
                {!isBioExpanded ? (
                    <CommonTouchable onPress={expandBio}>
                        <View />
                    </CommonTouchable>
                ) : null}
            </View>
            {info?.websites ? (
                <View style={styles.linksContainer}>
                    {info?.websites?.length ? (
                        <Text style={styles.subTitle}>{translate('native.artists.links')}</Text>
                    ) : null}
                    {info?.websites?.map(renderLinks)}
                </View>
            ) : null}
        </>
    )
}

const styles = StyleSheet.create({
    infoContainer: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: staticSafeArea().bottom,
    },
    title: {
        fontSize: 20,
        lineHeight: 28,
        fontWeight: '600',
        marginBottom: 12,
        color: colors.text900,
    },
    subTitle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: colors.text900,
        marginBottom: 4,
    },
    link: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.blue600,
        marginBottom: 10,
    },
    linksContainer: {
        paddingHorizontal: 20,
        marginTop: 10,
    },
    info: {
        fontSize: 16,
        color: COLOR_GREY_900,
    },
})
