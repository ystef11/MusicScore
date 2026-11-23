import { memo } from 'react'
import { StyleSheet } from 'react-native'

import { AppText } from '../components/AppText/AppText'
import { brandColors } from '../constants/new/brandColors.ts'
import { CommonTouchable } from '../elements/CommonTouchable.tsx'

type TProps = {
    name: string
    id: string
    selected?: boolean
    count: string | number
    /** 'm' is the compact 32px chip; 'l' is the 44px chip used in filter sheets. */
    size?: 'm' | 'l'
    onPress: (id: string) => void
}

export const FilterItemChip = memo(({ name, id, selected, count, size = 'm', onPress }: TProps) => {
    const isEmpty = !count || count.toString() === '0'
    return (
        <CommonTouchable
            style={[
                size === 'l' ? styles.itemLarge : styles.item,
                {
                    backgroundColor: selected
                        ? brandColors.contentPrimary
                        : brandColors.backgroundInactive,
                },
            ]}
            onPress={isEmpty ? undefined : () => onPress(id)}
        >
            <AppText
                font="f17w400"
                rawText={name}
                brandColor={selected ? 'backgroundDefault' : 'contentPrimary'}
                style={isEmpty ? styles.emptyTitle : undefined}
            />
        </CommonTouchable>
    )
})

const styles = StyleSheet.create({
    item: {
        height: 32,
        borderRadius: 32 / 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    itemLarge: {
        height: 44,
        borderRadius: 44 / 2,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },

    emptyTitle: {
        opacity: 0.4,
    },
})
