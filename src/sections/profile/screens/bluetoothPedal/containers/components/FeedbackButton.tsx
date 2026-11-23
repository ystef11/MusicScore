import { memo } from 'react'
import { StyleSheet, Image, View, Text, TouchableOpacity } from 'react-native'

import { colors, icons, layout, layoutHelpers, style } from '@mu-native/ds'
import { translate } from '@mu-native/locale'

const styles = StyleSheet.create({
    pedalSettingItemContainer: style.view({
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.grayDisabled,
        marginTop: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingHorizontal: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
        paddingVertical: layoutHelpers.getResponsiveSizeExtended(layout.marginMd),
    }),
    settingTitle: style.text({
        color: colors.text900,
        fontSize: layoutHelpers.getResponsiveSizeExtended(16),
    }),
    arrowIcon: style.image({
        width: layoutHelpers.getResponsiveSizeExtended(20),
        height: layoutHelpers.getResponsiveSizeExtended(20),
    }),
    textFeedbackContainer: style.view({
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    }),
})

type TFeedbackButtonProps = {
    onGoToFeedbackScreen: () => void
}

const FeedbackButton = ({ onGoToFeedbackScreen }: TFeedbackButtonProps) => (
    <TouchableOpacity onPress={onGoToFeedbackScreen}>
        <View style={styles.pedalSettingItemContainer}>
            <View style={styles.textFeedbackContainer}>
                <Text style={styles.settingTitle}>{translate('native.key_words.feedback')}</Text>
                <Image style={styles.arrowIcon} source={icons.iosArrowRight} />
            </View>
        </View>
    </TouchableOpacity>
)
export default memo(FeedbackButton)
