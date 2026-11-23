import { useEffect } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import { platform } from '@mu-native/common'
import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    layout,
    layoutHelpers,
    SvgAsset,
    type SvgAssetType,
} from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, TourSteps } from '@mu-native/marketing'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useActions, useValues } from '@ug/store'

import reportEvent from '../../../../../../App/Utils/Analytics'
import { tourInstallScreenStoreChunk } from '../../store/tourInstallScreenStoreChunk'

import TourBottomComponent from './TourBottomComponent'

type TourBenefit = {
    icon: SvgAssetType
    title: string
    description: string
}

const getLearnFeatures = ({ coursesCount }: { coursesCount: number }): TourBenefit[] => [
    {
        icon: 'ic_print_violet',
        title: translate('native.screen_sft.carousel.courses_title'),
        description: translate('native.marketing.tour.feature_sub_title_learn_1', {
            count: coursesCount.toString(),
        }),
    },
    {
        icon: 'add_free_black',
        title: translate('native.marketing.tour.feature_learn_2'),
        description: translate('native.marketing.tour.feature_sub_title_learn_2'),
    },
    {
        icon: 'ic_official_score_feature',
        title: translate('native.marketing.tour.feature_learn_3'),
        description: translate('native.marketing.tour.feature_sub_title_learn_3'),
    },
]

const offScoresBenefits: TourBenefit[] = [
    {
        icon: 'ic_print_violet',
        title: translate('native.screen_tour.benefit_download_title'),
        description: translate('native.screen_tour.benefit_download'),
    },
    {
        icon: 'add_free_black',
        title: translate('native.screen_tour.benefit_ad_free_title'),
        description: translate('native.screen_tour.benefit_ad_free'),
    },
    {
        icon: 'ic_official_score_feature',
        title: translate('native.filter_screen.scores_title'),
        description: translate('native.screen_tour.benefit_offscores_title'),
    },
    {
        icon: 'ic_mixer_black',
        title: translate('native.screen_tour.benefit_playback'),
        description: translate('native.screen_tour.benefit_mixer'),
    },
]

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    container: {
        width: '100%',
        height: '86%',
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        backgroundColor: colors.white,
    },
    scroll: {
        flex: 1,
        width: '100%',
    },
    contentWrapper: {
        flexGrow: 1,
        width: '100%',
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(32),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(124),
    },
    title: {
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
    },
    card: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        borderWidth: 1,
        borderColor: brandColors.strokeDefault,
        borderRadius: layoutHelpers.getResponsiveSizeExtended(16),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    cardTextWrapper: {
        flex: 1,
        marginLeft: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
    },
})

export const TourBenefitsComponent = () => {
    const actions = useActions({
        setStep: tourInstallScreenStoreChunk.actions.setStep,
    })
    const [{ coursesCount }] = useValues([marketingStoreChunk.props.getContentFields])

    useEffect(() => {
        reportEvent(RT_EVENTS.TEMP_BENEFITS_SHOW)
    }, [])

    const onContinue = () => {
        reportEvent(RT_EVENTS.TEMP_BENEFITS_CLICK)
        actions.setStep(TourSteps.PAYMENT_SCREEN)
    }

    const cardBenefits = platform.isIos ? getLearnFeatures({ coursesCount }) : offScoresBenefits

    return (
        <View style={styles.wrapper}>
            <Animated.View
                entering={FadeIn.duration(600).delay(300)}
                exiting={FadeOut.duration(600)}
                style={styles.container}
            >
                <ScrollView style={styles.scroll} contentContainerStyle={styles.contentWrapper}>
                    <AppText
                        adaptiveSize
                        font="f44w400Accent"
                        textAlign="center"
                        brandColor="contentPrimary"
                        rawText={translate('native.marketing.pro_plus_benefits')}
                        style={styles.title}
                    />
                    {cardBenefits.map(item => (
                        <View key={item.title} style={styles.card}>
                            <SvgAsset type={item.icon} width={24} height={24} />
                            <View style={styles.cardTextWrapper}>
                                <AppText
                                    adaptiveSize
                                    font="f16w700"
                                    style={globalStyles.mb4}
                                    rawText={item.title}
                                />
                                <AppText adaptiveSize font="f15w400" rawText={item.description} />
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <TourBottomComponent testID="Tour benefits continue" onPress={onContinue} />
            </Animated.View>
        </View>
    )
}
