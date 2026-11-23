import { memo } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, CommonTouchable, showAlertNotification } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useValues } from '@ug/store'

const LabelItem = (props: { text: string; toastText: string }) => {
    const onPress = () => {
        showAlertNotification({
            title: props.toastText,
            expiresIn: 3000,
        })
    }

    return (
        <CommonTouchable style={styles.item} onPress={onPress}>
            <AppText rawText={props.text} font="f13w400" brandColor="exceptionConstantWhite" />
        </CommonTouchable>
    )
}

export const NewProLabel = memo(() => {
    const [isPro, isProPlus, isLearn, isLearnLite, isBooks, isPremium] = useValues([
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
        marketingStoreChunk.props.getIsLearningLite,
        marketingStoreChunk.props.getIsEbookRights,
        marketingStoreChunk.props.getIsPremiumRights,
    ])

    return (
        <View style={styles.items}>
            {isPro && !isProPlus && (
                <LabelItem text="Pro" toastText={translate('native.user.access.pro.toast')} />
            )}
            {isProPlus && (
                <LabelItem text="Pro+" toastText={translate('native.user.access.proPlus.toast')} />
            )}
            {isLearn && (
                <LabelItem text="Learn" toastText={translate('native.user.access.learn.toast')} />
            )}
            {isLearnLite && !isLearn && (
                <LabelItem
                    text="Learn Lite"
                    toastText={translate('native.user.access.learnLite.toast')}
                />
            )}
            {isBooks && (
                <LabelItem
                    text={translate('native.user.access.books.label')}
                    toastText={translate('native.user.access.books.toast')}
                />
            )}
            {isPremium && (
                <LabelItem
                    text="Premium"
                    toastText={translate('native.user.access.premium.toast')}
                />
            )}
        </View>
    )
})

const styles = StyleSheet.create({
    items: {
        flexDirection: 'row',
        gap: 8,
    },

    item: {
        backgroundColor: brandColors.contentPrimary,
        height: 16,
        paddingHorizontal: 4,
        borderRadius: 1,
    },
})
