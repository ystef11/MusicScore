import * as RNFS from '@dr.pogodin/react-native-fs';
type Command = {method: string; args: any[]};
const listeners = new Map<string, Set<(data: any) => void>>();
let sender: ((command: Command) => void) | null = null;
let queue: Command[] = [];
let lastOpen: Command | null = null;
let opening = 0;
let highQuality = true;
const engines: {send: (command: Command) => void; restore: Command | null}[] = [];
export const emit = (event: string, data?: any) => {
  for (const listener of listeners.get(event) || []) listener(data);
};
const send = (command: Command) => sender ? sender(command) : queue.push(command);
export const attachEngine = (sendCommand: (command: Command) => void) => {
  engines.push({send: sendCommand, restore: lastOpen});
  sender = sendCommand;
  sendCommand({method: 'setSoundQuality', args: [highQuality]});
  const pending = queue; queue = [];
  if (lastOpen && !pending.some(c => c.method === 'open')) sender(lastOpen);
  pending.forEach(c => sender?.(c));
  return () => {
    const index = engines.findIndex(engine => engine.send === sendCommand);
    const removed = index < 0 ? null : engines.splice(index, 1)[0];
    if (sender !== sendCommand) return;
    sender = engines[engines.length - 1]?.send || null;
    if (sender && removed?.restore) { lastOpen = removed.restore; sender(lastOpen); }
  };
};
async function open(method: string, path: string, format: string, params?: any) {
  const token = ++opening;
  try {
    const localPath = path.replace(/^file:\/\//, '');
    const data = await RNFS.readFile(localPath, 'base64');
    if (token !== opening) return;
    const ext = localPath.split('.').pop()?.toLowerCase();
    let input = ext === 'mid' ? 'midi' : ext;
    if (!['webscore','mscz','mscx','mxl','xml','musicxml','midi','kar','gtp','gp3','gp4','gp5','gpx','gp','ptb'].includes(input || '')) {
      // API cache names omit their extension. Choose by the actual file signature.
      const head = data.substring(0, 16);
      input = head.startsWith('UEsD') ? 'mscz' : head.startsWith('TVRoZA') ? 'midi' : format === 'GUITARPRO_ANY' ? 'gp' : 'mscx';
    }
    const manifestUrl = input === 'webscore' ? 'file://' + encodeURI(localPath) : null;
    const command = {method, args: [data, input, params, manifestUrl]};
    if (method === 'open') {
      lastOpen = command;
      queue = queue.filter(c => c.method !== 'open');
    }
    send(command);
  } catch (error) {
    emit('engineError', String(error));
    emit(method === 'open' ? 'mNotationLoaded' : 'mMetaInfoRead', {status: 4, data: null, error: String(error)});
  }
}
export const backend: any = new Proxy({
  getVersion: () => 'webmscore-1.2.1',
  setSoundQuality(enabled: boolean) {
    highQuality = enabled;
    const command = {method: 'setSoundQuality', args: [enabled]};
    engines.forEach(engine => engine.send(command));
  },
  on(event: string, callback: (data: any) => void) {
    const set = listeners.get(event) || new Set(); set.add(callback); listeners.set(event, set);
    return () => {set.delete(callback);};
  },
  open: (path: string, format: string, params: any) => open('open', path, format, params),
  getMeta: (path: string, format: string, params: any) => open('getMeta', path, format, params),
  cancelLoad() { ++opening; lastOpen = null; queue = []; send({method: 'cancelLoad', args: []}); },
  clearScore() { ++opening; lastOpen = null; queue = []; send({method: 'clearScore', args: []}); },
}, {get(target: any, key: string) {return target[key] || ((...args: any[]) => send({method: key, args}));}});

export async function handleEngineMessage(message: string) {
  const {event, data} = JSON.parse(message);
  if (event === 'savePdf') {
    try { await RNFS.writeFile(data.path.replace(/^file:\/\//, ''), data.data, 'base64'); emit('mPdfExported', {path: data.path, success: true}); }
    catch (error) { emit('engineError', String(error)); emit('mPdfExported', {path: data.path, success: false}); }
  } else if (event === 'unsupported') {
    console.warn('webmscore: unsupported control:', data);
    emit('mLogger', 'webmscore: unsupported control: ' + data);
  } else {
    if (event === 'engineError') console.warn('webmscore:', data);
    emit(event, data);
  }
}
