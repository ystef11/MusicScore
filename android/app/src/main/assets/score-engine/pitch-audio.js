/* PCM playback with tempo and pitch controlled on the audio rendering thread. */
const pitchAudio = (() => {
 let moduleReady;

 function loadModule(context) {
  moduleReady ||= (async () => {
   const scripts = await Promise.all(['soundtouch.js', 'pitch-processor.js'].map(async name => {
    const response = await fetch(new URL(name, location.href));
    if (!response.ok) throw Error('Не удалось загрузить звуковой движок');
    return response.text();
   }));
   const url = URL.createObjectURL(new Blob(scripts, {type:'text/javascript'}));
   try {
    await context.audioWorklet.addModule(url);
   } finally {
    URL.revokeObjectURL(url);
   }
  })().catch(error => {
   moduleReady = null;
   throw error;
  });
  return moduleReady;
 }

 async function create(data) {
  const context = scoreAudio.context();
  let [buffer] = await Promise.all([context.decodeAudioData(data), loadModule(context)]);
  if (buffer.numberOfChannels > 2) {
   const stereo = new OfflineAudioContext(2, buffer.length, buffer.sampleRate);
   const source = stereo.createBufferSource();
   source.buffer = buffer;
   source.connect(stereo.destination);
   source.start();
   buffer = await stereo.startRendering();
  }
  const duration = buffer.duration;
  const pcm = Array.from({length: buffer.numberOfChannels}, (_, i) => buffer.getChannelData(i));
  const node = new AudioWorkletNode(context, 'score-pitch', {
   numberOfInputs: 0, numberOfOutputs: 2, outputChannelCount: [pcm.length, 1],
  });
  const gain = context.createGain();
  node.connect(gain).connect(context.destination);
  node.connect(context.destination, 1);
  node.port.postMessage({pcm}, pcm.map(channel => channel.buffer));

  let paused = true, disposed = false, position = 0, rate = 1, pitch = 0;
  let startedAt = null, revision = 0;
  function update(changes) {
   startedAt = null;
   node.port.postMessage({...changes, revision: ++revision});
  }

  const player = {
   duration, onended:null, onerror:null, onmetronomeclick:null,
   get paused() { return paused; },
   get seeking() { return !paused && startedAt === null; },
   get currentTime() {
    const elapsed = paused || startedAt === null ? 0 : Math.max(0, context.currentTime - startedAt);
    return Math.min(duration, position + elapsed * rate);
   },
   set currentTime(value) {
    position = Math.max(0, Math.min(duration, Number(value) || 0));
    update({position});
   },
   get playbackRate() { return rate; },
   set playbackRate(value) {
    if (rate === value) return;
    position = this.currentTime;
    rate = value;
    update({rate});
   },
   set pitchSemitones(value) {
    if (pitch === value) return;
    position = this.currentTime;
    pitch = value;
    update({pitch});
   },
   set volume(value) { gain.gain.value = value; },
   setMetronome(beats, volume, loop) {
    node.port.postMessage({metronome:{beats, volume, loop}});
   },
   play() {
    if (disposed || !paused) return false;
    if (position >= duration) this.currentTime = 0;
    paused = false;
    update({playing:true});
    return true;
   },
   pause() {
    if (disposed || paused) return;
    position = this.currentTime;
    paused = true;
    update({playing:false});
   },
   dispose() {
    if (disposed) return;
    disposed = true;
    node.port.postMessage({dispose:true});
    node.port.onmessage = null;
    node.disconnect();
    gain.disconnect();
   },
  };

  node.port.onmessage = ({data}) => {
   if (data.click) {
    if (!paused && !disposed) player.onmetronomeclick?.();
    return;
   }
   if (data.revision !== revision || disposed) return;
   position = data.position;
   startedAt = data.startedAt ?? null;
   if (data.ended) {
    paused = true;
    player.onended?.();
   }
  };
  node.onprocessorerror = () => {
   if (disposed) return;
   position = player.currentTime;
   paused = true;
   startedAt = null;
   player.onerror?.();
  };
  return player;
 }

 return {create};
})();
