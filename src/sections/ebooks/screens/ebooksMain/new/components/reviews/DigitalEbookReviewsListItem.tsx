import { memo, useState } from 'react'
import { Image, StyleSheet, View } from 'react-native'

import { authStoreChunk } from '@mu-native/auth'
import { getStoreValue } from '@mu-native/common'
import {
    AppText,
    CommonTouchable,
    globalStyles,
    Icon,
    presentAlert,
    BrandAppLoader,
    formatCommentsDate,
} from '@mu-native/ds'
import { detail } from '@mu-native/icons/detail'
import { likeFilled } from '@mu-native/icons/likeFilled'
import { likeOutlined } from '@mu-native/icons/likeOutlined'
import { translate } from '@mu-native/locale'

import { commentUserFullName, DigitalEbookReviewModel } from '../../api/digital.ebooks.models.ts'

type TProps = {
    item: DigitalEbookReviewModel
    onLikePress: (
        id: number,
        isLiked: boolean,
        setLiking: (value: boolean) => void,
    ) => Promise<void>
    onDeletePress: (id: number) => void
}

export const DigitalEbookReviewsListItem = memo(({ item, onLikePress, onDeletePress }: TProps) => {
    const [isLiking, setLiking] = useState(false)
    const isMy = item.user.id === getStoreValue(authStoreChunk.props.getUser).id
    const onLike = () => {
        if (isMy) return
        if (isLiking) return
        onLikePress(item.id, item.is_liked, setLiking)
    }

    const onMenuPress = async () => {
        const id = await presentAlert({
            rawTitle: translate('native.review.delete_confirmation_title'),
            buttons: [
                { rawText: translate('native.shared.delete'), id: 'delete', style: 'destructive' },
                { rawText: translate('native.shared.cancel'), id: 'cancel', style: 'cancel' },
            ],
        })
        if (id === 'delete') onDeletePress(item.id)
    }

    return (
        <View style={styles.listItem}>
            <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
            <View style={globalStyles.flex1}>
                <View style={styles.nameDate}>
                    <AppText
                        font="f15w500"
                        rawText={commentUserFullName(item)}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={globalStyles.flexShrink}
                    />
                    <AppText
                        font="f15w500"
                        brandColor="contentSecondary"
                        rawText={formatCommentsDate(item.date_created)}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    />
                </View>
                <AppText font="f15w400" rawText={item.body.trim()} />

                <View style={styles.footer}>
                    <CommonTouchable
                        activeOpacity={isMy ? 1 : 0.8}
                        hitSlop={20}
                        onPress={onLike}
                        style={styles.likeButton}
                    >
                        {isLiking && <BrandAppLoader />}
                        {!isLiking && <Icon source={item.is_liked ? likeFilled : likeOutlined} />}
                        <AppText
                            rawText={item.likes_count.toString()}
                            brandColor="contentSecondary"
                            font="f15w500"
                        />
                    </CommonTouchable>
                </View>
            </View>
            {isMy && (
                <CommonTouchable onPress={onMenuPress} style={styles.menu}>
                    <Icon source={detail} />
                </CommonTouchable>
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    listItem: {
        flexDirection: 'row',
        columnGap: 16,
    },

    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },

    nameDate: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 8,
        marginBottom: 11,
    },

    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 44,
    },

    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 4,
        height: 44,
    },

    menu: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
