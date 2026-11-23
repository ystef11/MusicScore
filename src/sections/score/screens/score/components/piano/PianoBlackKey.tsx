import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'

import { COLOR_LINK } from '../../../../../../App/constants/styles'

import { blackKeysPitches } from './pianoKeysPitches.ts'

type TProps = {
    index: number
    notes: number[]
}

// Sits in a flex cell aligned to a white key; the negative right margin (half the
// key width) pulls it onto the border between this white key and the next, so it
// stays centred on the gap without any pixel math.
export const PianoBlackKey = memo(({ index, notes }: TProps) => {
    const isActive = useMemo(() => {
        for (let i = 0; i < notes?.length; i++) {
            if (index === blackKeysPitches.indexOf(notes[i])) {
                return true
            }
        }

        return false
    }, [notes, index])

    return (
        <View style={styles.cell}>
            <View style={[styles.key, isActive && styles.active]} />
        </View>
    )
})

const styles = StyleSheet.create({
    cell: {
        flex: 1,
        alignItems: 'flex-end',
    },
    key: {
        width: '66.67%',
        height: '56%',
        marginRight: '-33.33%',
        backgroundColor: brandColors.contentPrimary,
    },
    active: {
        backgroundColor: COLOR_LINK,
    },
})
