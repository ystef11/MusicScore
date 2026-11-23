import React from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { layout } from '../../constants/layout'

const styles = StyleSheet.create({
    rootViewScreen: {
        flex: 1,
        width: '100%',
        maxWidth: layout.maxTabletWidth,
        alignSelf: 'center',
        alignItems: 'center',
    },
})

type TRootViewComponent = {
    children: React.ReactNode
    style?: StyleProp<ViewStyle>
}

const RootViewTabletLayoutComponent = ({ children, style }: TRootViewComponent) => (
    <View style={[styles.rootViewScreen, style]}>{children}</View>
)

export default RootViewTabletLayoutComponent
