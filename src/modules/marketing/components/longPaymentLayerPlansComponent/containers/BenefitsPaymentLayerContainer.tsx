import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, View } from 'react-native'

import {
    AppText,
    brandColors,
    colors,
    globalStyles,
    Icon,
    IconSource,
    layout,
    layoutHelpers,
    replacerText,
    SvgAsset,
    SvgAssetType,
} from '@mu-native/ds'
import { sparkles } from '@mu-native/icons/sparkles'
import { translate } from '@mu-native/locale'
import { type TStockLandingPlanType } from '@mu-native/marketing'
import { useValues } from '@ug/store'

import { subscriptionsGroup } from '../../../constants/marketingConstants.ts'
import { marketingStoreChunk } from '../../../store/marketingStoreChunk.ts'

const styles = StyleSheet.create({
    itemFeatureContainer: {
        backgroundColor: brandColors.backgroundDefault,
        borderColor: brandColors.strokeDefault,
        borderWidth: 1,
        borderRadius: 1,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    titleFeature: {
        textAlign: 'center',
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(18),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXs),
        fontWeight: '600',
    },
    subTitleFeature: {
        fontSize: layoutHelpers.getResponsiveSizeExtended(14),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(20),
    },
    reviewAvatarStyle: {
        marginTop: -1,
        width: layoutHelpers.getResponsiveSizeExtended(24),
        height: layoutHelpers.getResponsiveSizeExtended(24),
    },
    itemReviewContainer: {
        marginLeft: layoutHelpers.getResponsiveSizeExtended(layout.marginSm),
    },
    itemFeatureContentContainer: {
        flex: 1,
        marginLeft: layoutHelpers.getResponsiveSizeExtended(12),
        alignItems: 'flex-start',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(8),
    },
    mainTitle: {
        textAlign: 'center',
        fontWeight: '500',
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(24),
        lineHeight: layoutHelpers.getResponsiveSizeExtended(32),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    autoGradeIcon: { tintColor: brandColors.accentPrimary },
    titleFeatureStyle: {
        maxWidth: '70%',
        alignSelf: 'center',
        marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    },
    benefitsContainer: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        width: '100%',
        alignItems: 'stretch',
        justifyContent: 'center',
    },
})

type TBenefitItem = {
    assetIcon?: SvgAssetType
    icon?: IconSource
    title: string
    text: string
    strokeIcon?: string
}

const getLearnFeatures = ({
    coursesCount,
    isLearnLite,
}: {
    coursesCount: number
    isLearnLite: boolean
}): TBenefitItem[] => [
    {
        assetIcon: 'ic_print_violet',
        title: isLearnLite
            ? translate('native.marketing.feature.editor_picks')
            : translate('native.screen_sft.carousel.courses_title'),
        text: isLearnLite
            ? translate('native.marketing.feature.editor_picks_enjoy')
            : translate('native.marketing.tour.feature_sub_title_learn_1', {
                  count: coursesCount.toString(),
              }),
    },
    {
        assetIcon: 'add_free_black',
        title: translate('native.marketing.tour.feature_learn_2'),
        text: translate('native.marketing.tour.feature_sub_title_learn_2'),
    },
    {
        assetIcon: 'ic_official_score_feature',
        title: translate('native.marketing.tour.feature_learn_3'),
        text: translate('native.marketing.tour.feature_sub_title_learn_3'),
    },
]

const geEbooksFeatures = (): TBenefitItem[] => [
    {
        title: translate('native.marketing.feature.quick_load'),
        text: translate('native.marketing.feature.quick_load_sub_title'),
        assetIcon: 'ic_quick_loading',
    },
    {
        title: translate('native.marketing.feature.seamless'),
        text: translate('native.marketing.feature.seamless_sub_title'),
        assetIcon: 'ic_book_outlined',
    },
    {
        title: translate('native.marketing.feature.quick_search'),
        text: translate('native.marketing.feature.quick_load_sub_title'),
        assetIcon: 'ic_search_violet',
    },
    {
        title: translate('native.marketing.feature.mobile_design'),
        text: translate('native.marketing.feature.mobile_design_sub_title'),
        assetIcon: 'ic_cross_platform',
    },
    {
        title: translate('native.marketing.feature.growing_library'),
        text: translate('native.marketing.feature.growing_library_sub_title'),
        assetIcon: 'ic_composition',
    },
]

