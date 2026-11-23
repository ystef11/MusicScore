import { useEffect, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    globalStyles,
    layoutHelpers,
    NativeBottomSheet,
    type NativeBottomSheetRef,
    OnboardingTitleComponent,
    useSheetDismiss,
} from '@mu-native/ds'
import { giftChecklistStoreChunk, type TIdCard } from '@mu-native/gift-checklist'
import { PlainLocaleKey, translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'

/* eslint-disable import/no-relative-packages */
import { useActions } from '@ug/store'

import Button from '../../../../../../App/Elements/NewButton'
import reportEvent from '../../../../../../App/Utils/Analytics'

const tabByActiveCardId = {
    1: 'EbooksTab',
    2: 'LearnTab',
    3: 'BrowseTab',
    4: 'EbooksTab',
    5: 'LearnTab',
    6: 'BrowseTab',
    8: 'BrowseTab',
} as const

type TGiftType = 'songbook' | 'course' | 'score'

const giftTypeByActiveCardId: Record<TIdCard, TGiftType> = {
    1: 'songbook',
    2: 'course',
    3: 'score',
    4: 'songbook',
    5: 'course',
    6: 'score',
    8: 'score',
}

const titleByActiveCardId: Record<TIdCard, PlainLocaleKey> = {
    1: 'native.marketing.gift_checklist.claim_free_songbook',
    2: 'native.marketing.gift_checklist.claim_free_course',
    3: 'native.marketing.gift_checklist.claim_free_score',
    4: 'native.marketing.gift_checklist.claim_free_songbooks',
    5: 'native.marketing.gift_checklist.claim_free_courses',
    6: 'native.marketing.gift_checklist.claim_free_scores',
    8: 'native.marketing.gift_checklist.claim_free_score',
}

const giftCopyByType: Record<
    TGiftType,
    {
        openButton: PlainLocaleKey
        stepOpen: PlainLocaleKey
        stepExplore: PlainLocaleKey
        stepGetFree: PlainLocaleKey
    }
> = {
    songbook: {
        openButton: 'native.marketing.gift_checklist.open_songbooks',
        stepOpen: 'native.marketing.gift_checklist.step_open_songbooks',
        stepExplore: 'native.marketing.gift_checklist.step_explore_songbooks',
        stepGetFree: 'native.marketing.gift_checklist.step_get_free_songbook',
    },
    course: {
        openButton: 'native.marketing.gift_checklist.open_courses',
        stepOpen: 'native.marketing.gift_checklist.step_open_courses',
        stepExplore: 'native.marketing.gift_checklist.step_explore_courses',
        stepGetFree: 'native.marketing.gift_checklist.step_get_free_course',
    },
    score: {
        openButton: 'native.marketing.gift_checklist.open_scores',
        stepOpen: 'native.marketing.gift_checklist.step_open_scores',
        stepExplore: 'native.marketing.gift_checklist.step_explore_scores',
        stepGetFree: 'native.marketing.gift_checklist.step_get_free_score',
    },
}

const getInstructionList = (id: TIdCard) => {
    const copy = giftCopyByType[giftTypeByActiveCardId[id]]

    return [
        translate(copy.stepOpen),
        translate(copy.stepExplore),
        translate('native.marketing.gift_checklist.step_found_favorite'),
        translate(copy.stepGetFree),
        translate('native.marketing.gift_checklist.step_enjoy'),
    ]
}

const styles = StyleSheet.create({
    giftInfoContainer: {
        width: '100%',
        minHeight: 300,
        justifyContent: 'flex-start',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(40),
    },
    claimPressButtonStyle: {
        backgroundColor: brandColors.accentPrimary,
        borderRadius: 50,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(8),
    },
    transparent: { backgroundColor: brandColors.transparent },
})

const CompleteModalComponent = ({
    currentGiftId,
    onCloseModalCallback,
}: {
    currentGiftId: TIdCard
    onCloseModalCallback: () => void
}) => {
    const close = useSheetDismiss()
    const { goBack, navigate } = useAppNavigation()

    const onClaimPress = () => {
        reportEvent('Temp Checklist Success Prize Click')
        goBack()
        navigate('TabNavigator', {
            screen: tabByActiveCardId[currentGiftId],
        })
        onCloseModalCallback()
    }

    const onCloseModal = () => {
        close()
    }

    return (
        <View style={styles.giftInfoContainer}>
            <OnboardingTitleComponent
                borderWidth={0}
                titleStyle={globalStyles.textAlignCenter}
                contentStyle={[globalStyles.zeroHorizontalPadding, globalStyles.mb16]}
                title={translate(titleByActiveCardId[currentGiftId])}
            />
            <AppText
                font="f20w600"
                adaptiveSize
                style={globalStyles.mb16}
                rawText={translate('native.marketing.gift_checklist.ready_to_claim')}
            />
            <View style={globalStyles.mb24}>
                {getInstructionList(currentGiftId).map((text, index) => (
                    <AppText
                        style={globalStyles.mb4}
                        font="f17w400"
                        key={index}
                        adaptiveSize
                        rawText={text}
                    />
                ))}
            </View>

            <Button
                scheme="active"
                style={styles.claimPressButtonStyle}
                onPress={onClaimPress}
                text={translate(giftCopyByType[giftTypeByActiveCardId[currentGiftId]].openButton)}
            />
            <Button
                scheme="active"
                style={[styles.claimPressButtonStyle, styles.transparent]}
                onPress={onCloseModal}
                textStyle={{ color: brandColors.contentPrimary }}
                text={translate('native.actions.later')}
            />
        </View>
    )
}

export const CompleteModalContainer = ({ currentGiftId }: { currentGiftId: TIdCard }) => {
    const actions = useActions({
        setCurrentGiftId: giftChecklistStoreChunk.actions.setCurrentGiftId,
    })

    const sheetRef = useRef<NativeBottomSheetRef>(null)

    useEffect(() => {
        const timer = currentGiftId
            ? setTimeout(() => sheetRef.current?.present(), 1000)
            : undefined
        return () => clearTimeout(timer)
    }, [currentGiftId])

    const onCloseModalCallback = () => {
        actions.setCurrentGiftId(null)
    }

    return (
        <NativeBottomSheet ref={sheetRef} onDismiss={onCloseModalCallback}>
            <CompleteModalComponent
                currentGiftId={currentGiftId}
                onCloseModalCallback={onCloseModalCallback}
            />
        </NativeBottomSheet>
    )
}
