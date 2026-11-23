import React, { JSX } from 'react'
import { TouchableOpacity, Text, StyleSheet, Pressable, Modal } from 'react-native'

import { colors, layoutHelpers } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

import MetricaEvents from '../../../../App/constants/MetricaEvents'
import reportEvent from '../../../../App/Utils/Analytics'
import { marketingStorage } from '../../storage/marketingStorage'

interface IProps {
    isVisible: boolean
    onClose: () => void
}

const styles = StyleSheet.create({
    background: {
        justifyContent: 'center',
        flex: 1,
        alignItems: 'center',
    },
    container: {
        width: 310,
        backgroundColor: colors.white,
        borderRadius: 10,
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 20,
        elevation: 6,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowRadius: 8,
        shadowColor: colors.black,
        shadowOpacity: 0.3,
    },
    title: {
        fontSize: 16,
        color: colors.gray700,
    },
    button: {
        width: 120,
        height: 35,
        borderRadius: 4,
        marginTop: 15,
        backgroundColor: colors.link,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-end',
    },
    buttonTitle: {
        fontSize: 17,
        ...layoutHelpers.fontWeight600,
        color: colors.white,
    },
})

export default class AutoScrollModalSettings extends React.PureComponent<IProps> {
    componentDidUpdate(prevProps: IProps) {
        const { isVisible } = this.props
        if (!prevProps.isVisible && isVisible) {
            reportEvent(MetricaEvents.SCORE_AUTO_SCROLL_INFO_POPUP_SHOW)
        }
    }

    handleClose(value: string): void {
        const { onClose } = this.props
        if (value === 'gotit') {
            marketingStorage.set('autoScrollModalSettingsShown', true)
        }

        reportEvent(MetricaEvents.SCORE_AUTO_SCROLL_INFO_POPUP_CLOSE, { value })

        onClose()
    }

    render(): JSX.Element {
        const { isVisible } = this.props

        return (
            <Modal visible={isVisible} transparent>
                <Pressable style={styles.background} onPress={() => this.handleClose('screen')}>
                    <TouchableOpacity
                        style={styles.container}
                        onPress={() => this.handleClose('popup')}
                        activeOpacity={1}
                    >
                        <Text style={styles.title}>
                            {translate('native.marketing.auto_scroll_settings_hint')}
                        </Text>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => this.handleClose('gotit')}
                        >
                            <Text style={styles.buttonTitle}>
                                {translate('native.score_onboarding.got_it_button')}
                            </Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Pressable>
            </Modal>
        )
    }
}
