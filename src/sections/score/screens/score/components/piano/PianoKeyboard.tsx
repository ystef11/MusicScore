import { LocalPianoKeyboard } from './LocalPianoKeyboard'
import React, { useEffect, useState } from 'react'
import { NativeModules, Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native'

import { platform } from '@mu-native/common'
import { useSafeAreaInsets } from '@mu-native/ds'
import { scoreStoreChunk } from '@mu-native/score'
import { useOrientation } from '@mu-native/system'
import { xtz } from '@mu-native/xtz'
import { useActions } from '@ug/store'

import { PianoBlackKey } from './PianoBlackKey'
import { PianoWhiteKey } from './PianoWhiteKey'

type TProps = {
    place: 'sheet' | 'outOfSheet' | 'onTopOfSheet' | 'landscape'
}

interface IScoreNotesInfo {
    measureIndex: number
    data: number[]
}

const keys = new Array(52).fill(undefined)
const blackKeyPlaceholders = [2, 5, 9, 12, 16, 19, 23, 26, 30, 33, 37, 40, 44, 47]

// Not full-bleed: capped width, centred, with a minimum horizontal inset from the edges.
const MAX_WIDTH = platform.isTablet ? 1100 : 720
const H_INSET_TABLET = 24
const H_INSET_PHONE_LANDSCAPE = 16
const H_INSET_PHONE_PORTRAIT = 8
const HEIGHT_TABLET = 132
const HEIGHT_PHONE_PORTRAIT = 56
const HEIGHT_PHONE_LANDSCAPE = 44

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
    },
    container: {
        width: '100%',
        maxWidth: MAX_WIDTH,
        flexDirection: 'row',
    },
    blackRow: {
        ...StyleSheet.absoluteFill,
        flexDirection: 'row',
    },
    blackSpacer: {
        flex: 1,
    },
})

export const PianoKeyboard = React.memo((props: TProps) => {
    const [notes, setNotes] = useState<number[]>([])
    const safeArea = useSafeAreaInsets()
    const orientation = useOrientation()

    const actions = useActions({
        setPianoKeyboardHeight: scoreStoreChunk.actions.setPianoKeyboardHeight,
    })

    const isLandscape = !!orientation && orientation.indexOf('LANDSCAPE') > -1

    let height = HEIGHT_PHONE_PORTRAIT
    let hInset = H_INSET_PHONE_PORTRAIT
    if (platform.isTablet) {
        height = HEIGHT_TABLET
        hInset = H_INSET_TABLET
    } else if (isLandscape) {
        height = HEIGHT_PHONE_LANDSCAPE
        hInset = H_INSET_PHONE_LANDSCAPE
    }

    useEffect(() => {
        const handleScoreNotesInfo = (data: IScoreNotesInfo) => {
            const { data: notesInfo } = data
            const activeData: number[] = []
            let start = 0

            for (let i = 6; i < notesInfo?.length; i += 7) {
                if (notesInfo[i] === 1) {
                    for (let j = start; j <= i; j++) {
                        activeData.push(notesInfo[j])
                    }
                }
                start = i + 1
            }

            const notes: number[] = []

            for (let i = 0; i < activeData?.length; i += 7) {
                notes.push(activeData[i + 2])
            }
            setNotes(notes)
        }

        return xtz.addListenerOnPlayingNotesInfo(handleScoreNotesInfo)
    })

    // Report the (known) height so the score layout can reserve space for the
    // keyboard; reset to 0 on unmount so no space is reserved when it is hidden.
    useEffect(() => {
        actions.setPianoKeyboardHeight(height)

        return () => {
            actions.setPianoKeyboardHeight(0)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [height])

    const style: StyleProp<ViewStyle>[] = [styles.wrapper]
    style.push({
        paddingLeft: Math.max(hInset, safeArea.left),
        paddingRight: Math.max(hInset, safeArea.right),
    })
    if (props.place === 'outOfSheet') {
        style.push({ position: 'absolute', bottom: safeArea.bottom })
    }
    if (props.place === 'onTopOfSheet') {
        style.push({ paddingBottom: 12 })
    }
    if (props.place === 'landscape') {
        style.push({ marginBottom: safeArea.bottom })
    }

    return (
        <View style={style}>
            {Platform.OS === 'android' && NativeModules.WebScoreSource ? <LocalPianoKeyboard height={height} /> : <View style={[styles.container, { height }]}>
                {keys.map((_, index) => (
                    <PianoWhiteKey key={index} index={index} notes={notes} />
                ))}
                <View style={styles.blackRow} pointerEvents="none">
                    {keys.map((_, index) =>
                        blackKeyPlaceholders.includes(index + 1) ? (
                            <View key={index} style={styles.blackSpacer} />
                        ) : (
                            <PianoBlackKey key={index} index={index} notes={notes} />
                        ),
                    )}
                </View>
            </View>}
        </View>
    )
})

export default PianoKeyboard
