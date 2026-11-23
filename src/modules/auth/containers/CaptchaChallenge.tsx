import { useMemo, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useActions, useValues } from '@ug/store'
import { authStoreChunk } from '../store/authStoreChunk'
import { authThunks } from '../store/authThunks'

/** Complete the server-required challenge; credentials remain in the native form. */
export function CaptchaChallenge() {
    const [captcha] = useValues([authStoreChunk.props.getRecaptcha])
    const [error, setError] = useState('')
    const actions = useActions({
        verify: authThunks.verifyRecaptcha,
        setShown: authStoreChunk.actions.setIsRecaptchaShown,
        setParams: authStoreChunk.actions.setRecaptchaActionParams,
    })
    const source = useMemo(() => {
        let baseUrl = 'https://musescore.com/'
        try {
            const parsed = new URL(captcha.domain.startsWith('https://') ? captcha.domain : `https://${captcha.domain}`)
            if (parsed.protocol === 'https:' && (parsed.hostname === 'musescore.com' || parsed.hostname.endsWith('.musescore.com'))) baseUrl = parsed.origin + '/'
        } catch { /* Server omitted domain: use the service origin. */ }
        const key = JSON.stringify(captcha.publicKey).replace(/</g, '\\u003c')
        return { baseUrl, html: `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:12px;font:16px sans-serif}#captcha{margin-top:16px}</style></head><body><div id="captcha"></div><script>
function send(data){window.ReactNativeWebView.postMessage(JSON.stringify(data))}
function ready(){grecaptcha.render('captcha',{sitekey:${key},callback:token=>send({token}),'expired-callback':()=>send({error:'Проверка истекла. Повторите её.'}),'error-callback':()=>send({error:'Не удалось загрузить проверку. Проверьте соединение.'})})}
</script><script src="https://www.google.com/recaptcha/api.js?onload=ready&render=explicit" async defer></script></body></html>` }
    }, [captcha.domain, captcha.publicKey])
    const cancel = () => { actions.setShown(false); actions.setParams(null) }
    return <View style={{ height: 540, maxHeight: '85%', minHeight: 300, width: '100%', padding: 12 }}>
        <Text style={{ fontSize: 20, color: '#28133d' }}>Подтвердите вход</Text>
        {!!error && <Text accessibilityRole="alert" style={{ color: '#b00020' }}>{error}</Text>}
        <WebView source={source} originWhitelist={['https://*', 'about:blank']} javaScriptEnabled sharedCookiesEnabled thirdPartyCookiesEnabled
            onMessage={event => {
                try {
                    const data = JSON.parse(event.nativeEvent.data)
                    if (typeof data.token === 'string' && data.token) actions.verify({ token: data.token })
                    else if (typeof data.error === 'string') setError(data.error)
                } catch { setError('Не удалось прочитать результат проверки.') }
            }} onError={() => setError('Не удалось загрузить проверку.')} />
        <Pressable accessibilityRole="button" onPress={cancel} style={{ padding: 16 }}><Text>Отмена</Text></Pressable>
    </View>
}
