import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, Icon, layout, MuseButton } from '@mu-native/ds'
import { brokenHeart } from '@mu-native/icons/brokenHeart'
import { translate } from '@mu-native/locale'
import type { ShazamMatch } from '@mu-native/shazam'

import { ShazamMatchHeader } from './ShazamMatchHeader.tsx'

type Props = {
    match: ShazamMatch
    onBackPress: () => void
}

export const ShazamNoScoresView = ({ match, onBackPress }: Props) => (
    <View style={styles.container}>
        <ShazamMatchHeader match={match} onBackPress={onBackPress} />
        <View style={styles.body}>
            <Icon source={brokenHeart} tint={brandColors.contentPrimary} size={40} />
            <AppText
                rawText={translate('native.shazam.no_scores.title')}
                font="f20w600"
                brandColor="contentPrimary"
                textAlign="center"
                lineHeight={24}
            />
            <MuseButton
                title={translate('native.shazam.no_scores.back_to_home')}
                onPress={onBackPress}
            />
        </View>
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
    },
    body: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: layout.baseMarginFromEdges,
        gap: 16,
    },
})
