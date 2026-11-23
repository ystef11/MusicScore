import React from 'react'
import {
    Image,
    ImageStyle,
    StyleSheet,
    Text,
    TextStyle,
    TouchableOpacity,
    ViewStyle,
} from 'react-native'

import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_LINK } from '../../constants/styles'
import { TComment } from '../coursesTypes'

import TruncatedThreadElement from './TruncatedThreadElement'

type TProps = {
    comments: TComment[]
    onThread: () => void
}

const styles = StyleSheet.create({
    container: {
        marginTop: 12,
        borderRadius: 8,
    } as ViewStyle,
    showAll: {
        marginTop: 4,
        marginBottom: 8,
        marginLeft: 12,
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
    } as ViewStyle,
    count: {
        fontWeight: 'bold',
        fontSize: 14,
        lineHeight: 20,
        color: COLOR_LINK,
    } as TextStyle,
    arrow: {
        tintColor: COLOR_LINK,
        maxWidth: 14,
        marginLeft: 8,
    } as ImageStyle,
})

const TruncatedThread = ({ comments, onThread }: TProps): React.ReactElement => {
    return (
        <TouchableOpacity style={styles.container} onPress={onThread}>
            {comments
                .reverse()
                ?.map((comment: TComment) => (
                    <TruncatedThreadElement key={comment.id} comment={comment} />
                ))}
            {comments?.length > 1 ? (
                <TouchableOpacity style={styles.showAll} onPress={onThread}>
                    <Text style={styles.count}>
                        {translate('native.viewAllReplies', { count: comments?.length.toString() })}
                    </Text>
                    <Image
                        source={icons.arrowForwardXs}
                        resizeMode="contain"
                        style={styles.arrow}
                    />
                </TouchableOpacity>
            ) : null}
        </TouchableOpacity>
    )
}

export default TruncatedThread
