import { memo, useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, colors, layout, layoutHelpers, SvgAsset } from '@mu-native/ds'
import { translate } from '@mu-native/locale'
import { marketingStoreChunk } from '@mu-native/marketing'
import { useNavigation } from '@mu-native/navigation'
import { useValues } from '@ug/store'

import formatDate from '../../../../../App/Utils/Date'

const { getResponsiveSizeExtended } = layoutHelpers

const styles = StyleSheet.create({
    timerContainer: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        paddingTop: layoutHelpers.getResponsiveSizeExtended(layout.marginLg),
        paddingBottom: layoutHelpers.getResponsiveSizeExtended(60),
    },
    flashBigTitle: {
        width: getResponsiveSizeExtended(184),
        height: getResponsiveSizeExtended(20),
        alignSelf: 'center',
    },
    timerText: {
        fontWeight: '600',
        fontSize: getResponsiveSizeExtended(18),
        color: colors.white,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    textTimerContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        marginTop: getResponsiveSizeExtended(4),
    },
    timerTextWrapper: {
        width: getResponsiveSizeExtended(100),
        marginLeft: getResponsiveSizeExtended(4),
    },
    endTimeContainer: {
        flexDirection: 'row',
        alignSelf: 'center',
        width: '100%',
    },
})

export const TimerBadge = memo(() => {
    const { goBack } = useNavigation()
    const [timerSale, timerSaleStart, timerSaleStartOffscores, timerSaleDateOffScores] = useValues([
        marketingStoreChunk.props.getTimerSaleDate,
        marketingStoreChunk.props.getTimerSaleStart,
        marketingStoreChunk.props.getTimerSaleStartOffScores,
        marketingStoreChunk.props.getTimerSaleDateOffScores,
    ])

    const date24Format = formatDate(timerSaleDateOffScores || timerSale || 0, 'HH:mm:ss')

    useEffect(() => {
        if (!timerSaleStart && !timerSaleStartOffscores) goBack()
    }, [timerSaleStart, timerSaleStartOffscores])

    return (
        <View style={styles.timerContainer}>
            <View
                style={{
                    borderBottomWidth: 1,
                    borderTopWidth: 1,
                    width: '100%',
                    alignItems: 'center',
                    maxWidth: layoutHelpers.getResponsiveSizeExtended(330),
                    paddingVertical: 6,
                    borderColor: brandColors.contentPrimary,
                    marginBottom: layoutHelpers.getResponsiveSizeExtended(layout.marginXm),
                }}
            >
                <SvgAsset
                    type="ic_flash_icon_left"
                    style={{
                        left: layoutHelpers.getResponsiveSizeExtended(layout.marginXs),
                        position: 'absolute',
                    }}
                />
                <AppText
                    rawText={translate('native.marketing.flash_sale.title_24h')}
                    adaptiveSize
                    font="f56w400Accent"
                />
                <SvgAsset
                    type="ic_flash_icon_right"
                    style={{
                        right: layoutHelpers.getResponsiveSizeExtended(4),
                        position: 'absolute',
                        transform: [
                            {
                                rotateZ: '360deg',
                            },
                        ],
                    }}
                />
            </View>
            <View style={styles.textTimerContainer}>
                <AppText
                    adaptiveSize
                    rawText={translate('native.marketing.flash_sale.end_time')}
                    font="f17w400"
                />
                <View style={styles.timerTextWrapper}>
                    <AppText adaptiveSize rawText={date24Format} font="f17w400" />
                </View>
            </View>
        </View>
    )
})
