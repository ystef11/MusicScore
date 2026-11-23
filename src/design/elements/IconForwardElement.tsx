import { memo } from 'react'
import { Image, StyleSheet } from 'react-native'

import { colors } from '../constants/colors'
import { icons } from '../constants/icons'

const styles = StyleSheet.create({
    iosArrow: {
        tintColor: colors.text900,
        height: 17,
        width: 17,
    },
})

const IconForwardElement = () => <Image source={icons.iosForwardIcon} style={styles.iosArrow} />

export default memo(IconForwardElement)
