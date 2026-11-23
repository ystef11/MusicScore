import React, { useEffect } from 'react'
import { Image, ScrollView, StyleSheet, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

import { tourTestIds } from '@mu/mu-mobile-test-id'
import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    MuseButton,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { addDays } from 'date-fns'

import formatDate from '../../../../../../../../App/Utils/Date'

const { getResponsiveSizeExtended } = layoutHelpers
const styles = StyleSheet.create({
    trialViewContainer: {
        width: '100%',
        flexDirection: 'row',
        marginBottom: getResponsiveSizeExtended(40),
    },
    howTrialWorksContainer: {
        flex: 1,
        zIndex: 200,
        position: 'absolute',
        alignSelf: 'center',
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.tourBgTrialContainer,
    },
    howTrialWorksWrapper: {
        width: '100%',
        maxWidth: platform.isTablet
            ? layout.maxWidthTabletContainer
            : layout.fullScreenWidth - 2 * layout.marginMd,
        backgroundColor: colors.white,
        paddingHorizontal: getResponsiveSizeExtended(12),
        paddingVertical: getResponsiveSizeExtended(24),
    },
    trialView: {
        width: getResponsiveSizeExtended(20),
        height: '100%',
    },
    trialViewTextContainer: {
        flex: platform.isTablet || platform.isAndroid ? 1 : 0.88,
        justifyContent: 'space-between',
        marginLeft: getResponsiveSizeExtended(12),
    },
    trialTextWrapper: {
        width: '100%',
        paddingBottom: getResponsiveSizeExtended(5),
    },
    titleTextTrial: {
        fontSize: getResponsiveSizeExtended(20),
        fontWeight: '600',
        lineHeight: getResponsiveSizeExtended(24),
        marginBottom: getResponsiveSizeExtended(3),
    },
    paddingTopTitle: { paddingTop: getResponsiveSizeExtended(20) },
    iconLockView: {
        width: getResponsiveSizeExtended(16),
        height: getResponsiveSizeExtended(16),
    },
    iconTrialView: {
        width: getResponsiveSizeExtended(16),
        height: getResponsiveSizeExtended(16),
        marginBottom: 2,
    },
    bluePart: {
        width: '102%',
        height: '82%',
        position: 'absolute',
        top: 0,
        justifyContent: 'space-between',
        alignItems: 'center',
        overflow: 'hidden',
        zIndex: 2,
        paddingVertical: 4,
        backgroundColor: brandColors.accentPrimary,
    },
    greenPart: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        tintColor: brandColors.accentPrimary,
    },
})

const dateTrialEnd = formatDate(addDays(new Date(), 7), 'MMMM Do')
const titlesArray = [
    {
        title: translate('native.blinkListToday'),
        subTitle: translate('native.screen_tour.instant_sub_title'),
    },
    {
        title: translate('native.screen_tour.trial_modal_period_title', { dayNumber: '5' }),
        subTitle: translate(platform.isIos ? 'native.enjoyTrial' : 'native.blinkListTrialEnd'),
    },
    {
        title: translate('native.screen_tour.trial_modal_period_title', { dayNumber: '7' }),
        subTitle: translate('native.screen_tour.trial_modal_charged_title', { dateTrialEnd }),
    },
]

type TTrialModalComponentProps = {
    setIsShowTrialsModal: (isShowModal: boolean) => void
    isShowTrialsModal: boolean
}

const TrialModalComponent = ({
    setIsShowTrialsModal,
    isShowTrialsModal,
}: TTrialModalComponentProps) => {
    const opacityTrialView = useSharedValue(0)

    const opacityViewStyle = useAnimatedStyle(() => ({
        opacity: opacityTrialView.value,
    }))

    const hideModal = () => {
        setIsShowTrialsModal(false)
    }

    const onHideModal = () => {
        opacityTrialView.value = withTiming(0, { duration: 500 }, (isFinished?: boolean) => {
            if (isFinished) {
                scheduleOnRN(hideModal)
            }
        })
    }

    useEffect(() => {
        opacityTrialView.value = withTiming(1, { duration: 600 })
    }, [])

    if (!isShowTrialsModal) return null

    return (
        <Animated.View style={[styles.howTrialWorksContainer, opacityViewStyle]}>
            <View style={styles.howTrialWorksWrapper}>
                <ScrollView>
                    <AppText
                        brandColor="contentPrimary"
                        font="f24w600"
                        rawText={translate('native.blinkListhowYourTrialWork')}
                        adaptiveSize
                        style={globalStyles.mb32}
                    />
                    <View style={styles.trialViewContainer}>
                        <View style={styles.trialView}>
                            <View style={styles.bluePart}>
                                <Image
                                    source={icons.tourLockFile}
                                    resizeMode="contain"
                                    style={styles.iconLockView}
                                />
                                <Image
                                    source={
                                        platform.isIos ? icons.tourLikeModal : icons.tourBellModal
                                    }
                                    resizeMode="stretch"
                                    style={styles.iconTrialView}
                                />
                                <Image
                                    source={icons.tourStar}
                                    resizeMode="contain"
                                    style={styles.iconTrialView}
                                />
                            </View>
                            <Image
                                resizeMode="stretch"
                                style={styles.greenPart}
                                source={icons.tourGreenGradient}
                            />
                        </View>
                        <View style={styles.trialViewTextContainer}>
                            {titlesArray.map(({ title, subTitle }, index) => (
                                <View key={index} style={styles.trialTextWrapper}>
                                    <AppText
                                        font="f20w600"
                                        style={[
                                            styles.titleTextTrial,
                                            index >= 1 && styles.paddingTopTitle,
                                        ]}
                                        rawText={title}
                                        brandColor="contentPrimary"
                                    />
                                    <AppText
                                        adaptiveSize
                                        brandColor="contentSecondary"
                                        font="f15w400"
                                        rawText={subTitle}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                </ScrollView>
                <MuseButton
                    testID={tourTestIds.buttons.trialModalGotIt}
                    onPress={onHideModal}
                    title={translate('native.gotIt')}
                />
            </View>
        </Animated.View>
    )
}

export default React.memo(TrialModalComponent)
