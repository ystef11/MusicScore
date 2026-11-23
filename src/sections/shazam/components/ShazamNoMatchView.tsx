import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout, MuseButton } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'

type Props = {
    onTryAgain: () => void
}

export const ShazamNoMatchView = ({ onTryAgain }: Props) => (
    <View style={styles.container}>
        <Icon source={brokenHeart} tint={brandColors.contentPrimary} size={40} />
        <AppText
            rawText={translate('native.shazam.no_match.title')}
            font="f44w400Accent"
            brandColor="contentPrimary"
            textAlign="center"
            lineHeight={40}
            style={styles.title}
        />
        <AppText
            rawText={translate('native.shazam.no_match.description')}
            font="f15w400"
            brandColor="contentPrimary"
            textAlign="center"
            lineHeight={20}
        />
        <MuseButton title={translate('native.actions.try_again')} onPress={onTryAgain} />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: 16,
    },
    title: {
        letterSpacing: 0.5,
    },
})
