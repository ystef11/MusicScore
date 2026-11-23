import React from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'

import { colors } from '../../constants/colors'

const styles = StyleSheet.create({
    rootViewScreen: {
        flex: 1,
        width: '100%',
        backgroundColor: colors.white,
        alignItems: 'center',
    },
})

type TRootViewComponent = {
    children: React.ReactNode
    style?: ViewStyle
}

const RootViewScreenComponent = ({ children, style }: TRootViewComponent) => (
    <View style={[styles.rootViewScreen, style]}>{children}</View>
)

export default RootViewScreenComponent
