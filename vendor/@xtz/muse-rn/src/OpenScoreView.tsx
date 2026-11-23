import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, Text, View, type ViewProps} from 'react-native';
import {WebView} from 'react-native-webview';
import {attachEngine, backend, handleEngineMessage} from './OpenScoreBackend';

type ScoreNotice = {token: number; text: string; canRetry: boolean; canAutoRetry: boolean; failedPages: number[]};
type ScoreRetry = {token: number; pending: boolean; error?: string};

export type XTZViewProps = ViewProps & {
  noteHintsEnabled?: boolean;
  onRetryWebPages?: (failedPages: number[], interactive: boolean) => Promise<unknown>;
  [key: string]: any;
};
export default function XtzView(props: XTZViewProps) {
  const ref = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<ScoreNotice | null>(null);
  const [retry, setRetry] = useState<ScoreRetry | null>(null);
  const attemptedRetry = useRef<number | null>(null);
  const {onRetryWebPages} = props;
  useEffect(() => backend.on('engineError', (message: string) => setError(message)), []);
  useEffect(() => {
    if (!ready) return;
    return attachEngine(command => {
      ref.current?.injectJavaScript('window.runCommand(' + JSON.stringify(command) + ');true;');
    });
  }, [ready]);
  useEffect(() => {
    if (!ready || props.noteHintsEnabled === undefined) return;
    ref.current?.injectJavaScript(
      'window.runCommand({method:"setNoteHints",args:[' + props.noteHintsEnabled + ']});true;',
    );
  }, [ready, props.noteHintsEnabled]);

  const retryState = retry?.token === notice?.token ? retry : null;
  const retryPages = useCallback(async (interactive: boolean) => {
    if (!notice?.canRetry || !onRetryWebPages || retryState?.pending) return;
    const {token, failedPages} = notice;
    if (!interactive && (!notice.canAutoRetry || attemptedRetry.current === token)) return;
    attemptedRetry.current = token;
    setRetry({token, pending: true});
    try {
      await onRetryWebPages(failedPages, interactive);
      const command = {method: 'refreshWebScoreManifest', args: [token]};
      ref.current?.injectJavaScript('window.runCommand(' + JSON.stringify(command) + ');true;');
      setRetry({token, pending: false});
    } catch (error) {
      setRetry({token, pending: false, error: error instanceof Error ? error.message : String(error)});
    }
  }, [notice, onRetryWebPages, retryState?.pending]);
  useEffect(() => { void retryPages(false); }, [retryPages]);
  return <View style={props.style}>
    <WebView ref={ref} style={{flex: 1}} source={{uri: 'file:///android_asset/score-engine/index.html'}}
      originWhitelist={['file://*']} allowFileAccess allowFileAccessFromFileURLs allowUniversalAccessFromFileURLs
      scalesPageToFit={false} setBuiltInZoomControls={false}
      javaScriptEnabled mediaPlaybackRequiresUserAction={false} setSupportMultipleWindows={false}
      onShouldStartLoadWithRequest={request => request.url.startsWith('file:///android_asset/score-engine/') || request.url === 'about:blank'}
      onError={event => setError(event.nativeEvent.description)}
      onContentProcessDidTerminate={() => {setReady(false); setError('Процесс нотного движка завершён');}}
      onMessage={event => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.event === 'ready') {setError(''); setReady(true);}
        else if (message.event === 'webScoreNotice') setNotice(message.data);
        else if (message.event === 'cursorInteraction') props.onCursorInteraction?.();
        else if (message.event === 'singleTap') props.onSingleTap?.({nativeEvent: message.data});
        else handleEngineMessage(event.nativeEvent.data).catch(e => setError(String(e)));
      }} />
    {(!!notice?.text || !!retryState?.error) &&
      <Text accessibilityLiveRegion="polite" style={{padding: 8, color: '#555'}}>{retryState?.error || notice?.text}</Text>}
    {!!notice?.canRetry && !!onRetryWebPages &&
      <Pressable accessibilityRole="button" accessibilityState={{disabled: !!retryState?.pending}}
        disabled={retryState?.pending} onPress={() => retryPages(true)} style={{paddingHorizontal: 8, paddingVertical: 10}}>
        <Text style={{color: '#075e58'}}>{retryState?.pending ? 'Загрузка страниц…' : 'Дозагрузить страницы'}</Text>
      </Pressable>}
    {!!error && <Text accessibilityRole="alert" style={{padding: 8, color: '#b00020'}}>{error}</Text>}
  </View>;
}
