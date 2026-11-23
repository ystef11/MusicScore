import { CommonTouchable } from '@mu-native/ds'

import FeedItemText from '../elements/itemText/FeedItemText'
import FeedScoreShortInfo from '../elements/scoreShortInfo/FeedScoreShortInfo'

import FeedCommentButtons from './FeedCommentButtons'

type IFeedItemBodyProps = {
    item: any
    likesCount: number
    openScore: () => void
    onPressItem: () => void
    openComments: () => void
    openScoreAuthorProfile: () => void
}

const FeedItemBody = ({
    onPressItem,
    item,
    openScore,
    openScoreAuthorProfile,
    likesCount,
    openComments,
}: IFeedItemBodyProps) => (
    <CommonTouchable onPress={onPressItem}>
        {!!item.scoreTitle && (
            <FeedScoreShortInfo
                item={item}
                openScore={openScore}
                openScoreAuthorProfile={openScoreAuthorProfile}
            />
        )}
        {!!item.firstBody && <FeedItemText text={item.firstBody} />}
        {likesCount >= 0 && <FeedCommentButtons openComments={openComments} />}
    </CommonTouchable>
)

export default FeedItemBody
