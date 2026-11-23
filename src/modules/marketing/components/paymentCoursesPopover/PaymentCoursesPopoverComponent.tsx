import React, { useEffect, useRef, useState } from 'react'
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { colors, Icon, layout, layoutHelpers, MuseButton } from '@mu-native/ds'
import { close as closeIcon } from '@mu-native/icons/close'
import { translate } from '@mu-native/locale'
import { Screen, useNavigation } from '@mu-native/navigation'
import { useActions, useValues } from '@ug/store'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'
import { marketingConstants } from '../../constants/marketingConstants'
import marketingStoreChunk, { getSaleSubscriptionsLearn } from '../../store/marketingStoreChunk'

const poverBackground = 'rgba(0, 0, 0, .8)'

const { getResponsiveSizeExtended } = layoutHelpers
const styles = StyleSheet.create({
    contentContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20000,
        width: '100%',
        height: '100%',
        backgroundColor: poverBackground,
    },
    paymentPopover: {
        borderRadius: 6,
        alignSelf: 'center',
        justifyContent: 'center',
        paddingVertical: '4%',
        paddingHorizontal: '5%',
    },
    titlePopover: {
        fontSize: getResponsiveSizeExtended(17),
        fontWeight: '600',
        lineHeight: 24,
        color: colors.white,
        textAlign: 'center',
    },
    textPopover: {
        fontSize: getResponsiveSizeExtended(15),
        fontWeight: '400',
        lineHeight: 20,
        textAlign: 'center',
        marginTop: '1%',
        color: colors.white,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(12),
    },
    closeButton: {
        width: getResponsiveSizeExtended(22),
        height: getResponsiveSizeExtended(22),
        borderRadius: 12,
        position: 'absolute',
        right: 8,
        top: '10%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIcon: {
        width: 12,
        height: 12,
    },
})

type TPaymentPopoverProps = {
    courseTitle: string
    isVideoFinished: boolean
    isFullScreen?: boolean
    toggleFullScreen?: () => void
    activeLesson: number
}

const FIRST_LESSON = 0

const PaymentCoursesPopoverComponent = ({
    courseTitle,
    isVideoFinished,
    isFullScreen = false,
    toggleFullScreen,
    activeLesson,
}: TPaymentPopoverProps) => {
    const { navigate } = useNavigation<any>()
    const { setSource } = useActions(marketingStoreChunk.actions)
    const [subcsriptions] = useValues([getSaleSubscriptionsLearn])
    const [isShowPopover, setShowPopover] = useState(false)

    const opacityView = useRef(new Animated.Value(0)).current

    const displayWidth = layout.fullScreenWidth

    const onClosePopover = () => {
        Animated.timing(opacityView, {
            useNativeDriver: true,
            toValue: 0,
            duration: 400,
        }).start(() => {
            setShowPopover(false)
        })
    }

    useEffect(() => {
        if (isVideoFinished) {
            reportEvent(MetricaEvents.COURSE_SHOW_END_VIDEO_POP_UP)
            setTimeout(() => {
                setShowPopover(true)
                Animated.timing(opacityView, {
                    useNativeDriver: true,
                    toValue: 1,
                    duration: 400,
                }).start()
            }, 500)
        } else if (isShowPopover) {
            onClosePopover()
        }
    }, [isVideoFinished])

    const goLanding = () => {
        if (isFullScreen && toggleFullScreen) toggleFullScreen()
        setSource(marketingConstants.sources.coursesVideoPopup)

        setTimeout(
            () =>
                navigate(Screen.screenLongLanding, {
                    planName: 'learning',
                    courseName: courseTitle,
                }),
            toggleFullScreen ? 500 : 1,
        )
    }

    if (
        !isVideoFinished ||
        !isShowPopover ||
        activeLesson !== FIRST_LESSON ||
        !subcsriptions.length
    )
        return null

    return (
        <View style={styles.contentContainer}>
            <Animated.View
                style={[
                    styles.paymentPopover,
                    {
                        opacity: opacityView,
                        width: displayWidth * 0.85 * (isFullScreen ? 0.6 : 1),
                        height: displayWidth * 0.563 * (isFullScreen ? 0.5 : 0.85),
                    },
                ]}
            >
                <Text style={styles.titlePopover}>
                    {translate('native.payment_popover.preview')}
                </Text>
                <Text style={styles.textPopover}>
                    {translate('native.payment_popover.continue')}
                </Text>
                <MuseButton onPress={goLanding} title={translate('native.marketing.continue')} />
                <TouchableOpacity style={styles.closeButton} onPress={onClosePopover}>
                    <Icon source={closeIcon} tint={colors.gray500} style={styles.closeIcon} />
                </TouchableOpacity>
            </Animated.View>
        </View>
    )
}

export default React.memo(PaymentCoursesPopoverComponent)
