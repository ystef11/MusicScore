import { memo } from 'react'
import { LayoutAnimation, StyleSheet, ViewStyle } from 'react-native'

import { chevronDown } from '@mu-native/icons/chevronDown'
import { translate } from '@mu-native/locale/i18n'

import { AppText } from '../components/AppText/AppText'
import Icon from '../components/Icon/Icon'
import { brandColors } from '../constants/new/brandColors.ts'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

type TProps = {
    isExpanded: boolean
    setExpanded: (value: boolean) => void
    style?: ViewStyle
}

export const FiltersToggleExpanded = memo(({ isExpanded, setExpanded, style }: TProps) => {
    return (
        <CommonTouchable
            style={style ? [styles.base, style] : styles.base}
            onPress={() => {
                LayoutAnimation.easeInEaseOut()
                setExpanded(!isExpanded)
            }}
        >
            <AppText
                font="f15w400"
                brandColor="contentPrimary"
                rawText={translate(
                    isExpanded ? 'native.ebook.filter_show_less' : 'native.ebook.filter_show_more',
                )}
            />
            <Icon
                source={chevronDown}
                tint={brandColors.contentPrimary}
                style={isExpanded && styles.iconTop}
            />
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    base: {
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconTop: {
        transform: [{ rotate: '180deg' }],
    },
})
