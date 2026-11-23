import { PureComponent } from 'react'
import { Modal, StyleSheet, View, ViewStyle } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import Video, {
    OnProgressData,
    OnSeekData,
    SelectedVideoTrackType,
    VideoRef,
} from 'react-native-video'

import { device } from '@mu-native/common'
import { PaymentCoursesPopover } from '@mu-native/marketing'
import { useAppNavigation } from '@mu-native/navigation'
import { Orientation } from '@mu-native/system'

import { AudioSession } from '../../Utils/AudioSession.ts'

import Controls from './Controls'
import ControlsFullScreen from './ControlsFullScreen'
import Settings from './Settings'

interface IProps {
    source: any
    duration: number
    hasPrevious: boolean
    hasNext: boolean
    lessonStartTime: number
    previousLesson: () => void
    nextLesson: () => void
    onPlay: (currentTime: number) => void
    onPause: (currentTime: number) => void
    onProgress: (duration: number) => void
    onNormalMode: () => void
    onFullScreenMode: () => void
    onReadyForDisplay: () => void
    onEnd: () => void
    onSeek: () => void
    courseTitle: string
    activeLesson: number
    isCoursesStatus: boolean
    navigation: ReturnType<typeof useAppNavigation>
    isFeedbackShown?: boolean
}

interface IState {
    isLoading: boolean
    isPlaying: boolean
    finished: boolean
    fullScreen: boolean
    lockFullScreen: boolean
    currentTime: number
    playableDuration: number
    playTime: string
    playingSpeed: number
    quality: number
    showSettings: boolean
    showSettingsFullScreen: boolean
}

export default class VideoPlayer extends PureComponent<IProps, IState> {
    player: VideoRef | undefined | null
    lastOrientation = ''

    constructor(props: IProps) {
        super(props)
        this.state = {
            isLoading: true,
            isPlaying: false,
            finished: false,
            fullScreen: false,
            lockFullScreen: false,
            currentTime: 0,
            playableDuration: 0,
            playTime: '00:00',
            playingSpeed: 1,
            quality: 720,
            showSettings: false,
            showSettingsFullScreen: false,
        }
    }

    componentDidMount() {
        const { navigation, onPlay, lessonStartTime } = this.props
        this.blur = navigation.addListener('blur', () => {
            this.setState({
                isPlaying: false,
            })
        })
        this.focus = navigation.addListener('focus', () => {
            this.setState({
                isPlaying: true,
            })
        })

        Orientation.unlockAllOrientations()
        Orientation.addOrientationListener(this.handleOrientationChange)
        Orientation.addDeviceOrientationListener(this.handleDeviceOrientationChange)

        onPlay(this.state.currentTime)

        setTimeout(() => {
            this.player?.seek(lessonStartTime)
            this.setState({ isPlaying: true })
        }, 500)
        AudioSession.setCategory('playAndRecord')
    }

    componentDidUpdate(prevProps: IProps) {
        if (prevProps.source.uri !== this.props.source.uri) {
            this.setState({ isPlaying: true, currentTime: 0, finished: false })
        }

        if (prevProps.duration !== this.props.duration) {
            this.setState({ playTime: '00:00' })
        }

        if (!prevProps.isFeedbackShown && this.props.isFeedbackShown) {
            this.setState({ isPlaying: false })
        }
    }

    componentWillUnmount() {
        Orientation.lockToPortrait()
        Orientation.removeOrientationListener(this.handleOrientationChange)
        Orientation.removeDeviceOrientationListener(this.handleDeviceOrientationChange)
        this.blur()
        this.focus()
    }

    // eslint-disable-next-line class-methods-use-this
    focus: () => void = () => ({})

    // eslint-disable-next-line class-methods-use-this
    blur: () => void = () => ({})

    setVideoRef = (ref: VideoRef) => {
        this.player = ref
    }

    setCurrentSecond = (second: number) => {
        this.player?.seek(second)
    }

    setFullScreen = (fullScreen: boolean) => {
        const { onNormalMode, onFullScreenMode } = this.props
        const { isPlaying } = this.state

        if (fullScreen) onFullScreenMode()
        else onNormalMode()
        this.setState({ fullScreen, isPlaying: false })

        setTimeout(() => {
            this.player?.seek(this.state.currentTime)
            if (isPlaying) this.setState({ isPlaying: true })
        }, 100)
    }

