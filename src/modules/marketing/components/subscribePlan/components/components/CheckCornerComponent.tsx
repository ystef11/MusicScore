import React, { memo } from 'react'

import { StyleSheet, View } from 'react-native'

import { style } from '@mu-native/ds'

const styles = StyleSheet.create({
    checkCornerContainer: style.view({
        height: 12,
        width: 12,
        overflow: 'hidden',
        position: 'absolute',
        top: 0,
        right: -1,
        borderRadius: 2,
    }),
    checkCorner: style.view({
        height: 12,
        width: 12,
        position: 'absolute',
        transform: [{ rotate: '45deg' }],
        top: -6,
        right: -6,
    }),
})

const dynamicStyles = {
    getCheckCorner: (backgroundColor: string, opacity: number) =>
        StyleSheet.flatten([
            styles.checkCorner,
            {
                backgroundColor,
                opacity,
            },
        ]),
}

type TCheckCorner = {
    color: string
    opacity: number
}

const CheckCorner = ({ color, opacity }: TCheckCorner) => (
    <View style={styles.checkCornerContainer}>
        <View style={dynamicStyles.getCheckCorner(color, opacity)} />
    </View>
)

export default memo(CheckCorner)
