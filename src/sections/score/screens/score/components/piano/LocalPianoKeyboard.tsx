import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { openScoreControls } from '@xtz/muse-rn'
const black = new Set([1, 3, 6, 8, 10])
const labels = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
export function LocalPianoKeyboard({ height }: { height: number }) {
    const [active, setActive] = useState<number[]>([])
    return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ height, alignItems: 'stretch' }}>
        {Array.from({ length: 37 }, (_, index) => index + 48).map(note => {
            const dark = black.has(note % 12)
            return <Pressable key={note} accessibilityRole="button" accessibilityLabel={`${labels[note % 12]}${Math.floor(note / 12) - 1}`}
                onPressIn={() => { setActive(previous => [...previous, note]); openScoreControls.previewNoteOn(note) }}
                onPressOut={() => { setActive(previous => previous.filter(value => value !== note)); openScoreControls.previewNoteOff(note) }}
                style={{ width: dark ? 26 : 34, height: dark ? '65%' : '100%', justifyContent: 'flex-end', alignItems: 'center', borderWidth: 0.5, borderColor: '#55446a', borderRadius: 3, backgroundColor: active.includes(note) ? '#7856ff' : dark ? '#241633' : 'white' }}>
                {!dark && <Text style={{ fontSize: 10, color: '#55446a', paddingBottom: 3 }}>{labels[note % 12]}{Math.floor(note / 12) - 1}</Text>}
            </Pressable>
        })}
    </ScrollView>
}
