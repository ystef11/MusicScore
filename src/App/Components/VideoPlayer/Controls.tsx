import { FC, useEffect, useRef, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import {
    State,
    TapGestureHandler,
    TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler'
import { LaunchArguments } from 'react-native-launch-arguments'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    SharedValue,
    runOnJS,
} from 'react-native-reanimated'

import { coursesTestIds } from '@mu/mu-mobile-test-id'
import {
    AppText,
    brandColors,
    CommonTouchable,
    Icon,
    LinearGradient,
    BrandAppLoader,
} from '@mu-native/ds'
import { expand } from '@mu-native/icons/expand'
import { pause } from '@mu-native/icons/pause'
import { play } from '@mu-native/icons/play'
import { redo10 } from '@mu-native/icons/redo10'
import { settings } from '@mu-native/icons/settings'
import { undo10 } from '@mu-native/icons/undo10'
import { translate } from '@mu-native/locale'

import { COLOR_WHITE, TRANSPARENT } from '../../constants/styles'

import Timeline from './Timeline'

const REWIND_SECONDS = 15

/**
 * E2E only: keeps the controls mounted instead of hiding them a few seconds into
 * playback, so tests asserting on them don't race the timer.
 */
const isAutoHideDisabled = LaunchArguments.value<{ disableVideoControlsAutoHide: boolean }>()
    ?.disableVideoControlsAutoHide

interface IProps {
    isLoading: boolean
    isPlaying: boolean
    togglePlay: () => void
    toggleFullScreen: () => void
    currentTime: number
    playableDuration: number
    playTime: string
    duration: number
    rewindBack: (rewind: number) => void
    rewindForward: (rewind: number) => void
    setCurrentSecond: (second: number) => void
    toggleSettings: () => void
    isSettingsVisible: boolean
}

const Controls: FC<IProps> = ({
    isLoading,
    isPlaying,
    togglePlay,
    toggleFullScreen,
    currentTime,
    playableDuration,
    playTime,
    duration,
    rewindBack,
    rewindForward,
    setCurrentSecond,
    toggleSettings,
    isSettingsVisible,
}) => {
    const [showOverlay, setShowOverlay] = useState(false)
    const [shouldRender, setShouldRender] = useState(true)
    const overlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const animatedControls = useSharedValue(1)
    const animatedGradientLeft = useSharedValue(0)
    const animatedGradientRight = useSharedValue(0)

    const wrapperStyle = useAnimatedStyle(() => ({
        opacity: animatedControls.value,
    }))

    const bottomGradientStyle = useAnimatedStyle(() => ({
        opacity: animatedControls.value,
    }))

    const gradientLeftStyle = useAnimatedStyle(() => ({
        opacity: animatedGradientLeft.value,
    }))

    const rewindLeftStyle = useAnimatedStyle(() => ({
        opacity: interpolate(animatedGradientLeft.value, [0, 1], [1, 0]),
    }))

    const gradientRightStyle = useAnimatedStyle(() => ({
        opacity: animatedGradientRight.value,
    }))

    const rewindRightStyle = useAnimatedStyle(() => ({
        opacity: interpolate(animatedGradientRight.value, [0, 1], [1, 0]),
    }))

    const fade = (animatedValue: SharedValue<number>, toValue: number, callback?: () => void) => {
        animatedValue.value = withTiming(toValue, { duration: 500 }, finished => {
            'worklet'
            if (finished && callback) {
                runOnJS(callback)()
            }
        })
    }

    const setOverlayTimeout = () => {
        if (isAutoHideDisabled) {
            return
        }

        overlayTimeoutRef.current = setTimeout(() => {
            fade(animatedControls, 0, () => {
                setShowOverlay(true)
                setShouldRender(false)
            })
        }, 4000)
    }

    const resetTimeout = () => {
        if (isPlaying) {
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current)
            }
            setOverlayTimeout()
        }
    }

    const getDuration = (dur: number) => {
        const minutes = Math.floor(dur / 60)
        const seconds = Math.floor(dur % 60)

        return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
    }

    const handleRewindBackDoubleTap = ({ nativeEvent }: TapGestureHandlerStateChangeEvent) => {
        if (nativeEvent.state === State.ACTIVE) {
            resetTimeout()
            rewindBack(REWIND_SECONDS)
            fade(animatedGradientLeft, 1, () => {
                setTimeout(() => fade(animatedGradientLeft, 0), 500)
            })
        }
    }

    const handleRewindForwardDoubleTap = ({ nativeEvent }: TapGestureHandlerStateChangeEvent) => {
        if (nativeEvent.state === State.ACTIVE) {
            resetTimeout()
            rewindForward(REWIND_SECONDS)
            fade(animatedGradientRight, 1, () => {
                setTimeout(() => fade(animatedGradientRight, 0), 500)
            })
        }
    }

    const handleRewindBack = () => {
        resetTimeout()
        rewindBack(10)
    }

    const handleRewindForward = () => {
        resetTimeout()
        rewindForward(10)
    }

    const handleTogglePlay = () => {
        if (overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current)
        }

        // If currently playing, we're about to pause - keep controls visible
        if (isPlaying) {
            togglePlay()
            // Don't set timeout, keep controls visible when paused
        } else {
            // If currently paused, we're about to play - hide controls after delay
            togglePlay()
            setOverlayTimeout()
        }
    }

    const handleOverlayPress = () => {
        setShowOverlay(false)
        setShouldRender(true)
        // Small delay to ensure view is mounted before animating
        requestAnimationFrame(() => {
            fade(animatedControls, 1, setOverlayTimeout)
        })
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isPlaying) {
                setOverlayTimeout()
            }
        }, 1000)

        return () => {
            clearTimeout(timer)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (isSettingsVisible) {
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current)
            }
        } else if (isPlaying) {
            setOverlayTimeout()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSettingsVisible, isPlaying])

    useEffect(() => {
        if (!isPlaying && overlayTimeoutRef.current) {
            clearTimeout(overlayTimeoutRef.current)
        }
    }, [isPlaying])

    useEffect(() => {
        return () => {
            if (overlayTimeoutRef.current) {
                clearTimeout(overlayTimeoutRef.current)
            }
        }
    }, [])

    if (isLoading) {
        return (
            <View style={styles.loaderConrainer}>
                <BrandAppLoader />
            </View>
        )
    }

    return (
        <>
            {shouldRender && (
                <Animated.View
                    testID={coursesTestIds.courseDetails.videoControls}
                    style={[styles.wrapper, wrapperStyle]}
                    pointerEvents="auto"
                >
                    <View style={styles.container}>
                        <CommonTouchable onPress={toggleSettings} style={styles.iconSettings}>
                            <Icon
                                source={settings}
                                tint={brandColors.backgroundDefault}
                                size={24}
                            />
                        </CommonTouchable>
                        <View style={styles.centralContainer}>
                            <TapGestureHandler
                                onHandlerStateChange={handleRewindBackDoubleTap}
                                numberOfTaps={2}
                            >
                                <View style={styles.rewindLeftButton} />
                            </TapGestureHandler>
                            <Animated.View style={rewindLeftStyle}>
                                <CommonTouchable
                                    onPress={handleRewindBack}
                                    style={styles.iconRewind}
                                >
                                    <Icon source={undo10} tint={brandColors.backgroundDefault} />
                                </CommonTouchable>
                            </Animated.View>
                            <CommonTouchable
                                testID={coursesTestIds.courseDetails.videoPlayPauseButton}
                                style={styles.playPauseButton}
                                onPress={handleTogglePlay}
                            >
                                <Icon
                                    testID={
                                        isPlaying
                                            ? coursesTestIds.courseDetails.videoPlayingState
                                            : coursesTestIds.courseDetails.videoPausedState
                                    }
                                    source={isPlaying ? pause : play}
                                    tint={brandColors.backgroundDefault}
                                />
                            </CommonTouchable>
                            <Animated.View style={rewindRightStyle}>
                                <CommonTouchable
                                    onPress={handleRewindForward}
                                    style={styles.iconRewind}
                                >
                                    <Icon source={redo10} tint={brandColors.backgroundDefault} />
                                </CommonTouchable>
                            </Animated.View>
                            <TapGestureHandler
                                onHandlerStateChange={handleRewindForwardDoubleTap}
                                numberOfTaps={2}
                            >
                                <View style={styles.rewindRightButton} />
                            </TapGestureHandler>
                        </View>
                        <View style={styles.bottomContainer}>
                            <View style={styles.duration}>
                                <AppText
                                    font="f15w400"
                                    brandColor="exceptionConstantWhite"
                                    rawText={`${playTime} `}
                                />
                                <AppText
                                    font="f15w400"
                                    brandColor="contentTertiary"
                                    rawText={`/ ${getDuration(duration)}`}
                                />
                            </View>
                            <CommonTouchable onPress={toggleFullScreen} style={styles.iconSettings}>
                                <Icon source={expand} tint={brandColors.backgroundDefault} />
                            </CommonTouchable>
                        </View>
                    </View>
                    {duration ? (
                        <View style={styles.timelineContainer}>
                            <Timeline
                                duration={duration}
                                setCurrentSecond={setCurrentSecond}
                                currentTime={currentTime}
                                playableDuration={playableDuration}
                                resetTimeout={resetTimeout}
                            />
                        </View>
                    ) : null}
                    <Animated.View style={[styles.bottomGradientContainer, bottomGradientStyle]}>
                        <LinearGradient
                            style={styles.bottomGradient}
                            colors={['rgba(0, 0, 0, 0.6)', TRANSPARENT]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 0, y: 0 }}
                        />
                    </Animated.View>
                    <Animated.View style={[styles.gradientLeftContainer, gradientLeftStyle]}>
                        <LinearGradient
                            style={styles.gradientLeft}
                            colors={['rgba(255, 255, 255, 0.6)', TRANSPARENT]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.rewindText}>
                            {translate('native.courses.video.rewind_back_seconds', {
                                count: REWIND_SECONDS,
                            })}
                        </Text>
                    </Animated.View>
                    <Animated.View style={[styles.gradientRightContainer, gradientRightStyle]}>
                        <LinearGradient
                            style={styles.gradientRight}
                            colors={[TRANSPARENT, 'rgba(255, 255, 255, 0.6)']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        />
                        <Text style={styles.rewindText}>
                            {translate('native.courses.video.rewind_forward_seconds', {
                                count: REWIND_SECONDS,
                            })}
                        </Text>
                    </Animated.View>
                </Animated.View>
            )}
            {showOverlay && (
                <CommonTouchable
                    testID={coursesTestIds.courseDetails.videoOverlay}
                    style={styles.overlay}
                    onPress={handleOverlayPress}
                />
            )}
        </>
    )
}

