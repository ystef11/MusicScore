import { memo, useCallback, useRef } from 'react'
import { StyleSheet, View } from 'react-native'

import { authStoreChunk, getIsAuthorized } from '@mu-native/auth'
import { AppText, brandColors, CommonTouchable, Icon, NativeBottomSheetRef } from '@mu-native/ds'
import { star } from '@mu-native/icons/star'
import { translate } from '@mu-native/locale'
import { useActions, useValues } from '@ug/store'

import { useEbookPaywall } from '../../hooks/useEbookPaywall.ts'
import { useDigitalEbookDetailsChunk } from '../../stores/DigitalEbookDetailsStore.ts'
import { DigitalEbookRateSheet } from '../details/DigitalEbookRateSheet.tsx'

export const DigitalEbookStarsRatingView = memo(() => {
    const sheetRef = useRef<NativeBottomSheetRef>(null)

    const chunk = useDigitalEbookDetailsChunk()
    const [rating, isRated, isAuthorized] = useValues([
        chunk.props.getRating,
        chunk.props.getIsRated,
        getIsAuthorized,
    ])
    const actions = useActions({
        presentAuth: authStoreChunk.actions.presentAuthModal,
    })

    const { openPrePaywallScreen, isFullAccess } = useEbookPaywall()

    const userRating = isRated ? (rating?.user_rating ?? 0) : 0

    const onTogglePress = useCallback(() => {
        if (isAuthorized && isFullAccess) {
            sheetRef.current?.present()
            return
        }
        if (isAuthorized && !isFullAccess) {
            openPrePaywallScreen()
            return
        }
        actions.presentAuth(undefined)
    }, [actions, isAuthorized, isFullAccess])

    return (
        <View style={styles.base}>
            <CommonTouchable style={styles.wrapper} onPress={onTogglePress}>
                {new Array(5).fill(null).map((_, index) => {
                    return (
                        <View key={index} style={styles.star}>
                            <Icon
                                source={star}
                                size={28}
                                tint={
                                    index < userRating
                                        ? brandColors.contentPrimary
                                        : brandColors.colorBackgroundDisabled
                                }
                            />
                        </View>
                    )
                })}
            </CommonTouchable>
            <AppText
                rawText={translate(
                    isRated ? 'native.review.thanks_for_rating' : 'native.review.tap_to_rate',
                )}
                font="f13w400"
                style={styles.mt4}
                textAlign="center"
                brandColor="contentTertiary"
            />

            <DigitalEbookRateSheet ref={sheetRef} />
        </View>
    )
})

const styles = StyleSheet.create({
    base: {
        alignSelf: 'center',
        marginTop: 32,
    },

    wrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 2,
    },

    star: {
        width: 28,
        height: 28,
    },

    mt4: {
        marginTop: 4,
    },
})
