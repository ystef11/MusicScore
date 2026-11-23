import { FC, useEffect, useRef, useState } from 'react'
import { Image, ImageStyle, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import {
    State,
    TapGestureHandler,
    TapGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler'
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    interpolate,
    SharedValue,
    runOnJS,
} from 'react-native-reanimated'

import { icons, LinearGradient, BrandAppLoader } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_WHITE, TRANSPARENT } from '../../constants/styles'

import Timeline from './Timeline'

const REWIND_SECONDS = 15

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
    hasNext: boolean
    nextLesson: () => void
    setCurrentSecond: (second: number) => void
    toggleSettings: () => void
    isSettingsVisible: boolean
}

const ControlsFullScreen: FC<IProps> = ({
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
    hasNext,
    nextLesson,
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
                <BrandAppLoader color={COLOR_WHITE} />
            </View>
        )
    }

    return (
        <>
            {shouldRender && (
                <Animated.View style={[styles.wrapper, wrapperStyle]} pointerEvents="auto">
                    <View style={styles.container}>
                        <View style={styles.centralContainer}>
                            <TapGestureHandler
                                onHandlerStateChange={handleRewindBackDoubleTap}
                                numberOfTaps={2}
                            >
                                <View style={styles.rewindLeftButton} />
                            </TapGestureHandler>
                            <Animated.View style={rewindLeftStyle}>
                                <TouchableOpacity onPress={handleRewindBack}>
                                    <Image style={styles.iconRewind} source={icons.rewindBack} />
                                </TouchableOpacity>
                            </Animated.View>
                            <TouchableOpacity
                                style={styles.playPauseButton}
                                onPress={handleTogglePlay}
                            >
                                <Image
                                    style={styles.iconPlay}
                                    source={isPlaying ? icons.pause : icons.playCourses}
                                />
                            </TouchableOpacity>
                            <Animated.View style={rewindRightStyle}>
                                <TouchableOpacity onPress={handleRewindForward}>
                                    <Image style={styles.iconRewind} source={icons.rewindForward} />
                                </TouchableOpacity>
                            </Animated.View>
                            <TapGestureHandler
                                onHandlerStateChange={handleRewindForwardDoubleTap}
                                numberOfTaps={2}
                            >
                                <View style={styles.rewindRightButton} />
                            </TapGestureHandler>
                        </View>
                        <View style={styles.bottomContainer}>
                            {duration ? (
                                <View style={styles.timelineContainer}>
                                    <Timeline
                                        resetTimeout={resetTimeout}
                                        duration={duration}
                                        offset={32}
                                        isLandscape
                                        setCurrentSecond={setCurrentSecond}
                                        currentTime={currentTime}
                                        playableDuration={playableDuration}
                                    />
                                </View>
                            ) : null}
                            <View style={styles.rowContainer}>
                                <TouchableOpacity
                                    style={styles.leftButton}
                                    onPress={handleTogglePlay}
                                >
                                    <Image
                                        style={styles.iconPlaySmall}
                                        source={isPlaying ? icons.pause : icons.playCourses}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.leftButton}
                                    onPress={nextLesson}
                                    disabled={!hasNext}
                                >
                                    <Image
                                        style={hasNext ? styles.iconNext : styles.iconNextDisabled}
                                        source={icons.skipRight}
                                    />
                                </TouchableOpacity>
                                <Text style={styles.time}>
                                    {playTime} / {getDuration(duration)}
                                </Text>
                            </View>
                            <View style={styles.rowContainer}>
                                <TouchableOpacity
                                    style={styles.leftButton}
                                    onPress={toggleSettings}
                                >
                                    <Image style={styles.iconSettings} source={icons.settings} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={toggleFullScreen}>
                                    <Image
                                        style={styles.iconFullScreen}
                                        source={icons.fullscreenOut}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
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
                <TouchableOpacity style={styles.overlay} onPress={handleOverlayPress} />
            )}
        </>
    )
}

export default ControlsFullScreen

const styles = StyleSheet.create({
    loaderConrainer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.24)',
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    wrapper: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        backgroundColor: 'rgba(0, 0, 0, 0.24)',
    },
    container: {
        flex: 1,
        alignItems: 'flex-end',
        padding: 28,
        zIndex: 2,
    },
    iconRewind: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    } as ImageStyle,
    iconPlay: {
        width: 45,
        height: 45,
        resizeMode: 'contain',
    } as ImageStyle,
    iconPlaySmall: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
    } as ImageStyle,
    iconNext: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
        tintColor: COLOR_WHITE,
    } as ImageStyle,
    iconNextDisabled: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
        tintColor: '#C4C4C4',
    } as ImageStyle,
    iconSettings: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    } as ImageStyle,
    iconFullScreen: {
        width: 36,
        height: 36,
        resizeMode: 'contain',
    } as ImageStyle,
    overlay: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 3,
    },
    playPauseButton: {
        marginLeft: 150,
        marginRight: 140,
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
        position: 'absolute',
        bottom: 28,
        left: 28,
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
        top: -30,
        zIndex: 2,
    },
    time: {
        fontSize: 14,
        fontWeight: '400',
        color: COLOR_WHITE,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftButton: {
        marginRight: 18,
    },
    gradientLeftContainer: {
        width: '50%',
        height: '100%',
        justifyContent: 'center',
        paddingLeft: 80,
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
        paddingRight: 80,
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
