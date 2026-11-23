import { LayoutAnimation, StyleSheet } from 'react-native'

import { AppText, brandColors, CommonTouchable, Icon, layout } from '@mu-native/ds'
import { chevronDown } from '@mu-native/icons/chevronDown'
import { translate } from '@mu-native/locale'

type TProps = {
    /** Shown while collapsed, e.g. "All instruments". */
    label: string
    isExpanded: boolean
    onToggle: (isExpanded: boolean) => void
}

export const FilterExpanderToggle = ({ label, isExpanded, onToggle }: TProps) => (
    <CommonTouchable
        style={styles.container}
        onPress={() => {
            LayoutAnimation.easeInEaseOut()
            onToggle(!isExpanded)
        }}
    >
        <AppText
            font="f15w400"
            rawText={isExpanded ? translate('native.ebook.filter_show_less') : label}
        />
        <Icon
            source={chevronDown}
            size={20}
            tint={brandColors.contentPrimary}
            style={isExpanded ? styles.iconFlipped : undefined}
        />
    </CommonTouchable>
)

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: layout.marginXs,
        paddingVertical: layout.marginXm,
    },
    iconFlipped: {
        transform: [{ rotate: '180deg' }],
    },
})
