import { StyleSheet, View } from 'react-native'

import { icons } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { FeedCommentButton } from './commentButton/FeedCommentButton'

export const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
})

type Props = {
    openComments: () => void
}

const FeedCommentButtons = ({ openComments }: Props) => (
    <View style={styles.container}>
        <FeedCommentButton source={icons.likeIcon} onPress={openComments} text="0" />
        <FeedCommentButton
            source={icons.iconAnswer}
            onPress={openComments}
            text={translate('native.screen_comments.reply')}
        />
    </View>
)

export default FeedCommentButtons
