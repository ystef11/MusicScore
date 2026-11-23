import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

import { COLOR_MODAL } from '../../constants/styles'

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLOR_MODAL,
        zIndex: 3,
        elevation: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
})

const Modal = ({ children, onPress }: { children: React.ReactElement; onPress?: () => void }) => (
    <TouchableWithoutFeedback onPress={onPress}>
        <View style={styles.container}>{children}</View>
    </TouchableWithoutFeedback>
)

export default Modal
