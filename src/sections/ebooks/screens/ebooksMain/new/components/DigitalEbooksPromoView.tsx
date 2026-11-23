import { Image, StyleSheet, View } from 'react-native'

import {
    brandColors,
    globalStyles,
    Icon,
    icons,
    layout,
    MuseButton,
    staticSafeArea,
    SvgAsset,
} from '@mu-native/ds'
import { halLeonard } from '@mu-native/icons/halLeonard'
import { translate } from '@mu-native/locale'
import { useAppNavigation } from '@mu-native/navigation'

export const DigitalEbooksPromoView = () => {
    const navigation = useAppNavigation()
    return (
        <View style={styles.base}>
            <View style={styles.header}>
                <SvgAsset type="ic_logo" />
                <Icon source={halLeonard} />
            </View>
            <View style={globalStyles.flex1} />

            <View style={styles.illustrations}>
                <Image source={icons.ebooksWave} style={styles.waves} />
                <Image source={icons.ebooksBooks} style={styles.books} />
            </View>

            <MuseButton
                onPress={navigation.goBack}
                title={translate('native.ebooks.learn_more')}
                type="secondary"
                style={styles.button}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: brandColors.accentPrimary,
        paddingTop: staticSafeArea().top + 16,
        paddingBottom: staticSafeArea().bottomWithAndroid + 20,
    },

    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: layout.baseMarginFromEdges,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: brandColors.backgroundDefault,
    },

    button: {
        marginHorizontal: 16,
    },

    illustrations: {
        width: '100%',
        overflow: 'visible',
    },

    waves: {
        width: '100%',
        height: 2007 / 3,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },

    books: {
        width: '100%',
        height: 1284 / 3,
        position: 'absolute',
        right: 0,
        bottom: 0,
    },
})
