import React from 'react'
import {
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native'

import { NavigationService, Screen } from '@mu-native/navigation'

import { COLOR_DEEP_BLUE, COLOR_LINK, COLOR_SILVER_DEEP } from '../../constants/styles'
import Label from '../../Elements/Label'
import { formatDate } from '../../Score/Comments/commentHelpers'
import { TComment } from '../coursesTypes'

type TProps = {
    comment: TComment
}

// eslint-disable-next-line react/function-component-definition
export default function TruncatedThreadElement({ comment }: TProps): React.ReactElement {
    const { user, date_created, body } = comment
    const navigateToUserProfile = () => {
        NavigationService.navigate(Screen.profileMain, { userId: user.id, userName: user.name })
    }
    let commentText = body
    const mentionIndex = commentText.indexOf('@')
    const commaIndex = commentText.indexOf(',')
    let mention = ''

    if (mentionIndex !== -1) {
        mention = commentText.slice(mentionIndex, commaIndex)
        commentText = commentText.slice(commaIndex)
    }

    return (
        <View style={styles.container}>
            <View style={styles.headingContainer}>
                <View style={styles.headingBlock}>
                    <TouchableOpacity onPress={navigateToUserProfile}>
                        <Image style={styles.avatar} source={{ uri: user.avatar_url }} />
                    </TouchableOpacity>
                    <View style={styles.replyHeadingBlock}>
                        <TouchableOpacity onPress={navigateToUserProfile}>
                            <Text style={styles.title}>{user.name}</Text>
                        </TouchableOpacity>
                        {user.is_pro ? <Label theme="pro" size="small" text="pro" /> : null}
                        <Text style={styles.time}>
                            {`${user.is_pro ? ' ' : ''}• ${formatDate(+date_created)}`}
                        </Text>
                    </View>
                </View>
            </View>
            <Text style={styles.message} numberOfLines={2}>
                <Text style={styles.mention} onPress={navigateToUserProfile}>
                    {mention}
                </Text>
                {commentText}
            </Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    } as ViewStyle,
    headingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
    } as ImageStyle,
    headingBlock: {
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    replyHeadingBlock: {
        marginLeft: 8,
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    title: {
        fontWeight: 'bold',
        fontSize: 14,
        lineHeight: 18,
        color: COLOR_LINK,
        marginRight: 4,
    } as TextStyle,
    time: {
        fontSize: 14,
        lineHeight: 18,
        color: COLOR_SILVER_DEEP,
    } as TextStyle,
    message: {
        paddingTop: 6,
        fontSize: 16,
        lineHeight: 20,
        color: COLOR_DEEP_BLUE,
        marginRight: 2,
    } as TextStyle,
    mention: {
        color: COLOR_LINK,
    } as TextStyle,
})
