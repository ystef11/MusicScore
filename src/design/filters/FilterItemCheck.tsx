import { memo } from 'react'
import { StyleProp, StyleSheet, ViewStyle } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import { globalStyles } from '../constants/layout'
import { Checkbox } from '../elements/Checkbox/Checkbox'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

type TProps = {
    name: string
    id: string
    selected?: boolean
    nestingLevel?: 0 | 1 | 2
    disabled?: boolean
    count?: string | number
    hideCount?: boolean
    onPress: (id: string) => void
    style?: StyleProp<ViewStyle>
    testID?: string
}

export const FilterItemCheck = memo(
    ({
        name,
        id,
        selected,
        count,
        style,
        hideCount,
        onPress,
        testID,
        nestingLevel = 0,
        disabled = false,
    }: TProps) => {
        let isEmpty = !hideCount && (!count || count.toString() === '0')
        if (hideCount === false) isEmpty = false

        const nestingStyle = nestingLevel !== 0 ? styles[`nestedItem${nestingLevel}`] : undefined

        return (
            <CommonTouchable
                testID={testID}
                style={[styles.item, style, nestingStyle]}
                onPress={isEmpty || disabled ? undefined : () => onPress(id)}
            >
                <Checkbox
                    selected={!!selected}
                    disabled={disabled || isEmpty}
                    style={styles.check}
                />
                <AppText
                    font="f17w400"
                    rawText={name}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={isEmpty && !disabled ? styles.emptyTitle : globalStyles.flexShrink}
                    brandColor="contentPrimary"
                />
                {!!count && !hideCount && (
                    <AppText
                        rawText={count?.toString()}
                        brandColor="contentTertiary"
                        font="f17w400"
                        style={styles.count}
                    />
                )}
            </CommonTouchable>
        )
    },
)

const styles = StyleSheet.create({
    item: {
        height: 48,
        borderRadius: 32 / 2,
        alignItems: 'center',
        flexDirection: 'row',
    },

    nestedItem1: {
        marginLeft: 30,
    },

    nestedItem2: {
        marginLeft: 60,
    },

    emptyTitle: {
        opacity: 0.4,
    },

    check: {
        marginEnd: 8,
    },

    count: {
        marginStart: 3,
    },
})
