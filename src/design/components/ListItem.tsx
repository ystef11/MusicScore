import { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../constants/colors'
import { globalStyles } from '../constants/layout.ts'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'
import IconForwardElement from '../elements/IconForwardElement'
import { layoutHelpers } from '../helpers/layout'
import { style } from '../helpers/style'

const styles = StyleSheet.create({
    newItemContainer: style.view({
        marginBottom: 24,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
    }),
    title: style.text({
        color: colors.text900,
        fontSize: 14,
        lineHeight: 20,
        marginBottom: layoutHelpers.getResponsiveSizeExtended(4),
    }),
    label: style.text({
        fontSize: 14,
        lineHeight: 16,
        color: colors.grey400,
    }),
    newText: style.text({
        color: colors.gray500,
        fontSize: 12,
        lineHeight: 16,
    }),
})

type Props = {
    title: string
    count?: number
    onPress: () => void
    subTitle?: string
    isShowArrow?: boolean
}

const ListItem = ({ title, subTitle, onPress, count, isShowArrow = false }: Props) => {
    return (
        <CommonTouchable onPress={onPress} style={styles.newItemContainer}>
            <View style={globalStyles.flex1}>
                <Text style={styles.title}>{title}</Text>
                {subTitle ? <Text style={styles.newText}>{subTitle}</Text> : null}
            </View>
            {count ? <Text style={styles.label}>{count}</Text> : null}
            {isShowArrow ? <IconForwardElement /> : null}
        </CommonTouchable>
    )
}

export default memo(ListItem)
