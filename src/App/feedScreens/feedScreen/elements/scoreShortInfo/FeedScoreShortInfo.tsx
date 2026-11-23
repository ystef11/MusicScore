import { Text } from 'react-native'

import { renderTaggedText } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { styles as itemTextStyles } from '../itemText/styles'

import { styles } from './styles'

type Props = {
    item: any
    openScore: () => void
    openScoreAuthorProfile: () => void
}

const FeedScoreShortInfo = ({ item, openScore, openScoreAuthorProfile }: Props) => {
    const { scoreTitle, scoreAuthorName } = styles
    const message = translate('native.feed.score_by_author', {
        title: String(item.scoreTitle ?? ''),
        author: String(item.scoreAuthorName ?? ''),
    })
    return (
        <Text style={[styles.textContainer, itemTextStyles.textStyle]}>
            {renderTaggedText(message, {
                score: <Text style={scoreTitle} onPress={openScore} />,
                author: <Text style={scoreAuthorName} onPress={openScoreAuthorProfile} />,
            })}
        </Text>
    )
}

export default FeedScoreShortInfo
