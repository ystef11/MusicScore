import { memo, useCallback, useEffect, useState } from 'react'
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import {
    brandColors,
    brandFonts,
    globalStyles,
    Icon,
    layoutHelpers,
    MuseButton,
    SvgAsset,
    useAppSafeArea,
} from '@mu-native/ds'
import { close } from '@mu-native/icons/close'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk, scoreDiscountSplashDiscount } from '@mu-native/marketing'
import { NavigationService, Screen, useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { RT_EVENTS } from '@mu-native/rt-analytics'
import { useValues } from '@ug/store'

import reportEvent from '../../../../../App/Utils/Analytics.ts'

const { getResponsiveSizeExtended } = layoutHelpers

// design leading is 108 for both sizes; a lineHeight below the font size clips the glyphs on top,
// so the line keeps the full font size and the tighter leading comes from negative margins
const designLeading = 108
const getAccentTextStyle = (fontSize: number) => ({
    fontSize,
    lineHeight: fontSize,
    marginVertical: (designLeading - fontSize) / 2,
})

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.splash,
        paddingHorizontal: getResponsiveSizeExtended(16),
    },
    closeButton: {
        alignSelf: 'flex-start',
        padding: getResponsiveSizeExtended(6),
        borderRadius: 100,
        backgroundColor: brandColors.exceptionMultilayerLight,
    },
    bannerArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    banner: {
        alignItems: 'center',
    },
    hidden: {
        opacity: 0,
    },
    gift: {
        alignSelf: 'flex-end',
    },
    texts: {
        marginTop: '-30%',
        transform: [{ rotate: '-4deg' }],
    },
    text: {
        fontFamily: brandFonts.accent,
        color: brandColors.backgroundHighlight,
        textTransform: 'uppercase',
        includeFontPadding: false,
        ...getAccentTextStyle(120),
    },
    save: {
        alignSelf: 'flex-end',
    },
    discountRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    discount: getAccentTextStyle(180),
    today: {
        alignSelf: 'flex-start',
    },
    footer: {
        paddingHorizontal: getResponsiveSizeExtended(4),
        paddingTop: getResponsiveSizeExtended(16),
    },
})

type TSize = { width: number; height: number }

const getSize = ({ nativeEvent }: LayoutChangeEvent): TSize => ({
    width: nativeEvent.layout.width,
    height: nativeEvent.layout.height,
})

export const ScoreDiscountSplashScreen = memo(() => {
    const { goBack } = useAppNavigation()
    const insets = useAppSafeArea({ top: 20, bottom: 20 })
    const [source] = useValues([marketingStoreChunk.props.getSource])
    const { funnelStartAction } = useAppRoute<{ funnelStartAction?: string }>()
    const funnelStartActionRt = funnelStartAction ? { funnel_start_action: funnelStartAction } : {}

    useEffect(() => {
        reportEvent(RT_EVENTS.SCORE_DISCOUNT_SPLASH_VIEW, funnelStartActionRt)
    }, [])

    const onClose = useCallback(() => {
        reportEvent(RT_EVENTS.SCORE_DISCOUNT_SPLASH_CLOSE, funnelStartActionRt)
        goBack()
    }, [])

    const [areaSize, setAreaSize] = useState<TSize | null>(null)
    const [bannerSize, setBannerSize] = useState<TSize | null>(null)

    const bannerScale =
        areaSize && bannerSize
            ? Math.min(areaSize.width / bannerSize.width, areaSize.height / bannerSize.height)
            : 1

    const onAreaLayout = useCallback((event: LayoutChangeEvent) => setAreaSize(getSize(event)), [])
    const onBannerLayout = useCallback(
        (event: LayoutChangeEvent) => setBannerSize(getSize(event)),
        [],
    )

    const onContinue = useCallback(() => {
        reportEvent(RT_EVENTS.SCORE_DISCOUNT_SPLASH_CONTINUE_CLICK, funnelStartActionRt)
        NavigationService.replace(Screen.screenLongLanding, {
            isScoreDiscountPlans: true,
            activePlanIndex: 1,
            funnelStartAction,
        })
    }, [])

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={12}>
                <Icon source={close} size={20} tint={brandColors.backgroundHighlight} />
            </TouchableOpacity>
            <View style={styles.bannerArea} onLayout={onAreaLayout}>
                <View
                    style={[
                        styles.banner,
                        !bannerSize && styles.hidden,
                        { transform: [{ scale: bannerScale }] },
                    ]}
                    onLayout={onBannerLayout}
                >
                    <SvgAsset type="score_discount_gift" style={styles.gift} />
                    <View style={styles.texts}>
                        <Text style={[styles.text, styles.save]}>
                            {translate('native.screen_tour.save')}
                        </Text>
                        <View style={styles.discountRow}>
                            <SvgAsset
                                type="ic_genre_jazz"
                                width={70}
                                height={70}
                                color={brandColors.additionalDefault}
                            />
                            <Text style={[styles.text, styles.discount]}>
                                {scoreDiscountSplashDiscount}
                            </Text>
                        </View>
                        <Text style={[styles.text, styles.today]}>
                            {translate('native.marketing.score_discount.today')}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={[styles.footer, globalStyles.fullWidth]}>
                <MuseButton
                    type="primary"
                    title={translate('native.marketing.continue')}
                    onPress={onContinue}
                />
            </View>
        </View>
    )
})
