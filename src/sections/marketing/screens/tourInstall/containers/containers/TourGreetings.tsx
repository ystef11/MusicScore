import { memo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { getIsAuthorized } from '@mu-native/auth'
import {
    AppText,
    colors,
    globalStyles,
    icons,
    layout,
    layoutHelpers,
    OnboardingTitleComponent,
    useSafeAreaInsets,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, TourSteps } from '@mu-native/marketing'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../../../App/Utils/Analytics'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

const styles = StyleSheet.create({
    imageGreeting: {
        width: '100%',
        alignSelf: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
        marginTop: -layoutHelpers.getResponsiveSizeExtended(60),
        height: layoutHelpers.getResponsiveSizeExtended(260),
    },
    containerGreeting: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: layout.marginMd,
        width: '100%',
        alignSelf: 'center',
        maxWidth: layout.maxWidthTabletContainer,
    },
    closeTour: {
        position: 'absolute',
        right: layoutHelpers.getResponsiveSizeExtended(20),
    },
    skipTourText: {
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        fontWeight: '500',
    },
    rightsSubscription: {
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(24),
    },
})

type TTextForUserWithRights = {
    isPro: boolean
    isOffScores: boolean
    isCourses: boolean
    isLearnLite: boolean
}
const getMembershipWithLearnText = (subscriptionName: string) =>
    translate('native.marketing.tour.membership_get_most_with_learn', { subscriptionName })

const getMembershipWithProPlusText = (subscriptionName: string) =>
    translate('native.marketing.tour.membership_add_pro_plus', { subscriptionName })

const getTextForUserWithRights = ({
    isPro,
    isOffScores,
    isCourses,
    isLearnLite,
}: TTextForUserWithRights) => {
    if (isOffScores) {
        return getMembershipWithLearnText('PRO+')
    }

    if (isPro) {
        return isCourses ? getMembershipWithProPlusText('PRO') : getMembershipWithLearnText('PRO')
    }

    if (isCourses) {
        return getMembershipWithProPlusText('LEARN')
    }

    if (isLearnLite) {
        return getMembershipWithProPlusText('LEARN Lite')
    }

    return getMembershipWithLearnText('PRO+')
}

type TTextRightsComponentProps = {
    isPossibilityToCloseTheTour: boolean
    isPro: boolean
    isOffScores: boolean
    isCourses: boolean
    isLearnLite: boolean
}
const TextRightsComponent = ({
    isPossibilityToCloseTheTour,
    isPro,
    isOffScores,
    isCourses,
    isLearnLite,
}: TTextRightsComponentProps) => (
    <View>
        {!isPossibilityToCloseTheTour && (
            <AppText
                font="f17w400"
                textAlign="center"
                adaptiveSize
                brandColor="contentPrimary"
                rawText={translate('native.marketing.lets_get_to_know_each_other')}
            />
        )}
        {isPossibilityToCloseTheTour && (
            <AppText
                font="f16w400"
                textAlign="center"
                rawText={getTextForUserWithRights({
                    isPro,
                    isOffScores,
                    isCourses,
                    isLearnLite,
                })}
                style={styles.rightsSubscription}
            />
        )}
    </View>
)

export const TourGreetings = memo(() => {
    const [isAuth, isPro, isOffScores, isCourses, isLearnLiteId, isLearnLiteRights] = useValues([
        getIsAuthorized,
        marketingStoreChunk.props.getIsPro,
        marketingStoreChunk.props.getIsOffScores,
        marketingStoreChunk.props.getIsCourses,
        marketingStoreChunk.props.getIsLearnLiteSubscriptionActive,
        marketingStoreChunk.props.getIsLearningLite,
    ])
    const actions = useActions({
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })

    const onCloseTour = () => {
        reportEvent(MetricaEvents.TOUR_SKIP_CLICK)
        actions.setStep(TourSteps.PAYMENT_SCREEN)
    }

    const isLearnLite = isLearnLiteId || isLearnLiteRights
    const isPossibilityToCloseTheTour = isAuth && (isPro || isOffScores || isCourses || isLearnLite)
    const insets = useSafeAreaInsets()

    return (
        <Animated.View
            entering={FadeIn.duration(600).delay(500)}
            exiting={FadeOut.duration(500)}
            style={styles.containerGreeting}
        >
            {isPossibilityToCloseTheTour && (
                <View
                    style={[
                        styles.closeTour,
                        { top: insets.top + layoutHelpers.getResponsiveSizeExtended(20) },
                    ]}
                >
                    <Text onPress={onCloseTour} style={styles.skipTourText}>
                        {translate('native.score_action_sheet.cancel')}
                    </Text>
                </View>
            )}
            <Image source={icons.fancyNoteHeads} style={styles.imageGreeting} />
            <OnboardingTitleComponent
                title={translate('native.marketing.nice_to_meet_you')}
                titleStyle={globalStyles.textAlignCenter}
                contentStyle={[globalStyles.zeroHorizontalPadding, globalStyles.mb12]}
            />
            <TextRightsComponent
                isPro={isPro}
                isOffScores={isOffScores}
                isCourses={isCourses}
                isLearnLite={isLearnLite}
                isPossibilityToCloseTheTour={isPossibilityToCloseTheTour}
            />
        </Animated.View>
    )
})
