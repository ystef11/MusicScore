import React, { JSX } from 'react'
import { Modal, StyleSheet, TouchableOpacity } from 'react-native'
import { colors } from '../constants/colors'
import { style } from '../helpers/style'

const styles = StyleSheet.create({
    backDrop: style.view({
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.blackTransparent71,
    }),
    container: style.view({
        maxWidth: 560,
        borderRadius: 8,
        backgroundColor: colors.white,
        overflow: 'hidden',
    }),
})

type TProps = {
    isVisible: boolean
    Component: (() => JSX.Element) | null
    onClose(): void
}

const PlainModal = ({ isVisible, Component, onClose }: TProps) => (
    <Modal
        supportedOrientations={['portrait', 'landscape']}
        visible={isVisible}
        animationType="fade"
        transparent
    >
        <TouchableOpacity style={styles.backDrop} activeOpacity={1} onPress={onClose}>
            <TouchableOpacity style={styles.container} activeOpacity={1}>
                {Component ? <Component /> : null}
            </TouchableOpacity>
        </TouchableOpacity>
    </Modal>
)

export default PlainModal
