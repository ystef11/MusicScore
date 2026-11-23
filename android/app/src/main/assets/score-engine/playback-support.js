/* Playback clock, synchronization maps and synthesized metronome. */
const playback = (() => {
 let context, metronome=false, clickVolume=0.6, countdown=false, countBars=1, mode=0;
 let nodes=new Set(), countToken=0, cancelWait=null, metronomeSettings=null;
 let mapSource=null, mapMetadata=null, mapDuration=null, beatMap=[];
 let rhythm=[], rhythmPending=null, rhythmToken=0;
 const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
 function ctx(){return context ||= scoreAudio.context()}
 function clearClicks(){for(const node of nodes){try{node.stop()}catch(_){}}nodes.clear()}
 function cancel(){++countToken;if(cancelWait){cancelWait();cancelWait=null}clearClicks();emit('mCountdownTick',0)}
 function info(){emit('mMetronomeInfoUpdated',{enabled:metronome,volume:clickVolume,mode})}
 function click(accent,when){
  const c=ctx(), start=Math.max(c.currentTime,when), oscillator=c.createOscillator(), gain=c.createGain();
  oscillator.frequency.value=accent?1600:1000;oscillator.type='sine';
  gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(clickVolume*0.45,start+0.002);gain.gain.exponentialRampToValueAtTime(0.0001,start+0.045);
  oscillator.connect(gain);gain.connect(c.destination);nodes.add(oscillator);
  oscillator.onended=()=>{nodes.delete(oscillator);oscillator.disconnect();gain.disconnect()};
  oscillator.start(start);oscillator.stop(start+0.05);
 }
 function bpm(){return Number(metadata?.bpm||metadata?.tempo)||0}
 function scoreMeter(){
  const value=metadata?.timeSignature||metadata?.timesig;
  const sig=Array.isArray(value)?value:String(value||'').match(/(\d+)\s*\/\s*(\d+)/)?.slice(1);
  return Number(sig?.[0])>0&&Number(sig?.[1])>0?midiRhythm.meter(Number(sig[0]),Number(sig[1])):null;
 }
 function prepareRhythm(source,encoded){
  const token=++rhythmToken;rhythm=[];mapSource=undefined;clearClicks();
  if(!source&&!encoded){rhythmPending=null;return Promise.resolve()}
  rhythmPending=(async()=>{
   let buffer;
   if(encoded){
    buffer=Uint8Array.from(atob(encoded),value=>value.charCodeAt(0)).buffer;
   }else{
    const response=await fetch(source);
    if(!response.ok&&response.status!==0)throw Error('Не получена карта MIDI');
    buffer=await response.arrayBuffer();
   }
   const map=midiRhythm.parse(buffer);
   if(token===rhythmToken){
    rhythm=map;mapSource=undefined;clearClicks();
    updateMeterStatus();
    tick();
   }
  })().catch(error=>console.warn('MIDI rhythm:',error));
  return rhythmPending;
 }
 function alignMidi(measures=[],recording){
  if(!rhythm.length)return [];
  if(!measures.length)return recording?[]:rhythm;
  const downbeats=rhythm.filter(beat=>beat.accent);
  const offset=measures[0].position/1000-downbeats[0].second;
  let index=0;
  const matches=downbeats.map(beat=>{
   const expected=beat.second+offset;
   const distance=i=>Math.abs(measures[i].position/1000-expected);
   while(index+1<measures.length&&distance(index+1)<distance(index))index++;
   if(index<measures.length&&distance(index)<=Math.min(0.18,Math.max(0.04,beat.interval/3)))return index++;
   return -1;
  });
  const matched=matches.filter(index=>index>=0).length;
  if(recording){
   // A separate recording can change the duration of every bar. Pair its measures by score ID.
   if(matched!==downbeats.length||recording.length!==measures.length||
      measures.some((measure,i)=>measure.elid!==recording[i].elid))return [];
  }else if(matched<=downbeats.length/2){
   return [];
  }
  const anchors=recording||measures;
  const starts=downbeats.map((beat,i)=>anchors[matches[i]]?.position/1000);
  let bar=-1, shift=offset, scale=1;
  return rhythm.map(beat=>{
   if(beat.accent){
    bar++;
    const expectedLength=downbeats[bar+1]?.second-beat.second;
    const actualLength=starts[bar+1]-starts[bar];
    if(Number.isFinite(starts[bar]))shift=starts[bar]-beat.second;
    if(actualLength>0&&expectedLength>0)scale=actualLength/expectedLength;
    else if(!recording)scale=1;
   }
   const start=downbeats[bar].second;
   const second=start+shift+(beat.second-start)*scale;
   return {...beat,second,interval:beat.interval*scale,quarter:beat.quarter*scale};
  });
 }
 function timeline(){
  if(mapSource===positions&&mapMetadata===metadata&&mapDuration===metadata?.duration)return beatMap;
  mapSource=positions;mapMetadata=metadata;mapDuration=metadata?.duration;
  if(positions?.recordingMissing)return beatMap=[];
  const events=(positions?.events||[]).filter((event,i,all)=>event.position!==all[i+1]?.position);
  const measureCount=Number(metadata?.measures);
  const segmentMap=positions?.coordinateSystem==='musescore-web'&&measureCount>0&&positions.elements.length>measureCount;
  const measures=segmentMap?[]:events.filter(event=>event.elid!==null);
  const written=positions?.scoreEvents?.filter(event=>event.elid!==null);
  beatMap=positions?.recording?(segmentMap?[]:alignMidi(written,measures)):alignMidi(measures);
  if(beatMap.length)return beatMap;
  const firstMidiBeat=rhythm[0];
  const steadyMeter=firstMidiBeat&&rhythm.every(beat=>beat.beats===firstMidiBeat.beats&&beat.step===firstMidiBeat.step)
   ?firstMidiBeat:null;
  const meter=scoreMeter()||steadyMeter;
  if(!meter||segmentMap)return beatMap;
  const quarter=steadyMeter?.quarter||(bpm()>0?60/bpm():0);
  const pulse=quarter*meter.step;
  let previousInterval=pulse;
  for(let i=0;i<events.length;i++){
   if(events[i].elid===null)continue;
   const start=events[i].position/1000;
   const next=events[i+1]?.position/1000;
   const end=Number.isFinite(next)?next:Math.min(Number(metadata?.duration)||Infinity,start+meter.beats*previousInterval);
   if(!(end>start))continue;
   const pickup=i===0&&Number.isFinite(next)&&pulse>0&&end-start<(meter.beats-0.5)*pulse;
   if(pickup){
    for(let beat=1;beat<=meter.beats;beat++){
     const second=end-(meter.beats-beat+1)*pulse;
     if(second>=start-0.001)beatMap.push({second:Math.max(second,start),accent:false,interval:pulse,quarter:pulse/meter.step,beats:meter.beats});
    }
    continue;
   }
   const interval=Number.isFinite(next)?(end-start)/meter.beats:previousInterval;
   previousInterval=interval;
   for(let beat=0;beat<meter.beats&&start+beat*interval<end-0.001;beat++)
    beatMap.push({second:start+beat*interval,accent:beat===0,interval,quarter:interval/meter.step,beats:meter.beats});
  }
  return beatMap;
 }
 function localBeat(){
  const map=timeline(), second=currentSecond();
  let beat=map[0];
  for(const current of map){if(current.second>second+0.001)break;beat=current}
  const meter=scoreMeter();
  const nextBar=map.find((value,i)=>i>0&&value.accent);
  if(beat===map[0]&&meter&&beat?.beats<meter.beats&&nextBar?.beats===meter.beats)
   return {interval:beat.quarter*meter.step,beats:meter.beats};
  return beat;
 }
 function updateMeterStatus(){
  const status=document.getElementById('metronome-status');
  status.hidden=!(metronome||countdown)||!metadata||timeline().length>0;
 }
 async function beforePlay(){
  const token=++countToken;
  await ctx().resume();
  if((metronome||countdown)&&rhythmPending)await rhythmPending;
  if(token!==countToken)return false;
  clearClicks();
  updateMeterStatus();
  tick();
  if(!countdown)return true;
  const local=localBeat();
  if(!(local?.interval>0&&Number.isFinite(local.interval)))return true;
  const interval=local.interval/audio.playbackRate, beats=Math.max(1,Math.round(local.beats*countBars)), start=ctx().currentTime+0.03;
  emit('mPlaybackStatusChanged',0);
  // Schedule sounds on the audio clock; UI timers must not accumulate beat drift.
  for(let i=0;i<beats;i++)click(i%local.beats===0,start+i*interval);
  for(let i=0;i<beats;i++){
   if(token!==countToken)return false;
   emit('mCountdownTick',beats-i);
   await new Promise(resolve=>{const timer=setTimeout(()=>{cancelWait=null;resolve()},Math.max(0,(start+(i+1)*interval-ctx().currentTime)*1000));cancelWait=()=>{clearTimeout(timer);resolve()}});
  }
  emit('mCountdownTick',0);return token===countToken;
 }
 function tick(){
  if(!audio){metronomeSettings=null;return}
  const beats=metronome?timeline():null, region=loopEnabled?loop:null;
  if(metronomeSettings?.player===audio&&metronomeSettings.beats===beats&&
     metronomeSettings.volume===clickVolume&&metronomeSettings.region===region)return;
  audio.setMetronome(beats,clickVolume,region);
  metronomeSettings={player:audio,beats,volume:clickVolume,region};
 }
 function normalize(responses,dimensions,customAudio){
  let elements=[],events=[],mediaEvents=null;
  const seen=new WeakSet();
  function visit(value,depth=0){
   if(!value||typeof value!=='object'||depth>12||seen.has(value))return;seen.add(value);
   if(Array.isArray(value.elements))elements=value.elements;
   if(Array.isArray(value.events))events=value.events;
   if(Array.isArray(value.space))elements=value.space;
   if(Array.isArray(value.time))events=value.time;
   if(Array.isArray(value)&&value[0]?.x!==undefined&&value[0]?.y!==undefined&&value[0]?.id!==undefined)elements=value;
   for(const child of Object.values(value))visit(child,depth+1);
  }
  for(const text of responses||[]){
   try{
    const json=typeof text==='string'?text.replace(/^\s*jsonp\d+\(\s*([\s\S]*)\)\s*;?\s*$/,'$1'):text;
    const data=typeof json==='string'?JSON.parse(json):json;
    // Standalone times belong to the recording and are in seconds. Space/time maps use milliseconds.
    if(Array.isArray(data)&&data[0]?.elid!==undefined&&data[0]?.position!==undefined)mediaEvents=data;
    else visit(data);
    continue;
   }catch(_){}
   if(typeof text!=='string'||!text.trim().startsWith('<'))continue;
   const xml=new DOMParser().parseFromString(text,'application/xml');
   const attrs=node=>Object.fromEntries(Array.from(node.attributes).map(a=>[a.name,Number.isFinite(Number(a.value))?Number(a.value):a.value]));
   const els=Array.from(xml.querySelectorAll('elements > element')).map(attrs);
   const evs=Array.from(xml.querySelectorAll('events > event')).map(attrs);
   if(els.length)elements=els;if(evs.length)events=evs;
  }
  elements=elements.filter(e=>[e.x,e.y,e.sy,e.page].every(v=>Number.isFinite(Number(v)))).map(e=>({...e,id:String(e.id),x:Number(e.x),y:Number(e.y),sx:Number(e.sx)||0,sy:Number(e.sy),page:Number(e.page)}));
  const ids=new Set(elements.map(e=>e.id));
  const validEvents=(items,scale)=>items.filter(e=>(e.elid===null||ids.has(String(e.elid)))&&Number.isFinite(Number(e.position)))
   .map(e=>({...e,elid:e.elid===null?null:String(e.elid),position:Number(e.position)*scale})).sort((a,b)=>a.position-b.position);
  const scoreEvents=validEvents(events,1);
  const recordingEvents=mediaEvents?validEvents(mediaEvents,1000):[];
  const recording=customAudio!==false&&recordingEvents.some(event=>event.elid!==null);
  const recordingMissing=customAudio===true&&!recording;
  const timeEvents=recording?recordingEvents:scoreEvents;
  if(!timeEvents.length&&!recordingMissing)return null;
  return {elements,events:timeEvents,scoreEvents,recording,recordingMissing,pageSize:webScoreCoordinates.pageSize(dimensions),coordinateSystem:'musescore-web'};
 }
 setInterval(tick,20);
 return {cancel,tick,normalize,beforePlay,prepareRhythm,updateMeterStatus,resetClock:clearClicks,
  commands:{
   setMetronomeEnabledFile(value){metronome=!!value;clearClicks();tick();updateMeterStatus();info()},
   setMetronomeEnabledBinary(value){this.setMetronomeEnabledFile(value)},
   setMetronomeVolume(value){clickVolume=clamp(value);tick();info()},
   setMetronomeMode(value){mode=value;info()},
   setCountdownEnabled(value){countdown=!!value;if(!countdown)cancel();updateMeterStatus()},
   setCountdownFactor(value){countBars=Math.max(1,Math.min(8,Number(value)||1))},
  }};
})();
