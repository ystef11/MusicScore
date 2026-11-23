import { StyleSheet, View } from 'react-native'

import { COLOR_NOTIFICATION } from '../constants/styles'

const NOTIFICATION_SIZE = 8

export const NotificationCount = () => {
    return <View style={styles.circle} />
}

const styles = StyleSheet.create({
    circle: {
        width: NOTIFICATION_SIZE,
        height: NOTIFICATION_SIZE,
        backgroundColor: COLOR_NOTIFICATION,
        borderWidth: 1,
        borderColor: COLOR_NOTIFICATION,
        borderRadius: NOTIFICATION_SIZE / 2,
        position: 'absolute',
        right: -4,
        top: -2,
    },
})
