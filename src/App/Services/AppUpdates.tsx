import { useEffect, useState } from 'react'
import {
    ActivityIndicator, AppState, DeviceEventEmitter, Modal, NativeModules,
    Platform, Pressable, StyleSheet, Text, View,
} from 'react-native'

export const LATEST_APK_URL = 'https://github.com/ystef11/MusicScore/releases/latest/download/app-release.apk'

type Release = { available: boolean; version: string; sha256: string; size: number }
type State = {
    phase: 'idle' | 'checking' | 'available' | 'downloading' | 'message'
    release?: Release
    message?: string
    progress?: number
}
const native = NativeModules.AppUpdater as {
    check(): Promise<Release>
    installLatest(): Promise<void>
} | undefined
let state: State = { phase: 'idle' }
let checking = false
let autoChecked = false
const listeners = new Set<(value: State) => void>()
const publish = (value: State) => { state = value; listeners.forEach(listener => listener(value)) }
const errorText = (error: unknown) => error instanceof Error ? error.message : String(error)

export async function checkAppUpdates(manual = true) {
    if (checking || state.phase === 'downloading' || state.phase === 'available') return
    if (!native || Platform.OS !== 'android') {
        if (manual) publish({ phase: 'message', message: 'Обновления доступны в Android-сборке MusicScore.' })
        return
    }
    checking = true
    if (manual) publish({ phase: 'checking' })
    try {
        const release = await native.check()
        if (release.available) publish({ phase: 'available', release })
        else if (manual) publish({ phase: 'message', message: 'Установлен APK последнего релиза.' })
    } catch (error) {
        if (manual) publish({ phase: 'message', message: errorText(error) })
    } finally { checking = false }
}

async function install() {
    if (state.phase !== 'available' || !native) return
    const release = state.release
    publish({ phase: 'downloading', release, progress: 0 })
    const subscription = DeviceEventEmitter.addListener('MusicScoreUpdateProgress', (progress: number) => {
        if (state.phase === 'downloading') publish({ ...state, progress })
    })
    try {
        await native.installLatest()
        publish({ phase: 'idle' })
    } catch (error) { publish({ phase: 'message', message: errorText(error) }) }
    finally { subscription.remove() }
}

export function AppUpdateController() {
    const [value, setValue] = useState(state)
    useEffect(() => {
        listeners.add(setValue)
        setValue(state)
        let timer: ReturnType<typeof setTimeout> | undefined
        const schedule = () => {
            if (autoChecked || AppState.currentState !== 'active' || Platform.OS !== 'android') return
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                if (AppState.currentState !== 'active') return
                autoChecked = true
                void checkAppUpdates(false)
            }, 6000)
        }
        schedule()
        const subscription = AppState.addEventListener('change', schedule)
        return () => {
            listeners.delete(setValue)
            subscription.remove()
            if (timer) clearTimeout(timer)
        }
    }, [])
    const busy = value.phase === 'checking' || value.phase === 'downloading'
    const close = () => { if (!busy) publish({ phase: 'idle' }) }
    return (
        <Modal visible={value.phase !== 'idle'} transparent animationType="fade" onRequestClose={close}>
            <View style={styles.backdrop}>
                <View style={styles.card}>
                    <Text style={styles.title}>Обновление MusicScore</Text>
                    {value.phase === 'checking' && <Text style={styles.body}>Проверка обновлений…</Text>}
                    {value.phase === 'available' && (
                        <Text style={styles.body}>
                            Доступно обновление: релиз {value.release?.version} ({Math.ceil((value.release?.size || 0) / 1048576)} МБ). Скачать и установить?
                        </Text>
                    )}
                    {value.phase === 'downloading' && (
                        <Text style={styles.body}>
                            {(value.progress ?? 0) >= 100
                                ? 'Проверка APK. При запросе Android разрешите установку из MusicScore.'
                                : `Скачивание: ${Math.max(0, value.progress ?? 0)}%`}
                        </Text>
                    )}
                    {value.phase === 'message' && <Text style={styles.body}>{value.message}</Text>}
                    {busy ? <ActivityIndicator color="#7055ff" /> : (
                        <View style={styles.buttons}>
                            <Pressable accessibilityRole="button" onPress={close} style={styles.button}>
                                <Text style={styles.link}>{value.phase === 'available' ? 'Позже' : 'Закрыть'}</Text>
                            </Pressable>
                            {value.phase === 'available' && (
                                <Pressable accessibilityRole="button" onPress={() => { void install() }} style={styles.button}>
                                    <Text style={styles.link}>Обновить</Text>
                                </Pressable>
                            )}
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 24 },
    card: { padding: 24, borderRadius: 16, backgroundColor: 'white', width: '100%', maxWidth: 480, alignSelf: 'center' },
    title: { fontSize: 21, fontWeight: '600', color: '#210d38', marginBottom: 16 },
    body: { fontSize: 16, color: '#30243c', marginBottom: 20 },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end' },
    button: { padding: 12 },
    link: { color: '#7055ff', fontSize: 16, fontWeight: '600' },
})
