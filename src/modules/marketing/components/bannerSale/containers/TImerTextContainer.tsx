import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { platform } from '@mu-native/common'
import { AppText, layoutHelpers } from '@mu-native/ds'
import { useValues } from '@ug/store'

import formatDate from '../../../../../App/Utils/Date'
import { marketingStoreChunk } from '../../../store/marketingStoreChunk'

const styles = StyleSheet.create({
    timerTextStyle: {
        marginLeft: layoutHelpers.getResponsiveSizeExtended(4),
        minWidth: layoutHelpers.getResponsiveSizeExtended(platform.isTablet ? 94 : 120),
    },
})

export const TimerTextContainer = memo(() => {
    const [timerSale, timerSaleOffScores] = useValues([
        marketingStoreChunk.props.getTimerSaleDate,
        marketingStoreChunk.props.getTimerSaleDateOffScores,
    ])
    const date24Format = formatDate(timerSaleOffScores || timerSale || 0, 'HH:mm:ss')

    return (
        <AppText
            rawText={date24Format}
            brandColor="backgroundDefault"
            font="f44w400Accent"
            style={styles.timerTextStyle}
        />
    )
})