    handleOrientationChange = (orientation: string) => {
        if (orientation === 'UNKNOWN') {
            return
        }

        if (this.lastOrientation !== orientation) {
            this.lastOrientation = orientation

            this.setState({ showSettings: false, showSettingsFullScreen: false })
            if (orientation.includes('LANDSCAPE')) {
                this.setFullScreen(true)
            } else if (orientation.includes('PORTRAIT')) {
                this.setFullScreen(false)
            }
        }
    }

    handleDeviceOrientationChange = (orientation: string) => {
        if (!this.state.lockFullScreen && orientation.includes('PORTRAIT')) {
            Orientation.unlockAllOrientations()
        }
    }

    toggleFullScreen = () => {
        this.setState({
            showSettings: false,
            showSettingsFullScreen: false,
        })

        if (this.state.fullScreen) {
            this.setState({ lockFullScreen: false })
            Orientation.lockToPortrait()
            this.setFullScreen(false)
        } else {
            this.setState({ lockFullScreen: true })
            Orientation.lockToLandscape()
            this.setFullScreen(true)
        }
    }

    togglePlay = () => {
        const { onPlay, onPause } = this.props
        const { isPlaying, finished, currentTime } = this.state

        if (finished) {
            this.player?.seek(0)
            onPlay(0)
        } else {
            this.setState({ isPlaying: !isPlaying }, () => {
                if (this.state.isPlaying) {
                    onPlay(currentTime)
                } else {
                    onPause(currentTime)
                }
            })
        }
    }

    handleLoadStart = () => {
        this.setState({ isLoading: true })
    }

    handleReadyForDisplay = () => {
        this.setState({ isLoading: false })
        this.props.onReadyForDisplay()
    }

    handleSeek = ({ currentTime }: OnSeekData) => {
        const minutes = Math.floor(currentTime / 60)
        const seconds = Math.floor(currentTime % 60)
        const playTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

        this.props.onSeek()

        this.setState({ currentTime, playTime })

        if (this.state.finished) {
            this.setState({ isPlaying: true, finished: false })
        }
    }

