import { StyleSheet, TouchableOpacity, View } from 'react-native'

import { AppText, brandColors, Icon, layout } from '@mu-native/ds'
import { filter as filterIcon } from '@mu-native/icons/filter'

type Props = {
    title: string
    onFilterPress: () => void
}

export const FoundScoresHeader = ({ title, onFilterPress }: Props) => (
    <View style={styles.headerRow}>
        <AppText rawText={title} font="f20w600" brandColor="contentPrimary" lineHeight={24} />
        <TouchableOpacity onPress={onFilterPress} hitSlop={12}>
            <Icon source={filterIcon} tint={brandColors.contentPrimary} size={24} />
        </TouchableOpacity>
    </View>
)

const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: layout.baseMarginFromEdges,
        paddingTop: 24,
        paddingBottom: 16,
    },
})
