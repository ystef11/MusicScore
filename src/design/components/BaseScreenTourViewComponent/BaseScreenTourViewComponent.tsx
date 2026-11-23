import { PropsWithChildren } from 'react'
import { StyleSheet, View } from 'react-native'

import { colors } from '../../constants/colors'
import { layout } from '../../constants/layout'
import { style } from '../../helpers/style'

const styles = StyleSheet.create({
    container: style.view({
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.tourUpdateBg,
    }),
    imageWrapper: style.view({
        width: '100%',
        height: layout.imageMaxHeight,
        backgroundColor: colors.tourUpdateBg,
        justifyContent: 'center',
        position: 'absolute',
        top: 0,
    }),
    textContainer: {
        width: '100%',
        height: layout.fullScreenHeight - layout.imageMaxHeight,
        position: 'absolute',
        bottom: 0,
        backgroundColor: colors.white,
    },
})

export const BaseScreenTourView = (props: PropsWithChildren) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageWrapper} />
            <View style={styles.textContainer} />
            {props.children}
        </View>
    )
}
