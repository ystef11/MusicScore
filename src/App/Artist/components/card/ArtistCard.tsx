import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { colors, layout } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_GREY_900 } from '../../../constants/styles'

type IProps = {
    titleText: string
    contentWidth: number
    scores: number
    compositions?: number
    avatarImage?: string
}

const ArtistCard = ({ titleText, contentWidth, scores, compositions, avatarImage }: IProps) => {
    return (
        <View style={StyleSheet.flatten([styles.container, { width: contentWidth || '95%' }])}>
            <Image source={{ uri: avatarImage }} style={styles.avatar} />
            <Text style={styles.title}>{titleText}</Text>
            <View style={styles.buttonsContainer}>
                <View style={styles.button}>
                    <Text style={styles.number}>{scores}</Text>
                    <Text style={styles.subTitle}>
                        {translate(scores > 1 ? `native.artists.scores` : `native.artists.score`)}
                    </Text>
                </View>
                {compositions ? (
                    <View style={styles.button}>
                        <Text style={styles.number}>{compositions}</Text>
                        <Text style={styles.subTitle}>
                            {translate(
                                compositions > 1
                                    ? `native.artists.compositions`
                                    : `native.artists.composition`,
                            )}
                        </Text>
                    </View>
                ) : null}
            </View>
        </View>
    )
}

const newAvatarSize = 92

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 200,
        maxWidth: layout.maxTabletWidth,
        alignSelf: 'center',
        backgroundColor: colors.white,
        alignItems: 'center',
    },
    avatar: {
        width: newAvatarSize,
        height: newAvatarSize,
        borderRadius: newAvatarSize / 2,
        borderWidth: 1,
        backgroundColor: colors.white100,
        borderColor: colors.white,
        marginTop: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLOR_GREY_900,
        marginTop: 8,
        marginBottom: 16,
    },
    buttonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    button: {
        alignItems: 'center',
    },
    number: {
        fontSize: 14,
        fontWeight: '600',
        color: COLOR_GREY_900,
        lineHeight: 20,
    },
    subTitle: {
        fontSize: 12,
        lineHeight: 16,
        color: colors.gray500,
        marginHorizontal: 16,
    },
})

export default React.memo(ArtistCard)
