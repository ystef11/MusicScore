import React from 'react'
import { Image, StyleSheet } from 'react-native'

import { colors, icons } from '@mu-native/ds'
import { useAppNavigation } from '@mu-native/navigation'

const styles = StyleSheet.create({
    header: {
        backgroundColor: colors.white100,
        shadowColor: colors.transparent,
    },

    headerTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.text900,
    },

    backButton: {
        width: 20,
        height: 20,
        marginStart: 16,
        tintColor: colors.text900,
    },
})

export function useSetNavigationHeader(title: string) {
    const navigation = useAppNavigation()

    React.useLayoutEffect(() => {
        navigation.setOptions({
            title,
            headerStyle: styles.header,
            headerTitleStyle: styles.headerTitle,
            // eslint-disable-next-line react/no-unstable-nested-components
            headerBackImage: () => <Image source={icons.iosBackIcon} style={styles.backButton} />,
        })
    }, [])
}
