import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Popover, SafeAreaConsumer } from '@mu-native/ds'

import { COLOR_WHITE, MARGIN_MD, MARGIN_XM } from '../constants/styles'
import { isAndroid } from '../Utils/Platform'

const TOOLTIP_COLOR = '#616161'
const styles = StyleSheet.create({
    tooltip: {
        backgroundColor: TOOLTIP_COLOR,
        paddingVertical: MARGIN_XM,
        paddingHorizontal: MARGIN_MD,
    },
    text: {
        color: COLOR_WHITE,
        fontSize: 14,
    },
    arrow: {
        backgroundColor: TOOLTIP_COLOR,
    },
})
type Props = {
    text: string
    children: any
    setRef?: (ref: any) => void
}
type State = {
    isVisible: boolean
}

class TooltipWrapper extends Component<Props, State> {
    timeOut?: ReturnType<typeof setTimeout>
    childRef: any

    constructor(props: any) {
        super(props)
        this.state = {
            isVisible: false,
        }
    }

    showTooltip = () => {
        if (this.timeOut) {
            clearTimeout(this.timeOut)
        }

        this.setState(
            {
                isVisible: true,
            },
            () => {
                this.timeOut = setTimeout(() => {
                    this.closeTooltip()
                }, 1000)
            },
        )
    }
    closeTooltip = () => {
        this.setState({
            isVisible: false,
        })
    }
    setRef = (ref: any) => {
        this.childRef = ref

        if (this.props.setRef) {
            this.props.setRef(ref)
        }
    }

    render() {
        const { isVisible } = this.state
        const { children, text } = this.props
        return (
            <>
                {React.cloneElement(children, {
                    onLongPress: this.showTooltip,
                    setRef: this.setRef,
                })}
                <SafeAreaConsumer>
                    {insets => (
                        <Popover
                            isVisible={isVisible}
                            // @ts-ignore
                            fromView={this.childRef}
                            arrowStyle={styles.arrow}
                            onRequestClose={this.closeTooltip}
                            verticalOffset={isAndroid ? -(insets?.top ?? 0) : 0}
                        >
                            <View style={styles.tooltip}>
                                <Text style={styles.text}>{text}</Text>
                            </View>
                        </Popover>
                    )}
                </SafeAreaConsumer>
            </>
        )
    }
}

export default TooltipWrapper
