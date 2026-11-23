import { useRef, useState } from 'react'
import { ActivityIndicator, Alert, Modal, NativeModules, Pressable, StyleSheet, Text, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { useActions, useValues } from '@ug/store'
import { useAppSafeArea } from '@mu-native/ds'
import { authStoreChunk } from '../store/authStoreChunk'

// Credentials stay in the official site. Only /api/user/me identifies the web account.
const identify = `(function(){
 if(location.origin!=='https://musescore.com'||window.__musicScoreIdentity)return;
 window.__musicScoreIdentity=true;
 let busy=false;
 const check=async()=>{if(busy)return;busy=true;try{
  const response=await fetch('/api/user/me',{credentials:'same-origin',redirect:'error',headers:{'X-Requested-With':'XMLHttpRequest','Accept':'application/json'}});
  if(!response.ok)return;const envelope=await response.json();
  const user=['ok','success'].includes(envelope.result)?envelope.info:envelope.ok?envelope:null;
  if(Number(user?.id)>0)window.ReactNativeWebView.postMessage(JSON.stringify({kind:'web-favorites-user',id:Number(user.id),name:String(user.name||user.username||''),email:typeof user.email==='string'?user.email:null,avatar:typeof user.avatarUrl==='string'?user.avatarUrl:null}));
 }catch(_){}finally{busy=false}};
 check();setInterval(check,1200);
})();true;`

export function WebFavoritesLogin({ close }: { close: () => void }) {
    const [action] = useValues([authStoreChunk.props.getModalAction])
    const actions = useActions({ setFields: authStoreChunk.actions.setPartialFieldsCustom })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const completed = useRef(false)
    const web = useRef<WebView>(null)
    const insets = useAppSafeArea()
    return <Modal visible animationType="slide" onRequestClose={close}>
        <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}><Text style={styles.title}>Вход</Text><Pressable onPress={close}><Text style={styles.link}>Закрыть</Text></Pressable></View>
            <Text style={styles.hint}>Войдите по email на сайте MuseScore. Сессия сохранится в приложении.</Text>
            {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
            {loading && <ActivityIndicator />}
            <WebView ref={web} source={{ uri: 'https://musescore.com/user/login' }} sharedCookiesEnabled thirdPartyCookiesEnabled domStorageEnabled javaScriptEnabled
                originWhitelist={['https://*']} setSupportMultipleWindows={false}
                onShouldStartLoadWithRequest={request => {
                    if (request.isTopFrame === false) return true
                    try {
                        const url = new URL(request.url)
                        if (url.protocol === 'https:' && url.hostname === 'musescore.com') return true
                        if (url.hostname === 'accounts.google.com') Alert.alert('Вход по email', 'Для этого входа используйте email и пароль MuseScore. Веб-сессия Google из браузера пока не передаётся в приложение.')
                    } catch { /* Reject unknown navigation. */ }
                    return request.url === 'about:blank'
                }}
                injectedJavaScript={identify}
                onLoadStart={() => { setLoading(true); setError('') }} onLoadEnd={() => { setLoading(false); web.current?.injectJavaScript(identify) }}
                onError={event => { setLoading(false); setError(event.nativeEvent.description) }}
                onMessage={event => {
                    if (completed.current) return
                    try {
                        if (new URL(event.nativeEvent.url).origin !== 'https://musescore.com') return
                        const user = JSON.parse(event.nativeEvent.data)
                        if (user.kind !== 'web-favorites-user' || !Number.isSafeInteger(user.id) || user.id <= 0) return
                        completed.current = true
                        NativeModules.WebScoreSource.flushWebAccountCookies()
                        actions.setFields({ webFavoriteUser: { id: user.id, name: user.name, email: user.email, avatar: user.avatar }, isVisible: false, isOpenTourAuthModal: false, modalAction: null, error: null })
                        close()
                        if (action) setTimeout(action, 300)
                    } catch { setError('Не удалось прочитать ответ сайта.') }
                }} />
        </View>
    </Modal>
}
const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: 'white' }, header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, title: { fontSize: 20, color: '#28133d' }, link: { color: '#7355ff', padding: 8 }, hint: { paddingHorizontal: 16, paddingBottom: 8, color: '#665777' }, error: { color: '#b00020', padding: 12 } })
