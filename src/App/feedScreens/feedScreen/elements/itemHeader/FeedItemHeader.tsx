import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { platform } from '@mu-native/common'
import { colors, icons, layout, renderTaggedText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { formatDate } from '../../../../Score/Comments/commentHelpers'

const VERB_KEYS = {
    20: 'native.feed.items.20',
    21: 'native.feed.items.21',
    22: 'native.feed.items.22',
    26: 'native.feed.items.26',
    30: 'native.feed.items.30',
    31: 'native.feed.items.31',
    51: 'native.feed.items.51',
} as const

const USER_VERB_KEYS = {
    20: 'native.feed.items.20_by_user',
    21: 'native.feed.items.21_by_user',
    22: 'native.feed.items.22_by_user',
    26: 'native.feed.items.26_by_user',
    30: 'native.feed.items.30_by_user',
    31: 'native.feed.items.31_by_user',
} as const

const BALANCE_TOPPED_UP_VERBS = [57, 58]

const getVerbText = (verb: number, amount?: number | string, userName?: string) => {
    if (BALANCE_TOPPED_UP_VERBS.includes(verb)) {
        return translate('native.feed.items.57', { amount: String(amount || '') })
    }
    const userVerbKey = USER_VERB_KEYS[verb as keyof typeof USER_VERB_KEYS]
    if (userName && userVerbKey) return translate(userVerbKey, { userName })
    return translate(VERB_KEYS[verb as keyof typeof VERB_KEYS])
}

const imageSource = {
    51: icons.notesPreview,
    55: icons.balancePreview,
    56: icons.balancePreview,
}

const FeedItemHeader = ({ item }: any) => {
    const verbText = getVerbText(item.verb, item?.data?.amount, item?.firstUserName)
    return (
        <View style={styles.header}>
            <View style={styles.imageContainer}>
                <Image
                    source={
                        imageSource[item.verb as keyof typeof imageSource] || {
                            uri: item.firstUserAvatarUrl,
                        }
                    }
                    resizeMode="cover"
                    style={styles.image}
                />
            </View>
            <View style={styles.titleContainer}>
                <Text style={styles.text}>
                    {renderTaggedText(verbText, {
                        user: <Text style={styles.userName} />,
                    })}
                </Text>
                <Text style={styles.subText}>{formatDate(item.date)}</Text>
            </View>
        </View>
    )
}

const AVATAR_DIMENSIONS = platform.isTablet ? 52 : 40
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
    },
    imageContainer: {
        width: AVATAR_DIMENSIONS,
        height: AVATAR_DIMENSIONS,
        borderColor: colors.white,
        borderWidth: 1,
        borderRadius: AVATAR_DIMENSIONS / 2,
        marginRight: layout.marginMd,
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: AVATAR_DIMENSIONS - 1,
        height: AVATAR_DIMENSIONS - 1,
        borderColor: colors.transparent,
        borderWidth: 1,
        borderRadius: AVATAR_DIMENSIONS / 2,
    },
    titleContainer: {
        maxWidth: '80%',
    },
    text: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.text900,
    },
    userName: {
        fontWeight: '500',
    },
    subText: {
        marginTop: 2,
        fontSize: 12,
        lineHeight: 16,
        color: colors.gray500,
    },
})

export default memo(FeedItemHeader)
