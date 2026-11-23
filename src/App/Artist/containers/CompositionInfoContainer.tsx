import React, { PureComponent } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { translate } from '@mu-native/locale'
import { NavigationService, Screen } from '@mu-native/navigation'

import { COLOR_GREY_900 } from '../../constants/styles'

interface IProps {
    info: any
    closeModal: () => void
}

interface IState {
    isBioExpanded: boolean
}

export class CompositionInfoContainer extends PureComponent<IProps, IState> {
    constructor(props: IProps) {
        super(props)
        this.state = { isBioExpanded: false }
    }

    expandBio = () => {
        this.setState({ isBioExpanded: true })
    }

    handleArtistPress = () => {
        const { info, closeModal } = this.props
        closeModal()
        NavigationService.push(Screen.artist, { artistId: info.artist.id })
    }

    render(): React.ReactElement {
        const { isBioExpanded } = this.state

        if (!this.props.info?.bio) {
            return (
                <View style={styles.infoContainer}>
                    <Text style={styles.title}>{translate('native.artists.composition_info')}</Text>
                    <Text style={styles.info}>{this.props.info?.name}</Text>
                    {!!this.props.info?.artist?.name && (
                        <View style={styles.row}>
                            <Text style={styles.info}>{translate('native.artists.by')} </Text>
                            <TouchableOpacity onPress={this.handleArtistPress}>
                                <Text style={styles.link}>{this.props.info?.artist.name}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )
        }

        return (
            <View style={styles.infoContainer}>
                <Text style={styles.title}>{translate('native.artists.composition_info')}</Text>
                <Text style={styles.info}>{this.props.info?.name}</Text>
                {!!this.props.info?.artist?.name && (
                    <View style={styles.row}>
                        <Text style={styles.info}>{translate('native.artists.by')} </Text>
                        <TouchableOpacity onPress={this.handleArtistPress}>
                            <Text style={styles.link}>{this.props.info?.artist.name}</Text>
                        </TouchableOpacity>
                    </View>
                )}
                <Text style={styles.subTitle}>{translate('native.artists.bio')}</Text>
                <Text style={styles.info}>{this.props.info?.bio}</Text>
                {!isBioExpanded ? (
                    <TouchableOpacity onPress={this.expandBio}>
                        <Text style={styles.link}>{translate('native.artists.read_more')}</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    infoContainer: {
        paddingHorizontal: 20,
        paddingTop: 5,
        paddingBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
        marginBottom: 16,
        color: COLOR_GREY_900,
    },
    subTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLOR_GREY_900,
        marginBottom: 10,
    },
    info: {
        fontSize: 16,
        color: COLOR_GREY_900,
        marginBottom: 10,
    },
    // eslint-disable-next-line react-native/no-color-literals
    link: {
        fontSize: 16,
        color: '#1F73BD',
        marginBottom: 10,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
    },
})
