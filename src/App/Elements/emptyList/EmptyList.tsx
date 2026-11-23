import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native'

import { colors, layout } from '@mu-native/ds'

type Props = {
    icon?: ImageSourcePropType
    heading: string
    subscription: string
}

const EmptyList = ({ icon, heading, subscription }: Props) => {
    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                {!!icon && <Image source={icon} style={styles.iconStyle} resizeMode="contain" />}
            </View>
            <Text style={styles.headingStyle}>{heading}</Text>
            <Text style={styles.subscriptionStyle}>{subscription}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        maxWidth: 328,
        marginTop: layout.fullScreenHeight / 4 - 60,
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: colors.white100,
        alignItems: 'center',
        justifyContent: 'center',
        width: 92,
        height: 92,
        borderRadius: 48,
        marginBottom: 14,
    },
    headingStyle: {
        fontSize: 16,
        lineHeight: 24,
        fontWeight: '500',
        color: colors.text900,
        textAlign: 'center',
    },
    subscriptionStyle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.gray800,
        textAlign: 'center',
        marginBottom: 20,
    },
    iconStyle: {
        height: 28,
        width: 32,
        tintColor: colors.text900,
    },
})

export default EmptyList
