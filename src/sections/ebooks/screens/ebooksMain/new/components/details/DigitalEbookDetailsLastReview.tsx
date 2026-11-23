import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { songbookTestIds } from '@mu/mu-mobile-test-id'
import { getStoreValue } from '@mu-native/common'
import { AppText, brandColors, CommonTouchable, Icon, layout } from '@mu-native/ds'
import { chevronRight } from '@mu-native/icons/chevronRight'
import { translate } from '@mu-native/locale'
import { Screen, useAppNavigation } from '@mu-native/navigation'

import formatDate from '../../../../../../../App/Utils/Date'
import { commentUserFullName, DigitalEbookLastCommentModel } from '../../api/digital.ebooks.models'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore'

type TProps = {
    comment?: DigitalEbookLastCommentModel
    commentCount: number
}

export const DigitalEbookDetailsLastReview = memo(({ comment, commentCount }: TProps) => {
    const navigation = useAppNavigation()
    const chunk = useDigitalEbookDetailsChunk()

    const onOpenReviews = () => {
        navigation.navigate(Screen.ebooksReviewsScreen, {
            ebookId: getStoreValue(chunk.props.getEbook).id,
        })
    }

    if (!comment) {
        return (
            <CommonTouchable
                testID={songbookTestIds.detailsReviews}
                style={styles.header}
                onPress={onOpenReviews}
            >
                <AppText rawText={translate('native.leave_a_review')} font="f17w500" />
                <Icon source={chevronRight} size={24} tint={brandColors.contentPrimary} />
            </CommonTouchable>
        )
    }

    let subtitle = formatDate(comment.date_created * 1000, 'DD MMMM')
    const name = commentUserFullName(comment)
    if (name) subtitle += `, ${name}`

    return (
        <>
            <CommonTouchable
                testID={songbookTestIds.detailsReviews}
                style={styles.header}
                onPress={onOpenReviews}
            >
                <AppText rawText={translate('native.ebooks.reviews')} font="f17w500" />
                <AppText
                    rawText={commentCount.toString()}
                    font="f17w400"
                    brandColor="contentSecondary"
                    style={styles.commentCount}
                />
                <Icon source={chevronRight} size={24} tint={brandColors.contentPrimary} />
            </CommonTouchable>
            <CommonTouchable style={styles.review} onPress={onOpenReviews}>
                <AppText
                    font="f15w400"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                    rawText={comment.body}
                />
                <AppText font="f13w400" brandColor="contentSecondary" rawText={subtitle} />
            </CommonTouchable>
        </>
    )
})
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
    },

    review: {
        backgroundColor: brandColors.backgroundInactive,
        marginHorizontal: layout.baseMarginFromEdges,
        padding: 12,
        borderRadius: 12,
        gap: 12,
        marginTop: 16,
    },

    commentCount: {
        marginStart: 4,
    },
})
