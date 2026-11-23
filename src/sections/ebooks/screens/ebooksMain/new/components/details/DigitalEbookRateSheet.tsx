import { forwardRef, memo, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { getStoreValue } from '@mu-native/common'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    MuseButton,
    NativeBottomSheet,
    type NativeBottomSheetName,
    NativeBottomSheetRef,
    nativeDismissFittedSheet,
    staticSafeArea,
} from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { Screen } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../../App/Utils/Analytics'
import { digitalEbooksThunk } from '../../api/digitalEbooksThunk.ts'
import {
    DigitalEbookDetailsChunk,
    useDigitalEbookDetailsChunk,
} from '../../stores/DigitalEbookDetailsStore'

type TProps = {
    rating: number
    onPress: (rating: number) => void
}

export const RateEbookStars = memo(({ onPress, rating }: TProps) => {
    return (
        <View style={styles.ratingStartsWrapper}>
            {new Array(5).fill(null).map((_, index) => (
                <CommonTouchable
                    onPress={() => onPress(index + 1)}
                    key={index}
                    style={styles.ratingStart}
                >
                    <Icon
                        source={star}
                        size={32}
                        tint={
                            rating > index
                                ? brandColors.contentPrimary
                                : brandColors.contentTertiary
                        }
                    />
                </CommonTouchable>
            ))}
        </View>
    )
})
type RatingSheetProps = {
    dismissName: NativeBottomSheetName
    chunk: DigitalEbookDetailsChunk
}
const RatingSheetView = memo<RatingSheetProps>(({ chunk, dismissName }) => {
    const [rating, setRating] = useState(getStoreValue(chunk.props.getRating)?.user_rating ?? 0)

    const [isUpdating] = useValues([chunk.props.getIsUpdatingRating])
    const actions = useActions({ rateBook: digitalEbooksThunk.rateBook })

    const onPress = async () => {
        reportEvent(MetricaEvents.SONGBOOK_RATING_CLICK, {
            screen: Screen.ebookDetails,
            songbook_id: getStoreValue(chunk.props.getEbookId),
        })
        const isSuccess: boolean = (await actions.rateBook(rating, chunk)) as any

        if (isSuccess) nativeDismissFittedSheet(dismissName)
    }

    return (
        <View style={styles.base}>
            <AppText
                rawText={translate('native.ebooks.rate_book_title')}
                font="f44w400Accent"
                textAlign="center"
                style={{ marginBottom: 12 }}
            />
            <AppText
                brandColor="contentSecondary"
                textAlign="center"
                font="f15w400"
                rawText={translate('native.ebooks.rate_book_description')}
            />

            <RateEbookStars rating={rating} onPress={setRating} />

            <MuseButton
                isLoading={isUpdating}
                disabled={rating === 0}
                onPress={onPress}
                type="primary"
                title={translate('native.ebooks.rate_book')}
                style={styles.mh20}
            />
        </View>
    )
})

export const DigitalEbookRateSheet = forwardRef<NativeBottomSheetRef>((_, ref) => {
    const chunk = useDigitalEbookDetailsChunk()
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    useImperativeHandle(
        ref,
        () => ({
            present: () => sheetRef.current?.present(),
            dismiss: () => sheetRef.current?.dismiss(),
        }),
        [],
    )

    return (
        <NativeBottomSheet ref={sheetRef} name="ratingSheetView">
            <RatingSheetView chunk={chunk} dismissName="ratingSheetView" />
        </NativeBottomSheet>
    )
})

const styles = StyleSheet.create({
    base: {
        paddingBottom: staticSafeArea().bottom,
    },

    mh20: {
        marginHorizontal: 20,
    },

    ratingStartsWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        marginVertical: 32,
        columnGap: 12,
    },

    ratingStart: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
