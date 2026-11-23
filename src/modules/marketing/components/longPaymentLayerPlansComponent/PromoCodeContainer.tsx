import { memo } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import Animated, { FadeInLeft } from 'react-native-reanimated'

import { authStoreChunk } from '@mu-native/auth'
import {
    AppText,
    brandColors,
    globalStyles,
    Icon,
    layout,
    layoutHelpers,
    SvgAsset,
} from '@mu-native/ds'
import { checkmark } from '@mu-native/icons/checkmark'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useValues } from '@ug/store'

import formatDate from '../../../../App/Utils/Date'

const styles = StyleSheet.create({
    promoCodeContainer: {
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(20),
        marginBottom: layoutHelpers.getResponsiveSizeExtended(24),
        maxWidth: layout.maxWidthTabletContainer,
        alignSelf: 'center',
        width: '100%',
    },
    line: {
        width: '100%',
        flex: 1,
        height: layoutHelpers.getResponsiveSizeExtended(1),
        backgroundColor: brandColors.colorCyan200,
        position: 'absolute',
        alignSelf: 'center',
        zIndex: 1,
        top: layoutHelpers.getResponsiveSizeExtended(60),
    },
    circleBase: {
        width: layoutHelpers.getResponsiveSizeExtended(24),
        height: layoutHelpers.getResponsiveSizeExtended(24),
        borderRadius: 50,
        position: 'absolute',
        backgroundColor: brandColors.backgroundDefault,
    },
    circleLeft: {
        left: layoutHelpers.getResponsiveSizeExtended(6),
        top: layoutHelpers.getResponsiveSizeExtended(48),
        zIndex: 2,
    },
    circleRight: {
        right: layoutHelpers.getResponsiveSizeExtended(6),
        top: layoutHelpers.getResponsiveSizeExtended(48),
        zIndex: 2,
    },
    promoContainer: {
        backgroundColor: brandColors.colorCyan100,
        width: '100%',
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(15),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(16),
    },
    promoHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    contentRow: {
        flexDirection: 'row',
        gap: layoutHelpers.getResponsiveSizeExtended(16),
        paddingTop: layoutHelpers.getResponsiveSizeExtended(30),
    },
    promoBox: {
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderColor: brandColors.colorCyan200,
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(12),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(16),
        backgroundColor: brandColors.backgroundDefault,
        flex: 4,
    },
    timerBox: {
        width: '100%',
        flex: 3,
        backgroundColor: brandColors.colorCyan200,
        padding: layoutHelpers.getResponsiveSizeExtended(8),
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    timeSeparator: {
        marginHorizontal: layoutHelpers.getResponsiveSizeExtended(4),
    },
    labelsRow: {
        flexDirection: 'row',
        marginTop: layoutHelpers.getResponsiveSizeExtended(4),
        alignItems: 'baseline',
    },
    timeDigitText: {
        fontVariant: ['tabular-nums'],
        textAlign: 'center',
    },
})

const CircleWhiteView = ({ style }: { style?: ViewStyle }) => (
    <View style={[styles.circleBase, style]} />
)

export const PromoCodeContainer = memo(() => {
    const [{ email, name }, timerTour] = useValues([
        authStoreChunk.props.getUser,
        marketingStoreChunk.props.getTimerTour,
    ])
    const userData = email || name || 'promocode'
    const currentDate = formatDate(new Date(), 'MMMDD').toLowerCase()
    const promoCode =
        userData?.length > 8
            ? `${userData.slice(0, 8)}...${currentDate}`
            : `${userData}${currentDate}`

    const minutes = timerTour ? formatDate(timerTour, 'mm') : '00'
    const seconds = timerTour ? formatDate(timerTour, 'ss') : '00'

    return (
        <Animated.View entering={FadeInLeft.duration(600)} style={styles.promoCodeContainer}>
            <View style={styles.line} />
            <CircleWhiteView style={styles.circleLeft} />
            <CircleWhiteView style={styles.circleRight} />
            <View style={styles.promoContainer}>
                <View style={styles.promoHeaderRow}>
                    <SvgAsset type="promo_label" tint="red" />
                    <AppText
                        style={globalStyles.ml8}
                        rawText={translate('native.marketing.promo_code_applied')}
                        font="f17w600"
                        adaptiveSize
                    />
                </View>
                <View style={styles.contentRow}>
                    <View style={styles.promoBox}>
                        <Icon source={checkmark} size={24} tint={brandColors.statusSuccess} />
                        <AppText
                            rawText={promoCode}
                            font="f15w400"
                            numberOfLines={2}
                            adaptiveSize
                            style={globalStyles.flex1}
                        />
                    </View>
                    <View style={styles.timerBox}>
                        {!timerTour ? (
                            <AppText
                                rawText={translate('native.marketing.last_chance')}
                                font="f17w600"
                            />
                        ) : (
                            <View style={styles.timerContent}>
                                <View style={styles.timeRow}>
                                    <AppText
                                        style={styles.timeDigitText}
                                        rawText={minutes}
                                        font="f20w600"
                                        adaptiveSize
                                        brandColor="colorCyan750"
                                    />
                                    <AppText
                                        style={styles.timeSeparator}
                                        rawText=":"
                                        font="f20w600"
                                        adaptiveSize
                                        brandColor="colorCyan750"
                                    />
                                    <AppText
                                        style={styles.timeDigitText}
                                        rawText={seconds}
                                        font="f20w600"
                                        adaptiveSize
                                        brandColor="colorCyan750"
                                    />
                                </View>
                                <View style={styles.labelsRow}>
                                    <AppText
                                        rawText={translate('native.courses.minutes')}
                                        font="f11w400"
                                        adaptiveSize
                                        brandColor="colorCyan750"
                                    />
                                    <AppText
                                        rawText={` ${translate('native.courses.seconds')}`}
                                        font="f11w400"
                                        adaptiveSize
                                        brandColor="colorCyan750"
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Animated.View>
    )
})
