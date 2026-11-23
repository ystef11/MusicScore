import React, { PureComponent } from 'react'
import { View, ViewStyle, StyleSheet, LayoutChangeEvent, Animated } from 'react-native'
import {
    TapGestureHandler,
    TapGestureHandlerStateChangeEvent,
    PanGestureHandler,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
    State,
} from 'react-native-gesture-handler'

import { device } from '@mu-native/common'

import { isAndroid, isIOS } from '../../Utils/Platform'

interface IProps {
    duration: number
    offset?: number
    isLandscape?: boolean
    setCurrentSecond: (second: number) => void
    currentTime: number
    playableDuration: number
    resetTimeout: () => void
}

interface IState {
    contentWidth: number
}

export default class Timeline extends PureComponent<IProps, IState> {
    animatedDot = new Animated.Value(0)

    animatedLine = new Animated.Value(0)

    animatedBufferLine = new Animated.Value(0)

    isDragging = false

    constructor(props: IProps) {
        super(props)
        this.state = {
            contentWidth: 0,
        }
    }

    componentDidUpdate(prevProps: IProps, prevState: IState) {
        const { currentTime, playableDuration, duration } = this.props
        const { contentWidth } = this.state

        if (
            (!this.isDragging && prevProps.currentTime !== currentTime) ||
            contentWidth !== prevState.contentWidth
        ) {
            this.changeLineWidthSpring((contentWidth / 100) * ((currentTime / duration) * 100))
        }

        if (prevProps.playableDuration !== playableDuration) {
            this.changeBufferLineWidthSpring(
                (contentWidth / 100) * ((playableDuration / duration) * 100),
            )
        }
    }

    getMaxWidth = () => {
        const { offset = 0, isLandscape } = this.props

        return device.screenData[isLandscape && isAndroid ? 'height' : 'width'] - offset
    }

    dotScaleIn = (): void => {
        Animated.timing(this.animatedDot, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start()
    }

    dotScaleOut = (): void => {
        Animated.timing(this.animatedDot, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start()
    }

    changeLineWidthTiming = (toValue: number): void => {
        Animated.timing(this.animatedLine, {
            toValue,
            useNativeDriver: false,
            duration: 300,
        }).start()
    }

    changeLineWidthSpring = (toValue: number): void => {
        Animated.spring(this.animatedLine, { toValue, useNativeDriver: false }).start()
    }

    changeBufferLineWidthSpring = (toValue: number): void => {
        Animated.spring(this.animatedBufferLine, { toValue, useNativeDriver: false }).start()
    }

    handleLayout = ({ nativeEvent }: LayoutChangeEvent): void => {
        const { contentWidth } = this.state
        const { width } = nativeEvent.layout

        if (contentWidth !== width) {
            this.setState({ contentWidth: width })
        }
    }

    handleTapGestureStateChange = (event: TapGestureHandlerStateChangeEvent): void => {
        const { state, x } = event.nativeEvent
        this.props.resetTimeout()
        if (state === State.BEGAN) {
            this.props.setCurrentSecond(
                (this.props.duration / 100) * ((x / this.state.contentWidth) * 100),
            )

            setTimeout(() => {
                this.dotScaleIn()
                if (x <= this.getMaxWidth()) {
                    this.changeLineWidthTiming(x)
                }
            }, 100)
        }

        if (state === State.END) {
            setTimeout(this.dotScaleOut, 200)
        }
    }

    handlePanGestureEvent = (event: PanGestureHandlerGestureEvent): void => {
        const { x } = event.nativeEvent
        this.props.resetTimeout()

        if (x <= this.getMaxWidth()) {
            this.changeLineWidthSpring(x)
        }
    }

    handlePanGestureStateChange = (event: PanGestureHandlerStateChangeEvent): void => {
        const { state, x } = event.nativeEvent
        this.props.resetTimeout()

        if (state === State.BEGAN) {
            this.isDragging = true
        }

        if (state === State.END) {
            this.props.setCurrentSecond(
                (this.props.duration / 100) * ((x / this.state.contentWidth) * 100),
            )

            this.dotScaleOut()
            if (x <= this.getMaxWidth()) {
                this.changeLineWidthSpring(x)
            }

            setTimeout(() => {
                this.isDragging = false
            }, 500)
        }
    }

    render(): React.ReactElement {
        const { isLandscape } = this.props
        const { contentWidth } = this.state
        const lineStyle = StyleSheet.flatten([
            styles.line,
            {
                width: this.animatedLine.interpolate({
                    inputRange: [0, contentWidth],
                    outputRange: [0, contentWidth - 12],
                }),
            },
        ])
        const bufferLineStyle = StyleSheet.flatten([
            styles.bufferLine,
            {
                width: this.animatedBufferLine.interpolate({
                    inputRange: [0, contentWidth],
                    outputRange: [0, contentWidth],
                }),
            },
        ])
        const dotStyle = StyleSheet.flatten([
            styles.dot,
            {
                transform: [
                    {
                        scale: this.animatedDot.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.5],
                        }),
                    },
                ],
            },
        ])

        return (
            <View>
                {isIOS ? (
                    <PanGestureHandler activeOffsetX={[-0, 0]}>
                        <View style={styles.plug} />
                    </PanGestureHandler>
                ) : null}
                <TapGestureHandler onHandlerStateChange={this.handleTapGestureStateChange}>
                    <PanGestureHandler
                        onGestureEvent={this.handlePanGestureEvent}
                        onHandlerStateChange={this.handlePanGestureStateChange}
                        activeOffsetX={[-0, 0]}
                    >
                        <View style={styles.container} onLayout={this.handleLayout}>
                            <View
                                style={StyleSheet.flatten([
                                    styles.lineContainer,
                                    isLandscape ? styles.backgroundColor : {},
                                ])}
                            >
                                <Animated.View style={lineStyle} />
                                <Animated.View style={bufferLineStyle} />
                                <Animated.View style={dotStyle} />
                            </View>
                        </View>
                    </PanGestureHandler>
                </TapGestureHandler>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    plug: {
        width: 60,
        height: 70,
        position: 'absolute',
        top: -40,
        left: 0,
        zIndex: -1,
    } as ViewStyle,
    container: {
        width: '100%',
        height: 30,
        justifyContent: 'center',
    } as ViewStyle,
    lineContainer: {
        width: '100%',
        height: 4,
        flexDirection: 'row',
        alignItems: 'center',
    } as ViewStyle,
    // eslint-disable-next-line react-native/no-color-literals
    backgroundColor: {
        backgroundColor: 'rgba(243, 241, 244, 1)',
    } as ViewStyle,
    line: {
        width: '30%',
        height: '100%',
        backgroundColor: 'rgba(107, 93, 254, 1)',
        zIndex: 1,
    } as ViewStyle,
    bufferLine: {
        width: '66%',
        height: '100%',
        backgroundColor: 'rgba(243, 241, 244, 1)',
        position: 'absolute',
        left: 0,
    } as ViewStyle,
    dot: {
        borderRadius: 6,
        width: 12,
        height: 12,
        backgroundColor: 'rgba(107, 93, 254, 1)',
    } as ViewStyle,
})
