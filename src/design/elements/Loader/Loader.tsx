import { memo } from 'react'
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { colors } from '../../constants/colors'
import { BrandAppLoader } from '../BrandAppLoader/BrandAppLoader'

const styles = StyleSheet.create({
    loaderContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fullScreenContainer: {
        flex: 1,
        justifyContent: 'center',
        width: '100%',
        backgroundColor: colors.white,
    },
})

type TLoaderProps = {
    color?: string | undefined
    size?: number | 'small' | 'large' | undefined
    style?: StyleProp<ViewStyle>
    isFullScreen?: boolean
}

const Loader = ({ color, size = 'large', style, isFullScreen = false }: TLoaderProps) => (
    <View
        style={[
            isFullScreen ? styles.fullScreenContainer : styles.loaderContainer,
            !!style && style,
        ]}
    >
        <BrandAppLoader />
    </View>
)

export default memo(Loader)
