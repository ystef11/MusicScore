class ScorePitchProcessor extends AudioWorkletProcessor {
 constructor() {
  super();
  this.rate = 1;
  this.pitch = 0;
  this.position = 0;
  this.playing = false;
  this.engine = new SoundTouchJS.SoundTouch();
  this.engine.stretch.setParameters(sampleRate, 0, 36, 12);
  this.input = new Float32Array(0);
  this.output = new Float32Array(0);
  this.fadeLength = Math.round(sampleRate * 0.005);
  this.fadeFrame = this.fadeLength;
  this.lastLeft = this.lastRight = 0;
  this.clickFrame = Infinity;
  this.port.onmessage = ({data}) => this.update(data);
 }

 update({pcm, rate, pitch, position, playing, revision, dispose, metronome}) {
  if (dispose) {
   this.disposed = true;
   this.left = this.right = null;
   this.port.close();
   return;
  }
  if (pcm) {
   this.left = pcm[0];
   this.right = pcm[1] || pcm[0];
   return;
  }
  if (metronome) {
   this.metronome = metronome;
   this.resetBeat();
   return;
  }
  const restart = rate !== undefined || pitch !== undefined || position !== undefined;
  this.rate = rate ?? this.rate;
  this.pitch = pitch ?? this.pitch;
  this.position = position === undefined ? this.position : position * sampleRate;
  this.playing = playing ?? this.playing;

  if (restart) {
   this.engine.clear();
   this.engine.tempo = this.rate;
   this.engine.pitchSemitones = this.pitch;
   this.readFrame = Math.round(this.position);
  }
  if (restart || playing !== undefined) {
   this.fadeLeft = this.lastLeft;
   this.fadeRight = this.lastRight;
   this.fadeFrame = 0;
  }
  if (position !== undefined || playing === false) this.resetBeat();
  this.revision = revision;
  this.reportChange = true;
 }

 resetBeat() {
  const beats = this.metronome?.beats;
  let first = 0, last = beats?.length || 0;
  while (first < last) {
   const mid = (first + last) >>> 1;
   if (beats[mid].second * sampleRate < this.position) first = mid + 1;
   else last = mid;
  }
  this.nextBeat = first;
  this.clickFrame = Infinity;
 }

 renderClicks(output, frames) {
  const {beats, volume, loop} = this.metronome;
  const attack = sampleRate * 0.002;
  const length = sampleRate * 0.05;
  for (let i = 0; i < frames; ++i) {
   const position = this.position + i * this.rate;
   while (this.nextBeat < beats.length && beats[this.nextBeat].second * sampleRate <= position) {
    const beat = beats[this.nextBeat++];
    if (loop && (beat.second < loop[0] || beat.second >= loop[1])) continue;
    this.clickFrame = 0;
    this.clickFrequency = beat.accent ? 1600 : 1000;
    this.port.postMessage({click:true});
   }
   const frame = this.clickFrame++;
   if (frame >= length) continue;
   const level = frame < attack ? frame / attack : Math.exp(-140 * (frame - attack) / sampleRate);
   output[i] = Math.sin(2 * Math.PI * this.clickFrequency * frame / sampleRate) * volume * 0.45 * level;
  }
 }

 findTailPeriod() {
  // The overlap search reads ahead. Continue the last matching waveform for
  // that lookahead so that zero padding cannot cut off a sustained final note.
  const end = this.left.length;
  const reference = end - Math.min(Math.round(sampleRate * 0.012), end >> 1);
  const min = Math.min(Math.round(sampleRate * 0.004), reference);
  const max = Math.min(Math.round(sampleRate * 0.045), reference);
  let best = Math.max(1, min);
  let error = Infinity;
  const compare = period => {
   let sum = 0;
   for (let i = reference; i < end; i += 4) {
    const left = this.left[i] - this.left[i - period];
    const right = this.right[i] - this.right[i - period];
    sum += left * left + right * right;
   }
   if (sum < error) {
    best = period;
    error = sum;
   }
  };
  for (let period = best; period <= max; period += 4) compare(period);
  const nearby = best;
  for (let period = Math.max(min, nearby - 3, 1); period <= Math.min(max, nearby + 3); ++period) compare(period);
  return best;
 }

 stretch(frameCount) {
  const engine = this.engine;
  const fifo = engine.outputBuffer;
  // Feed enough for one window, including the first overlap and resampler lookahead.
  while (fifo.frameCount < frameCount) {
   const stretch = engine.stretch;
   const window = stretch.inputChunkSize + (stretch.midBuffer ? 0 : stretch.overlapLength);
   const missing = Math.max(0, window - stretch.inputBuffer.frameCount);
   const inputFrames = Math.ceil(missing * Math.min(1, engine.rate)) + 2;
   if (this.input.length < inputFrames * 2) this.input = new Float32Array(inputFrames * 2);
   const end = this.left.length;
   if (this.readFrame + inputFrames > end) this.tailPeriod ??= this.findTailPeriod();
   for (let i = 0; i < inputFrames; ++i) {
    const frame = this.readFrame + i;
    const index = frame < end ? frame : end - this.tailPeriod + (frame - end) % this.tailPeriod;
    this.input[2 * i] = this.left[index];
    this.input[2 * i + 1] = this.right[index];
   }
   this.readFrame += inputFrames;
   engine.inputBuffer.putSamples(this.input, 0, inputFrames);
   engine.process();
  }
  if (this.output.length < frameCount * 2) this.output = new Float32Array(frameCount * 2);
  fifo.receiveSamples(this.output, frameCount);
 }

 process(_inputs, [channels, clickChannels]) {
  if (this.disposed) return false;
  if (!this.left) return true;
  if (this.reportChange) {
   this.reportChange = false;
   this.port.postMessage({
    revision: this.revision, position: this.position / sampleRate,
    startedAt: this.playing ? currentTime : null,
   });
  }
  if (!this.playing && this.fadeFrame >= this.fadeLength) return true;

  const [left, right] = channels;
  const remaining = Math.max(0, (this.left.length - this.position) / this.rate);
  const frames = this.playing ? Math.min(left.length, Math.ceil(remaining)) : 0;
  if (clickChannels && this.metronome?.beats?.length && this.metronome.volume) {
   this.renderClicks(clickChannels[0], frames);
  }
  const dry = this.rate === 1 && this.pitch === 0;
  if (!dry && frames > 0) this.stretch(frames);
  const start = Math.round(this.position);
  for (let i = 0; i < left.length; ++i) {
   const progress = Math.min(1, this.fadeFrame / this.fadeLength);
   const blend = progress * progress * (3 - 2 * progress);
   const tail = i < frames ? Math.min(1, (remaining - i) / this.fadeLength) : 0;
   const sourceLeft = tail ? (dry ? this.left[start + i] || 0 : this.output[2 * i]) * tail : 0;
   const sourceRight = tail ? (dry ? this.right[start + i] || 0 : this.output[2 * i + 1]) * tail : 0;
   left[i] = this.lastLeft = blend * sourceLeft + (1 - blend) * this.fadeLeft;
   if (right) right[i] = this.lastRight = blend * sourceRight + (1 - blend) * this.fadeRight;
   if (this.fadeFrame < this.fadeLength) ++this.fadeFrame;
  }

  if (!this.playing) return true;
  this.position = Math.min(this.left.length, this.position + frames * this.rate);
  if (this.position === this.left.length) {
   this.playing = false;
   this.port.postMessage({revision:this.revision, position:this.position / sampleRate, ended:true});
  }
  return true;
 }
}

registerProcessor('score-pitch', ScorePitchProcessor);
