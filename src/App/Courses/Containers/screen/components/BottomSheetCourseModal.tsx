import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { useCourseDetailsContext } from '@mu-native/course-details'
import {
    AppText,
    BrandAppLoader,
    layout,
    MuseButton,
    NativeBottomSheet,
    NativeBottomSheetRef,
    replacerText,
    useAppSafeArea,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import {
    billingThunks,
    marketingConstants,
    marketingStoreChunk,
    marketingThunks,
} from '@mu-native/marketing'
import { Screen, useAppNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../constants/MetricaEvents'
import reportEvent from '../../../../Utils/Analytics'
import { loadCourseInfo } from '../../../coursesActionsAsync'

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: layout.baseMarginFromEdges,
    },
    subtitle: {
        marginTop: 8,
        marginBottom: 24,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    button: {
        flex: 1,
    },
    loaderContainer: {
        marginTop: 16,
        alignItems: 'center',
    },
})

type TBottomSheetCourseProps = {
    courseName: string
    isEditorPicks: boolean
    courseId: string
}

const getBuyButtonText = (
    isEditorsPick: boolean,
    isUserSpendCredit: boolean,
    ifNotEditorsPick: boolean,
    courseName: string,
) => {
    if (isEditorsPick) {
        return {
            title: translate('native.courses.lite_great_choice'),
            buttonBuyText: translate('native.courses.lite_get_free_course'),
            summary: [
                translate('native.courses.lite_unlock_one_course'),
                replacerText({
                    text: translate('native.courses.lite_get_permanent_access', { courseName }),
                }),
            ],
        }
    }
    if (isUserSpendCredit) {
        return {
            title: translate('native.courses.lite_want_unlimited_title'),
            summary: [
                translate('native.courses.lite_allowance_used'),
                translate('native.courses.lite_upgrade_to_play'),
            ],
            buttonBuyText: translate('native.courses.lite_upgrade'),
        }
    }

    if (ifNotEditorsPick) {
        return {
            title: translate('native.courses.lite_great_choice'),
            summary: [
                translate('native.courses.lite_unlock_one_course'),
                replacerText({
                    text: translate('native.courses.lite_not_in_collection', { courseName }),
                }),
            ],
            buttonBuyText: translate('native.courses.lite_upgrade'),
        }
    }

    return { title: '', buttonBuyText: '', summary: [] }
}
const BottomSheetCourseModalContent = ({
    courseId,
    courseName,
    isEditorPicks,
    onClose,
}: TBottomSheetCourseProps & { onClose: () => void }) => {
    const insets = useAppSafeArea({ bottom: 16 })
    const { navigate } = useAppNavigation()
    const {
        buyCourseByCreditThunk,
        loadCourseInfo: loadCourseInfoAction,
        loadBalance,
    } = useActions({
        buyCourseByCreditThunk: billingThunks.buyCourseByCreditThunk,
        loadCourseInfo,
        loadBalance: marketingThunks.loadUserBalance,
    })
    const [creditBalance] = useValues([marketingStoreChunk.props.getCourseBalance])
    const courseDetailsContext = useCourseDetailsContext()

    const [isLoading, setIsLoading] = useState(false)

    const isEditorsPickAndBalance = creditBalance > 0
    const isUserSpendCredit = creditBalance === 0 && isEditorPicks

    const { title, summary, buttonBuyText } = getBuyButtonText(
        isEditorsPickAndBalance,
        isUserSpendCredit,
        !isEditorPicks,
        courseName,
    )

    const callbackAfterBuy = useCallback(() => {
        loadCourseInfoAction(courseDetailsContext, 'online')
        onClose()
        setIsLoading(false)
        loadBalance()
    }, [courseDetailsContext, loadBalance, loadCourseInfoAction, onClose])

    const onClickBuyButton = useCallback(() => {
        if (isEditorsPickAndBalance) {
            setIsLoading(true)
            buyCourseByCreditThunk({ courseId, callback: callbackAfterBuy })
            return
        }

        onClose()

        navigate(Screen.screenLongLanding, { planName: 'learning' })
    }, [
        buyCourseByCreditThunk,
        callbackAfterBuy,
        courseId,
        isEditorsPickAndBalance,
        navigate,
        onClose,
    ])

    const onCancelPress = useCallback(() => {
        setTimeout(onClose, 100)
    }, [onClose])

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom }]}>
            <AppText rawText={title} font="f44w400Accent" lineHeight={44} textAlign="center" />
            {summary.map(text => (
                <AppText
                    key={text}
                    rawText={text}
                    font="f15w400"
                    brandColor="contentSecondary"
                    style={styles.subtitle}
                    textAlign="center"
                />
            ))}
            <View style={styles.buttonsContainer}>
                <MuseButton
                    title={buttonBuyText}
                    type="primary"
                    style={styles.button}
                    onPress={onClickBuyButton}
                    disabled={isLoading}
                />
                <MuseButton
                    title={translate('native.search.cancel_button')}
                    type="secondary"
                    style={styles.button}
                    onPress={onCancelPress}
                    disabled={isLoading}
                />
            </View>
            {isLoading && (
                <View style={styles.loaderContainer}>
                    <BrandAppLoader size="s" />
                </View>
            )}
        </View>
    )
}

const BottomSheetCourseModal = (props: TBottomSheetCourseProps) => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)
    const [creditBalance, currentSubscriptionId] = useValues([
        marketingStoreChunk.props.getCourseBalance,
        marketingStoreChunk.props.getCurrentSubscriptionProductId,
    ])

    const isEditorsPickAndBalance = creditBalance > 0

    useEffect(() => {
        if (
            marketingConstants.plansForUpgradeLite.includes(currentSubscriptionId) ||
            isEditorsPickAndBalance
        ) {
            setTimeout(() => sheetRef.current?.present(), 1200)
            reportEvent(MetricaEvents.TEMP_COURSE_PIECE_POPUP_SHOW, {
                'params.key': ['course status', 'course balance'],
                'params.str_value': ['available', ''],
                'params.value': [0, creditBalance],
            })
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const onClose = useCallback(() => {
        sheetRef.current?.dismiss()
    }, [])

    return (
        <NativeBottomSheet ref={sheetRef}>
            <BottomSheetCourseModalContent {...props} onClose={onClose} />
        </NativeBottomSheet>
    )
}

export default memo(BottomSheetCourseModal)