const getBenefits = (
    currentSubscriptionsGroup: TStockLandingPlanType,
    coursesCount: number,
): TBenefitItem[] => {
    if (currentSubscriptionsGroup.includes('learning'))
        return getLearnFeatures({
            coursesCount,
            isLearnLite: currentSubscriptionsGroup === 'learningLite',
        })
    if (currentSubscriptionsGroup === 'ebook') return geEbooksFeatures()

    return [
        {
            assetIcon: 'ic_print_violet',
            title: translate('native.screen_tour.benefit_download_title'),
            text: translate('native.screen_tour.benefit_download'),
        },
        ...(currentSubscriptionsGroup === 'offScores' ||
        currentSubscriptionsGroup === 'offScoresDoubt'
            ? ([
                  {
                      icon: sparkles,
                      title: translate('native.autograde.title'),
                      text: translate('native.autograde.feature_subtitle'),
                      strokeIcon: brandColors.accentPrimary,
                  },
              ] satisfies TBenefitItem[])
            : []),
        ...(currentSubscriptionsGroup === 'offScores' ||
        currentSubscriptionsGroup === 'offScoresDoubt'
            ? ([
                  {
                      assetIcon: 'ic_official_score_feature',
                      title: translate('native.filter_screen.scores_title'),
                      text: translate('native.screen_tour.benefit_offscores_title'),
                  },
              ] satisfies TBenefitItem[])
            : []),
        {
            assetIcon: 'ic_mixer_black',
            title: translate('native.screen_tour.benefit_playback'),
            text: translate('native.screen_tour.benefit_mixer'),
            strokeIcon: brandColors.accentPrimary,
        },
        {
            assetIcon: 'add_free_black',
            title: translate('native.screen_tour.benefit_ad_free_title'),
            text: translate('native.screen_tour.benefit_ad_free'),
        },
    ]
}

export const getBenefitsForTour = ({
    currentSubscriptionsGroup,
    coursesCount,
}: {
    currentSubscriptionsGroup: TStockLandingPlanType
    coursesCount: number
}) => getBenefits(currentSubscriptionsGroup, coursesCount)

const subscriptionTitleByGroup = {
    ...subscriptionsGroup,
    ebook: 'Digital Books',
}

type TBenefitsPaymentLayerComponentProps = {
    currentSubscriptionsGroup: TStockLandingPlanType
    isLandscapeLayout: boolean
}

export const BenefitsPaymentLayerContainer = memo(
    ({
        currentSubscriptionsGroup,
        isLandscapeLayout = false,
    }: TBenefitsPaymentLayerComponentProps) => {
        const [{ coursesCount }] = useValues([marketingStoreChunk.props.getContentFields])
        const benefits = getBenefits(currentSubscriptionsGroup, coursesCount)
        const benefitCount = benefits.length
        const [itemMinHeight, setItemMinHeight] = useState(0)
        const measuredHeightsRef = useRef<Record<number, number>>({})

        useEffect(() => {
            measuredHeightsRef.current = {}
            setItemMinHeight(0)
        }, [benefitCount])

        const onBenefitItemLayout = useCallback(
            (index: number) => (event: LayoutChangeEvent) => {
                if (!isLandscapeLayout) return
                const { height } = event.nativeEvent.layout
                measuredHeightsRef.current[index] = height
                const heights = Array.from({ length: benefitCount }, (_, i) => {
                    return measuredHeightsRef.current[i] ?? 0
                })
                const nextMax = Math.max(...heights)
                setItemMinHeight(prev => (prev === nextMax ? prev : nextMax))
            },
            [benefitCount],
        )

        return (
            <View>
                <AppText
                    adaptiveSize
                    font="f24w600"
                    rawText={replacerText({
                        text: translate('native.screen_tour.unlock_benefits', {
                            subscriptionGroup: subscriptionTitleByGroup[currentSubscriptionsGroup],
                        }),
                        textColor: brandColors.contentPrimary,
                    })}
                    numberOfLines={3}
                    style={styles.titleFeatureStyle}
                    textAlign="center"
                />
                <View style={[styles.benefitsContainer, { gap: isLandscapeLayout ? 20 : 0 }]}>
                    {benefits.map(({ assetIcon, icon, text, strokeIcon, title }, index) => (
                        <View
                            key={index}
                            onLayout={onBenefitItemLayout(index)}
                            style={[
                                styles.itemFeatureContainer,
                                {
                                    width: isLandscapeLayout ? 330 : '100%',
                                    marginBottom: layoutHelpers.getResponsiveSizeExtended(
                                        layout.marginMd,
                                    ),
                                },
                                itemMinHeight > 0 && { minHeight: itemMinHeight },
                            ]}
                        >
                            {icon ? (
                                <Icon source={icon} tint={strokeIcon} />
                            ) : (
                                !!assetIcon && <SvgAsset type={assetIcon} tint={strokeIcon} />
                            )}
                            <View style={styles.itemFeatureContentContainer}>
                                <AppText
                                    font="f18w600"
                                    rawText={title}
                                    adaptiveSize
                                    brandColor="contentPrimary"
                                    style={globalStyles.mb8}
                                />
                                <AppText
                                    font="f14w400"
                                    rawText={text}
                                    adaptiveSize
                                    brandColor="contentPrimary"
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </View>
        )
    },
)
