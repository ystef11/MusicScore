import { StyleSheet, View } from 'react-native'

import { AppText, brandColors, layout, MuseButton } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

type Props = {
    message: string
    onBackPress: () => void
}

export const ShazamErrorView = ({ message, onBackPress }: Props) => (
    <View style={styles.container}>
        <AppText
            rawText={translate('native.new_concept.common.error_title')}
            font="f24w600"
            textAlign="center"
        />
        <AppText
            style={styles.message}
            rawText={message || translate('native.shazam.error.try_again_hint')}
            font="f15w400"
            textAlign="center"
        />
        <MuseButton
            style={styles.retry}
            title={translate('native.actions.back')}
            onPress={onBackPress}
        />
    </View>
)

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: brandColors.backgroundDefault,
        alignItems: 'center',
        justifyContent: 'center',
        padding: layout.baseMarginFromEdges,
    },
    message: {
        marginTop: 16,
    },
    retry: {
        marginTop: 24,
    },
})
