import { useEffect, useRef, useState } from 'react'
import { AppState, DeviceEventEmitter, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native'
import { useAppNavigation, useAppRoute } from '@mu-native/navigation'
import { useAppSafeArea } from '@mu-native/ds'
import { DefaultNoteSize } from '@mu-native/score'
import { XtzView, xtz } from '@mu-native/xtz'
import autogradeService from './services/autogradeService'

const names = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
export function LocalPracticeScreen() {
    const { uri } = useAppRoute<{ uri: string }>()
    const navigation = useAppNavigation()
    const inset = useAppSafeArea({ top: 12, bottom: 12 })
    const [ready, setReady] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [listening, setListening] = useState(false)
    const [frequency, setFrequency] = useState(0)
    const [level, setLevel] = useState(0)
    const [error, setError] = useState('')
    const [tempo, setTempo] = useState(1)
    const [metronome, setMetronome] = useState(false)
    const alive = useRef(true)
    const busy = useRef(false)
    useEffect(() => {
        alive.current = true
        const loaded = xtz.addListenerOnLoaded(data => {
            if (data.status === 0) { setReady(true); xtz.setPlayHeadVisible(true) }
            else setError('Не удалось открыть ноты для практики.')
        })
        const status = xtz.addListenerOnPlaybackStatusChanged(value => setPlaying(value === 0))
        const mic = DeviceEventEmitter.addListener('MusicScoreMicrophone', data => {
            if (data.error) { setError(data.error); setListening(false) }
            setFrequency(data.frequency || 0); setLevel(data.level || 0)
        })
        const app = AppState.addEventListener('change', state => {
            if (state !== 'active') { NativeModules.WebScoreSource.stopPracticeMicrophone(); setListening(false); xtz.pause() }
        })
        // Ask when entering practice, after its screen is visible.
        const permissionTimer = setTimeout(() => {
            autogradeService.requestMicrophonePermission().catch(failure => {
                if (alive.current) setError(failure instanceof Error ? failure.message : String(failure))
            })
        }, 350)
        xtz.open(uri, 'MUSESCORE_ANY', { noteSize: DefaultNoteSize, defaultNoteSize: DefaultNoteSize, scrollMode: 1, playbackSpeed: 1 })
        return () => { clearTimeout(permissionTimer); alive.current = false; loaded(); status(); mic.remove(); app.remove(); NativeModules.WebScoreSource.stopPracticeMicrophone(); xtz.stop() }
    }, [uri])
    const toggleMicrophone = async () => {
        if (busy.current) return
        if (listening) { NativeModules.WebScoreSource.stopPracticeMicrophone(); setListening(false); setFrequency(0); return }
        busy.current = true; setError('')
        try {
            if (!await autogradeService.requestMicrophonePermission() || !alive.current) return
            await NativeModules.WebScoreSource.startPracticeMicrophone()
            if (alive.current) setListening(true)
            else NativeModules.WebScoreSource.stopPracticeMicrophone()
        } catch (failure) { if (alive.current) setError(failure instanceof Error ? failure.message : String(failure)) }
        finally { busy.current = false }
    }
    const midi = frequency > 0 ? 69 + 12 * Math.log2(frequency / 440) : null
    const note = midi === null ? '—' : `${names[((Math.round(midi) % 12) + 12) % 12]}${Math.floor(Math.round(midi) / 12) - 1}`
    const cents = midi === null ? 0 : Math.round((midi - Math.round(midi)) * 100)
    const button = (title: string, onPress: () => void, disabled = false) => <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress} style={[styles.button, disabled && { opacity: 0.4 }]}><Text style={styles.buttonText}>{title}</Text></Pressable>
    return <View style={[styles.root, { paddingTop: inset.top, paddingBottom: inset.bottom }]}>
        <View style={styles.row}>{button('Назад', () => navigation.goBack())}<Text style={styles.title}>Практика</Text></View>
        <XtzView style={{ flex: 1 }} />
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        <Text style={styles.pitch}>{listening ? `${note}  ${frequency ? `${frequency.toFixed(1)} Гц  ${cents > 0 ? '+' : ''}${cents} ¢` : 'Сыграйте одну ноту'}` : 'Микрофон выключен'}</Text>
        <View style={styles.meter}><View style={{ height: 5, backgroundColor: '#7856ff', width: `${Math.min(100, level * 400)}%` }} /></View>
        <Text style={styles.hint}>Ноты, повтор участка и тюнер. Для тюнера используйте наушники. Оценка точности по партитуре пока недоступна.</Text>
        <View style={styles.row}>
            {button(playing ? 'Пауза' : 'Играть', () => playing ? xtz.pause() : xtz.play(), !ready)}
            {button('В начало', () => xtz.rewind(), !ready)}
            {button(listening ? 'Выключить микрофон' : 'Микрофон', toggleMicrophone, !ready)}
        </View>
        <View style={styles.row}>
            {button('− темп', () => { const value = Math.max(0.25, tempo - 0.1); setTempo(value); xtz.setPlaybackSpeed(value) }, !ready)}
            <Text>{Math.round(tempo * 100)}%</Text>
            {button('+ темп', () => { const value = Math.min(2, tempo + 0.1); setTempo(value); xtz.setPlaybackSpeed(value) }, !ready)}
            {button(metronome ? 'Метроном: вкл.' : 'Метроном: выкл.', () => { setMetronome(!metronome); xtz.setMetronomeEnabledFile(!metronome) }, !ready)}
        </View>
    </View>
}
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: 'white' }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', gap: 6, padding: 6, flexWrap: 'wrap' },
    title: { fontSize: 20, color: '#28133d' }, button: { padding: 12, borderRadius: 22, backgroundColor: '#351b50' }, buttonText: { color: 'white' },
    error: { color: '#b00020', padding: 8 }, pitch: { textAlign: 'center', fontSize: 20, padding: 8, color: '#28133d' }, hint: { padding: 8, fontSize: 12, color: '#665777' },
    meter: { height: 5, backgroundColor: '#eee', marginHorizontal: 16 },
})