export default Controls

const styles = StyleSheet.create({
    loaderConrainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.24)',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    duration: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    wrapper: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.24)',
        position: 'absolute',
    },
    container: {
        flex: 1,
        alignItems: 'flex-end',
        padding: 16,
        zIndex: 2,
    },
    iconSettings: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconRewind: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 100,
    },

    overlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 3,
    },
    playPauseButton: {
        width: 52,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 100,
        marginHorizontal: 32,
    },
    rewindLeftButton: {
        width: '50%',
        height: '100%',
        position: 'absolute',
        left: 0,
        zIndex: -1,
    },
    rewindRightButton: {
        width: '50%',
        height: '100%',
        position: 'absolute',
        right: 0,
        zIndex: -1,
    },
    centralContainer: {
        flex: 1,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomGradientContainer: {
        width: '100%',
        height: 90,
        position: 'absolute',
        bottom: 0,
        zIndex: 1,
    },
    bottomGradient: {
        width: '100%',
        height: '100%',
    },
    timelineContainer: {
        width: '100%',
        position: 'absolute',
        bottom: -13,
        zIndex: 2,
    },
    gradientLeftContainer: {
        width: '50%',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 16,
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    gradientLeft: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
    },
    gradientRightContainer: {
        width: '50%',
        height: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 16,
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 1,
    },
    gradientRight: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: -1,
    },
    rewindText: {
        fontSize: 12,
        lineHeight: 24,
        fontWeight: '400',
        color: COLOR_WHITE,
    },
})
