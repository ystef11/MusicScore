import { Linking } from 'react-native'
import { openBrowser } from '@swan-io/react-native-browser'

const origin = 'https://musescore.com'
const destination = '/redirect/mobile'
const loginPage = `${origin}/user/login?destination=${encodeURIComponent(destination)}`
let active: Promise<void> | null = null

function isAuthReturn(value: string): boolean {
    try {
        const url = new URL(value)
        return ['musescore:', 'muse-mu:'].includes(url.protocol)
            && (url.searchParams.get('deep_link_value') === 'auth' || url.hostname === 'auth' || url.pathname === '/auth')
    } catch { return false }
}

/** Browser cookies stay in Chrome. Only the service-issued one-use secret is exchanged. */
export function googleWebAuth(options: {
    beforeOpen: () => Promise<void>
    finish: () => Promise<void>
}): Promise<void> {
    if (active) return active
    active = (async () => {
        await options.beforeOpen()
        await new Promise<void>((resolve, reject) => {
            let finishing = false
            let settled = false
            const cleanup = () => { clearTimeout(timeout); listener.remove() }
            const fail = (error: unknown) => { if (settled) return; settled = true; cleanup(); reject(error) }
            const complete = async () => {
                if (finishing || settled) return
                finishing = true
                try { await options.finish(); if (!settled) { settled = true; cleanup(); resolve() } }
                catch (error) { fail(error) }
            }
            const listener = Linking.addEventListener('url', event => {
                // An app link only signals return; it cannot supply an account or token.
                if (isAuthReturn(event.url)) void complete()
            })
            const timeout = setTimeout(() => fail(new Error('Время входа истекло. Повторите вход через Google.')), 5 * 60 * 1000)
            // onClose also covers returning manually when the site uses deferred handoff.
            // Initiate OAuth on the website inside Chrome so its OAuth state and cookies stay together.
            openBrowser(loginPage, { dismissButtonStyle: 'close', barTintColor: '#351b50', onClose: () => { void complete() } }).catch(fail)
        })
    })().finally(() => { active = null })
    return active
}
