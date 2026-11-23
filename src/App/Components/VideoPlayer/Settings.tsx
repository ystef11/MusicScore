import { PureComponent } from 'react'
import { View, StyleSheet } from 'react-native'

import { AppText, CommonTouchable, AppRadioButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import { COLOR_WHITE } from '../../constants/styles'
import { isPhoneX, isAndroid } from '../../Utils/Platform'

interface IItem {
    title: string
    value: number
}

interface IProps {
    playingSpeed: number
    quality: number
    onChangePlayingSpeed: (playingSpeed: number) => void
    onChangeQuality: (quality: number) => void
    close: () => void
    isLandscape?: boolean
}

export default class Settings extends PureComponent<IProps> {
    speedItems: IItem[] = [
        { title: '0.5x', value: 0.5 },
        { title: translate('native.video_player.speed_normal'), value: 1 },
        { title: '1.25x', value: 1.25 },
        { title: '1.5x', value: 1.5 },
        { title: '2x', value: 2 },
    ]
    qualityItems: IItem[] = [
        {
            title: translate('native.courses.video.quality_normal_resolution', {
                resolution: '720',
            }),
            value: 720,
        },
        { title: '360', value: 360 },
        { title: '480', value: 480 },
        { title: '1080', value: 1080 },
    ]

    handleSpeedItemPress(playingSpeed: number) {
        this.props.onChangePlayingSpeed(playingSpeed)
    }

    handleQualityItemPress = (quality: number) => {
        this.props.onChangeQuality(quality)
    }

    renderSpeedItem = ({ title, value }: IItem) => {
        return (
            <AppRadioButton
                title={title}
                isSelected={this.props.playingSpeed === value}
                style={styles.itemContainer}
                onPress={() => this.handleSpeedItemPress(value)}
            />
        )
    }

    renderQualityItem = ({ title, value }: IItem) => {
        return (
            <AppRadioButton
                title={title}
                isSelected={this.props.quality === value}
                style={styles.itemContainer}
                onPress={() => this.handleQualityItemPress(value)}
            />
        )
    }

    render() {
        const { close, isLandscape } = this.props

        return (
            <CommonTouchable style={styles.wrapper} activeOpacity={1} onPress={close}>
                <CommonTouchable
                    style={isLandscape ? styles.containerLandscape : styles.container}
                    activeOpacity={1}
                >
                    <View style={styles.contentContainer}>
                        <AppText font="f20w600" style={styles.title}>
                            {translate('native.courses.play_speed')}
                        </AppText>
                        {this.speedItems?.map(this.renderSpeedItem)}
                    </View>
                    {isAndroid && (
                        <View style={styles.contentContainer}>
                            <AppText
                                font="f20w600"
                                style={styles.title}
                                rawText={translate('native.courses.video_quality')}
                            />
                            {this.qualityItems?.map(this.renderQualityItem)}
                        </View>
                    )}
                </CommonTouchable>
            </CommonTouchable>
        )
    }
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        height: '100%',
        zIndex: 3,
        position: 'absolute',
    },
    container: {
        flexDirection: 'row',
        position: 'absolute',
        top: isPhoneX ? 160 : 130,
        right: 16,
        paddingVertical: 16,
        backgroundColor: COLOR_WHITE,
        elevation: 6,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: 'black',
        shadowOpacity: 0.24,
    },
    containerLandscape: {
        width: isAndroid ? 279 : 120,
        flexDirection: 'row',
        position: 'absolute',
        bottom: 56,
        right: 56,
        paddingVertical: 16,
        borderRadius: 8,
        backgroundColor: COLOR_WHITE,
        elevation: 6,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowColor: 'black',
        shadowOpacity: 0.24,
    },
    contentContainer: {
        paddingHorizontal: 16,
    },
    title: {
        marginBottom: 6,
    },
    itemContainer: {
        height: 48,
        alignItems: 'center',
    },
})
