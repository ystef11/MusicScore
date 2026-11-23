import { memo, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'

import { brandColors } from '@mu-native/ds'

import { COLOR_LINK, COLOR_WHITE } from '../../../../../../App/constants/styles'

import { whiteKeysPitches } from './pianoKeysPitches.ts'

type TProps = {
    index: number
    notes: number[]
}

export const PianoWhiteKey = memo(({ index, notes }: TProps) => {
    const isActive = useMemo(() => {
        for (let i = 0; i < notes?.length; i++) {
            if (index === whiteKeysPitches.indexOf(notes[i])) {
                return true
            }
        }

        return false
    }, [notes, index])

    return <View style={[styles.key, isActive ? styles.active : styles.inactive]} />
})

const styles = StyleSheet.create({
    key: {
        flex: 1,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: brandColors.contentPrimary,
    },
    active: {
        backgroundColor: COLOR_LINK,
    },
    inactive: {
        backgroundColor: COLOR_WHITE,
    },
})