    handleProgress = ({ currentTime, playableDuration }: OnProgressData) => {
        const minutes = Math.floor(currentTime / 60)
        const seconds = Math.floor(currentTime % 60)
        const playTime = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`

        this.setState({ currentTime, playableDuration, playTime })
        this.props.onProgress(currentTime)
    }

    handleEnd = () => {
        if (this.state.finished || this.state.currentTime === 0) {
            // For some reason onEnd is called multiple times when the lesson is finished
            return
        }
        this.props.onEnd()
        this.setState({ finished: true })
    }

    handleRewindBack = (rewind: number) => {
        this.player?.seek(this.state.currentTime - rewind)
    }

    handleRewindForward = (rewind: number) => {
        const { duration } = this.props
        const seek = this.state.currentTime + rewind

        this.player?.seek(seek > duration ? duration : seek)
    }

    handleChangePlayingSpeed = (playingSpeed: number) => {
        this.setState({ playingSpeed })
    }

    handleChangeQuality = (quality: number) => {
        this.setState({ quality })
    }

    toggleSettings = () => {
        this.setState({ showSettings: !this.state.showSettings })
    }

    toggleSettingsFullScreen = () => {
        this.setState({ showSettingsFullScreen: !this.state.showSettingsFullScreen })
    }

    renderSettings = () => {
        const { playingSpeed, quality } = this.state

        return (
            <Modal
                visible
                supportedOrientations={[
                    'portrait',
                    'landscape',
                    'landscape-left',
                    'landscape-right',
                ]}
                transparent
            >
                <Settings
                    playingSpeed={playingSpeed}
                    quality={quality}
                    onChangePlayingSpeed={this.handleChangePlayingSpeed}
                    onChangeQuality={this.handleChangeQuality}
                    close={this.toggleSettings}
                />
            </Modal>
        )
    }

    renderFullScreen = () => {
        const {
            source,
            hasNext,
            nextLesson,
            duration,
            courseTitle,
            activeLesson,
            isCoursesStatus,
        } = this.props
        const {
            isLoading,
            isPlaying,
            finished,
            playTime,
            currentTime,
            playableDuration,
            playingSpeed,
            quality,
            showSettingsFullScreen,
        } = this.state

        return (
            <Modal
                visible
                statusBarTranslucent
                supportedOrientations={[
                    'portrait',
                    'landscape',
                    'landscape-left',
                    'landscape-right',
                ]}
            >
                {showSettingsFullScreen ? (
                    <Settings
                        playingSpeed={playingSpeed}
                        quality={quality}
                        onChangePlayingSpeed={this.handleChangePlayingSpeed}
                        onChangeQuality={this.handleChangeQuality}
                        close={this.toggleSettingsFullScreen}
                        isLandscape
                    />
                ) : null}
                {!isCoursesStatus && (
                    <PaymentCoursesPopover
                        isVideoFinished={finished}
                        isFullScreen
                        courseTitle={courseTitle}
                        activeLesson={activeLesson}
                        toggleFullScreen={this.toggleFullScreen}
                    />
                )}
                <GestureHandlerRootView style={styles.fullScreenContainer}>
                    <Video
                        ref={this.setVideoRef}
                        style={styles.fullScreenVideo}
                        source={source}
                        paused={!isPlaying || finished}
                        resizeMode="contain"
                        onLoadStart={this.handleLoadStart}
                        onReadyForDisplay={this.handleReadyForDisplay}
                        onProgress={this.handleProgress}
                        onSeek={this.handleSeek}
                        onEnd={this.handleEnd}
                        rate={playingSpeed}
                        selectedVideoTrack={{
                            type: SelectedVideoTrackType.RESOLUTION,
                            value: quality,
                        }}
                        bufferConfig={{
                            minBufferMs: 4000,
                            maxBufferMs: 24000,
                            bufferForPlaybackMs: 2500,
                            bufferForPlaybackAfterRebufferMs: 4000,
                        }}
                    />
                    <ControlsFullScreen
                        isLoading={isLoading}
                        isPlaying={isPlaying && !finished}
                        togglePlay={this.togglePlay}
                        toggleFullScreen={this.toggleFullScreen}
                        currentTime={currentTime}
                        playableDuration={playableDuration}
                        playTime={playTime}
                        duration={duration}
                        rewindBack={this.handleRewindBack}
                        rewindForward={this.handleRewindForward}
                        hasNext={hasNext}
                        nextLesson={nextLesson}
                        setCurrentSecond={this.setCurrentSecond}
                        toggleSettings={this.toggleSettingsFullScreen}
                        isSettingsVisible={showSettingsFullScreen}
                    />
                </GestureHandlerRootView>
            </Modal>
        )
    }

    render() {
        const {
            source,
            hasPrevious,
            hasNext,
            previousLesson,
            nextLesson,
            duration,
            courseTitle,
            activeLesson,
            isCoursesStatus,
        } = this.props
        const {
            isLoading,
            isPlaying,
            finished,
            fullScreen,
            playTime,
            currentTime,
            playableDuration,
            playingSpeed,
            quality,
            showSettings,
        } = this.state

        if (!source.uri) {
            return <View style={styles.video} />
        }

        return (
            <View style={styles.container}>
                {!fullScreen ? (
                    <View>
                        <Video
                            ref={this.setVideoRef}
                            style={styles.video}
                            source={source}
                            paused={!isPlaying || finished}
                            resizeMode="contain"
                            onLoadStart={this.handleLoadStart}
                            onReadyForDisplay={this.handleReadyForDisplay}
                            onProgress={this.handleProgress}
                            onSeek={this.handleSeek}
                            onEnd={this.handleEnd}
                            rate={playingSpeed}
                            selectedVideoTrack={{
                                type: SelectedVideoTrackType.RESOLUTION,
                                value: quality,
                            }}
                            bufferConfig={{
                                minBufferMs: 4000,
                                maxBufferMs: 24000,
                                bufferForPlaybackMs: 2500,
                                bufferForPlaybackAfterRebufferMs: 4000,
                            }}
                        />
                        {!isCoursesStatus && (
                            <PaymentCoursesPopover
                                activeLesson={activeLesson}
                                isVideoFinished={finished}
                                courseTitle={courseTitle}
                            />
                        )}
                        <Controls
                            isLoading={isLoading}
                            isPlaying={isPlaying && !finished}
                            togglePlay={this.togglePlay}
                            toggleFullScreen={this.toggleFullScreen}
                            currentTime={currentTime}
                            playableDuration={playableDuration}
                            playTime={playTime}
                            duration={duration}
                            rewindBack={this.handleRewindBack}
                            rewindForward={this.handleRewindForward}
                            setCurrentSecond={this.setCurrentSecond}
                            toggleSettings={this.toggleSettings}
                            isSettingsVisible={showSettings}
                        />
                    </View>
                ) : (
                    this.renderFullScreen()
                )}
                {showSettings ? this.renderSettings() : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
    } as ViewStyle,
    video: {
        width: device.screenData.width,
        height: device.screenData.width * 0.563,
    } as ViewStyle,
    fullScreenContainer: {
        flex: 1,
        backgroundColor: 'black',
    } as ViewStyle,
    fullScreenVideo: {
        width: '100%',
        height: '100%',
    } as ViewStyle,
})
