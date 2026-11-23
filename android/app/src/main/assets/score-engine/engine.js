/* MusicScore adapter for LibreScore/webmscore (GPL). No APK code is loaded. */
let score=null, metadata=null, positions=null, audio=null, generation=0;
let speed=1, volume=1, muted=false, loop=null, loopEnabled=false, page=0, pendingPosition=0;
let audioGeneration=0, transpose=0, audioPreparation=null;
let audioRenderGeneration=0, pendingPlayGeneration=null, highQuality=true;
let localScoreSource=null;
let webViewScore=null, webLoad=null, baseNoteSize=5, noteSize=5, engineReady=null;
function ensureWebMscore(){
 if(!engineReady)engineReady=new Promise((resolve,reject)=>{
  const script=document.createElement('script');script.src='webmscore.js';
  script.onload=()=>WebMscore.ready.then(resolve,reject);script.onerror=()=>reject(Error('Не удалось загрузить нотный движок'));
  document.head.append(script);
 });
 return engineReady;
}
let partVolumes={}, playableParts=null;
const errorBox=document.getElementById('error'), pages=document.getElementById('pages');
const bytes=b64=>Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
const base64=data=>{let s='';for(let i=0;i<data.length;i+=8192)s+=String.fromCharCode(...data.subarray(i,i+8192));return btoa(s)};
const showError=error=>{errorBox.textContent='Не удалось обработать партитуру: '+error;emit('engineError',String(error))};
function stopAudio(reset=false){playback.cancel();audio?.pause();audioGeneration++;if(reset){pendingPosition=0;if(audio)audio.currentTime=0;updatePosition()}emit('mPlaybackStatusChanged',reset?2:1)}
function releaseRenderedAudio(){
 audioRenderGeneration++;
 audio?.dispose();
 audio=null;
 audioPreparation=null;
}
function disposeAudio(){
 playback.prepareRhythm(null);
 keyboardAudio.reset();
 stopAudio(true);
 releaseRenderedAudio();
 localScoreSource=null;
}
function currentSecond(){return audio?.currentTime??pendingPosition}
function setSecond(second){playback.resetClock();pendingPosition=Math.max(0,Number(second)||0);if(audio)audio.currentTime=pendingPosition;updatePosition()}
function updatePosition(){
 const second=currentSecond();let event=positions?.events?.[0];
 for(const e of positions?.events||[]){if(e.position>second*1000)break;event=e}
 const eventIndex=positions?.coordinateSystem==='musescore-web'?webScoreCoordinates.eventIndex(positions.events,second):(positions?.events?.indexOf(event)??-1);
 event=positions?.events?.[eventIndex];
 const el=positions?.elements?.find(e=>e.id===event?.elid);
 const measure=positions?.elements?.findIndex(e=>e.id===event?.elid)??0;
 emit('mPlaybackPositionChanged',{second,playbackSecond:second,percent:metadata?.duration?second/metadata.duration:0,measure:Math.max(0,measure),measureIndex:Math.max(0,measure),pageIndex:el?.page||0,eventIndex:Math.max(0,positions?.events?.indexOf(event)??0),playbackPositionX:el?.x||0});
 scoreCursor.draw(eventIndex,second,!!audio&&!audio.paused);loopSelection.render();
 if(loopEnabled&&loop&&second>=loop[1])setSecond(loop[0]);
}
setInterval(()=>{if(audio&&!audio.paused){updatePosition()}},25);
function meta(m){return {...m,name:m.title,totalPages:m.pages,totalMeasures:m.measures,totalSeconds:m.duration,duration:m.duration,key:m.keysig,minNoteSize:0.5,maxNoteSize:30,partsCount:m.parts.length,parts:m.parts.map((p,id)=>({...p,id,partName:p.name,volume:1,isVisible:true,isPlayable:true,instrument:p.instrumentName}))}}
function seconds(value){if(typeof value==='number')return value;return String(value||'0').split(':').reduce((n,x)=>n*60+Number(x),0)}
function initializeLayout(params){
 scoreLayout.reset(params?.scrollMode ?? 1);
 baseNoteSize=Number(params?.defaultNoteSize)||5;
 noteSize=clampNoteSize(params?.noteSize);
 scoreLayout.setZoom(noteSize/baseNoteSize);
 page=0;
 pendingPosition=0;
 window.scrollTo(0,0);
}
function clampNoteSize(value){
 return Math.max(0.5,Math.min(30,Number(value)||baseNoteSize));
}
function publishLoaded(request,params){
 scoreLayout.capture();
 updatePosition();
 playback.updateMeterStatus();
 if(request!=='getMeta'&&params?.noteSize!=null)emit('mNoteSizeSet',noteSize);
 const scoreMeta=meta(metadata);
 // For local scores WebMscore reports quarter notes per second.
 if(!webViewScore&&!scoreMeta.bpm&&Number.isFinite(scoreMeta.tempo)&&scoreMeta.tempo>0)scoreMeta.bpm=scoreMeta.tempo*60;
 emit(request==='getMeta'?'mMetaInfoRead':'mNotationLoaded',{status:0,data:scoreMeta});
 emit('mPageSetChanged',{current:0,total:metadata.pages});
 emit('mLayoutDidHappen');
 emit('mPlaybackStatusChanged',2);
}
function setVisiblePage(next){
 if(!Number.isFinite(next)||next===page||!metadata)return;
 page=next;
 emit('mPageSetChanged',{current:page,total:metadata.pages});
}
function resetWebLoad(){
 webLoad?.resolveAudio(null);
 webLoad=null;
 webViewScore=null;
 emit('webScoreNotice',null);
}

async function loadWebView(data,params,manifestUrl,request){
 const token=++generation;transpose=0;disposeAudio();resetWebLoad();score?.destroy();score=null;metadata=null;positions=null;loopSelection.reset();scoreCursor.reset();noteAnchors.reset();pages.replaceChildren();initializeLayout(params);errorBox.textContent='';emit('mLoadingStarted');
 const view=JSON.parse(new TextDecoder().decode(bytes(data)));
 if(!view.pages?.[0])throw Error('Не получена первая страница нот');

 const images=[], imageUrls=[], failed=new Set();
 const paper=webScoreCoordinates.pageSize(view.metadata?.dimensions);
 let resolveAudio;
 const audioReady=new Promise(resolve=>{resolveAudio=resolve});
 const load={token,audioReady,resolveAudio,waitingForAudio:false};
 webLoad=load;
 let firstLoaded, firstFailed;
 const firstPage=new Promise((resolve,reject)=>{firstLoaded=resolve;firstFailed=reject});
 const timeout=setTimeout(()=>firstFailed(Error('Не удалось показать первую страницу нот')),30000);
 let rendered=false, geometryReady=false, timing, previousNotice, geometryVersion=0;

 for(let i=0;i<view.pages.length;i++){
  const section=document.createElement('section'), image=document.createElement('img');
  section.dataset.page=i;
  image.draggable=false;
  if(i>0)image.loading='lazy';
  if(paper)image.style.aspectRatio=paper.width+' / '+paper.height;
  section.append(image);
  pages.append(section);
  images.push(image);
  image.onload=()=>{
   if(token!==generation)return;
   if(i===0){
    if(!paper&&image.naturalWidth&&image.naturalHeight){
     const ratio=image.naturalWidth+' / '+image.naturalHeight;
     for(const item of images)item.style.aspectRatio=ratio;
    }
    firstLoaded();
   }
   if(failed.delete(i))updateNotice();
  };
  image.onerror=()=>{
   if(token!==generation)return;
   if(i===0)firstFailed(Error('Не удалось показать первую страницу нот'));
   failed.add(i);
   updateNotice();
  };
 }

 function updateNotice(){
  if(!rendered||token!==generation)return;
  let count=0;
  for(const [index,image] of images.entries()){
   const missing=!imageUrls[index]||failed.has(index);
   if(!missing)count++;
   const state=missing?(view.pagesDone!==false||failed.has(index)?'missing':'pending'):'ready';
   if(image.parentElement&&image.parentElement.dataset.state!==state)image.parentElement.dataset.state=state;
  }
  const messages=[];
  if(view.pagesDone!==false&&count<images.length)messages.push('Доступно страниц: '+count+' из '+images.length+'.');
  if(!view.audioUrl&&view.finished!==false)messages.push('Аудио недоступно.');
  else if(!view.audioUrl&&load.waitingForAudio)messages.push('Аудио загружается…');
  const canRetry=view.finished!==false&&count<images.length;
  const notice={token,text:messages.join(' '),canRetry,canAutoRetry:canRetry&&view.canAutoRetry===true,failedPages:[...failed]};
  const snapshot=JSON.stringify(notice);
  if(previousNotice!==snapshot){
   previousNotice=snapshot;
   emit('webScoreNotice',notice);
  }
 }
 load.updateNotice=updateNotice;

 function applyManifest(next){
  Object.assign(view,next);
  for (const [index,image] of images.entries()){
   const url=view.pages[index];
   if(!url||imageUrls[index]===url)continue;
   failed.delete(index);
   imageUrls[index]=url;
   image.src=url;
   geometryReady=false;
   geometryVersion++;
   noteHints.updatePage(index);
  }
  if(view.audioUrl||view.finished!==false)resolveAudio(view.audioUrl||null);
  if(!rendered)return;

  const sync=JSON.stringify([view.syncResponses,view.midiUrl,view.midiData]);
  if(sync!==timing){
   timing=sync;
   positions=playback.normalize(view.syncResponses,view.metadata?.dimensions,view.customAudio);
   playback.prepareRhythm(view.midiUrl,view.midiData);
   geometryReady=false;
  }
  if(view.pagesDone!==false&&!geometryReady){
   geometryReady=true;
   if(positions?.pageSize)scoreLayout.refreshSingleLine();
   const version=++geometryVersion;
   const isCurrent=value=>value===generation&&version===geometryVersion;
   noteAnchors.prepare(imageUrls,positions,token,isCurrent,view.importedFromArchive===true).then(bounds=>{
    if(!isCurrent(token))return;
    scoreLayout.updateBounds(bounds);
    updatePosition();
    loopSelection.sync();
   }).catch(error=>console.warn(error));
  }
  updatePosition();
  loopSelection.sync();
  updateNotice();
 }

 let polling=false,pollTimer;
 async function pollManifest(force=false){
  if(token!==generation||!manifestUrl||polling||(!force&&view.finished!==false))return;
  clearTimeout(pollTimer);
  polling=true;
  try {
   const response=await fetch(manifestUrl+'?time='+Date.now());
   const next=await response.json();
   if(token!==generation)return;
   if(force||next.updatedAt!==view.updatedAt||next.finished!==view.finished||next.pagesDone!==view.pagesDone)applyManifest(next);
  } catch(error) {
   if(token!==generation)return;
   console.warn('Не удалось обновить страницы нот:',error);
  } finally {polling=false;}
  if(view.finished===false&&Date.now()-Number(view.updatedAt)>185000)applyManifest({pagesDone:true,finished:true,canAutoRetry:false});
  if(view.finished===false)pollTimer=setTimeout(pollManifest,500);
 }
 load.refreshManifest=()=>pollManifest(true);

 applyManifest(view);
 try{await firstPage}
 catch(error){if(token===generation)throw error;return}
 finally{clearTimeout(timeout)}
 if(token!==generation)return;
 webViewScore=view;
 partVolumes={};playableParts=null;
 metadata={...view.metadata,title:view.title,pages:images.length,duration:seconds(view.metadata?.duration),parts:(view.metadata?.parts?.length===1?view.metadata.parts:[{name:'Все инструменты',instrumentName:'Audio mix'}])};
 speed=initialSpeed(params);
 playback.commands.setMetronomeVolume(params?.metronomeVolume??0.6);
 publishLoaded(request,params);
 rendered=true;
 applyManifest(view);
 if(manifestUrl)pollManifest();
}
async function loadScore(data,format,params,manifestUrl,request){
 if(format==='webscore')return loadWebView(data,params,manifestUrl,request);
 resetWebLoad();
 const token=++generation;transpose=0;disposeAudio();score?.destroy();score=null;positions=null;loopSelection.reset();scoreCursor.reset();noteAnchors.reset();pages.replaceChildren();initializeLayout(params);errorBox.textContent='';
 emit('mLoadingStarted');await ensureWebMscore();
 const loaded=await WebMscore.load(format,bytes(data));
 if(token!==generation){loaded.destroy();return}
 score=loaded;
 localScoreSource={data,format};
 metadata=await score.metadata();positions=await score.measurePositions();
 try{
  const midi=await score.saveMidi();if(token!==generation)return;
  const midiUrl=URL.createObjectURL(new Blob([midi],{type:"audio/midi"}));
  try{await playback.prepareRhythm(midiUrl)}finally{URL.revokeObjectURL(midiUrl)}
 }catch(error){console.warn('MIDI rhythm export:',error)}
 if(token!==generation)return;
 for(let p=0;p<metadata.pages;p++){
  const node=document.createElement('section');node.dataset.page=p;node.innerHTML=await score.saveSvg(p,true);
  if(token!==generation)return;
  scoreLayout.prepareSvg(node.querySelector('svg'));
  pages.append(node);
 }
 speed=initialSpeed(params);partVolumes={};playableParts=null;
 publishLoaded(request,params);
}
function applyVolume(){
 const part=partVolumes[0]??1;const enabled=playableParts===null||playableParts.includes(0);
 if(audio)audio.volume=muted||!enabled?0:volume*part;
}
async function prepareAudio(){
 if(audio)return;
 if(!audioPreparation){
  const scoreToken=generation, renderToken=audioRenderGeneration;
  const isCurrent=()=>scoreToken===generation&&renderToken===audioRenderGeneration;
  audioPreparation=createScoreAudio(isCurrent,webViewScore,localScoreSource,highQuality).catch(error=>{
   if(isCurrent())throw error;
  });
 }
 const pending=audioPreparation;
 try{await pending}finally{if(audioPreparation===pending)audioPreparation=null}
}
async function synthesizeScore(source,useHighQuality,isCurrent){
 const asset=useHighQuality?'../custom/pro.sf3':'../custom/default.sf3';
 const response=await fetch(new URL(asset,location.href));
 if(!response.ok)throw Error('Не удалось загрузить банк инструментов');
 const soundFont=await response.arrayBuffer();
 if(!isCurrent())return;

 // The WASM synthesizer caches its first bank. A new audio worker applies the selected bank.
 const audioScore=await WebMscore.load(source.format,bytes(source.data),[],false);
 try{
  if(!isCurrent())return;
  await audioScore.setSoundFont(new Uint8Array(soundFont));
  if(!isCurrent())return;
  const wav=await audioScore.saveAudio('wav');
  return wav.byteOffset===0&&wav.byteLength===wav.buffer.byteLength
   ?wav.buffer:wav.buffer.slice(wav.byteOffset,wav.byteOffset+wav.byteLength);
 }finally{
  audioScore.destroy(false);
 }
}
async function createScoreAudio(isCurrent,view,source,useHighQuality){
 let data;
 if(view){
  const url=await webLoad?.audioReady;
  if(!isCurrent()||!url)return;
  const response=await fetch(url);
  if(!response.ok)throw Error('Не удалось загрузить звук партитуры');
  data=await response.arrayBuffer();
 }else{
  data=await synthesizeScore(source,useHighQuality,isCurrent);
 }
 if(!isCurrent()||!data)return;
 const player=await pitchAudio.create(data);
 if(!isCurrent()){player.dispose();return}
 audio=player;
 if(view)metadata.duration=player.duration;
 player.currentTime=pendingPosition;
 player.playbackRate=speed;
 player.pitchSemitones=transpose;
 player.onmetronomeclick=()=>emit('mMetronomeClick');
 player.onended=()=>{
  if(loopEnabled&&loop){setSecond(loop[0]);player.play()}
  else{playback.resetClock();updatePosition();emit('mPlaybackStatusChanged',2)}
 };
 player.onerror=()=>{
  if(audio!==player)return;
  pendingPosition=player.currentTime;
  player.dispose();
  audio=null;
  stopAudio();
  showError('Не удалось воспроизвести звук партитуры');
 };
 applyVolume();
}
function initialSpeed(params){
 const rate=Number(params?.playbackSpeed);
 return Number.isFinite(rate)&&rate>0?rate:1;
}
async function playScore(resume=false){
 const token=audioGeneration;
 if(pendingPlayGeneration===token||(audio&&!audio.paused))return;
 pendingPlayGeneration=token;
 try{
  if(webLoad){
   webLoad.waitingForAudio=true;
   webLoad.updateNotice();
  }
  await prepareAudio();
  if(token!==audioGeneration||!audio)return;
  if(loopEnabled&&loop&&(currentSecond()<loop[0]||currentSecond()>=loop[1]))setSecond(loop[0]);
  if(!resume&&!await playback.beforePlay())return;
  if(token!==audioGeneration||!audio.play())return;
  playback.tick();updatePosition();emit('mPlaybackStatusChanged',0);
 }finally{
  if(pendingPlayGeneration===token)pendingPlayGeneration=null;
 }
}
const commands={
 refreshWebScoreManifest:token=>webLoad?.token===token?webLoad.refreshManifest():undefined,
 ...playback.commands,
 setNoteHints:noteHints.setEnabled,
 previewNoteOn:keyboardAudio.start,previewNoteOff:keyboardAudio.stop,
 open:loadScore,getMeta:(data,format,params,manifestUrl)=>loadScore(data,format,params,manifestUrl,'getMeta'),
 async play(assessment){
  if(assessment)throw Error('Оценка исполнения не поддерживается открытым движком');
  if(!score&&!webViewScore)throw Error('Партитура ещё не загружена');
  await playScore();
 },
 async setSoundQuality(enabled){
  if(highQuality===enabled)return;
  highQuality=enabled;
  if(!localScoreSource||(!audio&&!audioPreparation))return;
  const wasPlaying=!!audio&&!audio.paused;
  const playPending=pendingPlayGeneration===audioGeneration;
  pendingPosition=currentSecond();
  stopAudio();
  releaseRenderedAudio();
  if(wasPlaying||playPending)await playScore(wasPlaying);
 },
 pause:()=>stopAudio(),stop:()=>stopAudio(true),rewind:()=>setSecond(0),
 clearScore(){++generation;resetWebLoad();positions=null;disposeAudio();score?.destroy();score=null;metadata=null;positions=null;loopSelection.reset();scoreLayout.reset();scoreCursor.reset();pages.replaceChildren()},
 cancelLoad(){++generation;resetWebLoad();stopAudio();emit('mNotationLoaded',{status:2,data:null})},
 setPlaybackSpeed(value){
  if(!Number.isFinite(value)||value<=0)throw Error('Некорректный темп');
  if(speed===value)return;
  speed=value;playback.resetClock();if(audio)audio.playbackRate=value;
 },
 setTranspose(value){
  if(!Number.isInteger(value)||value < -12||value > 12)throw Error('Транспонирование: от −12 до +12 полутонов');
  if(transpose===value)return;
  transpose=value;
  playback.resetClock();
  if(audio)audio.pitchSemitones=value;
 },
 setCurrentSecond:setSecond,setCurrentPercent:p=>setSecond(p*(metadata?.duration||0)),
 setCurrentMeasure(i){const el=positions?.elements?.[i];const e=positions?.events?.find(x=>x.elid===el?.id);if(e)setSecond(e.position/1000)},
 requestPlaybackSecond(){emit('mPlaybackSecondResponse',currentSecond())},
 setPage(p){
  const old=page,next=Math.max(0,Math.min(p,(metadata?.pages||1)-1));
  scoreLayout.goToPage(next);setVisiblePage(next);
  emit('mPageFlipped',{flipped:page!==old,current:page,wanted:p,old});
 },
 setNoteSize(value,x,y,targetX,targetY){
  const next=clampNoteSize(value);
  if(next===noteSize)return;
  noteSize=next;scoreLayout.setZoom(noteSize/baseNoteSize,x,y,targetX,targetY);
  updatePosition();loopSelection.sync();emit('mNoteSizeSet',noteSize);emit('mLayoutDidHappen');
 },
 fitScoreToScreen(){commands.setNoteSize(baseNoteSize)},
 setPageWidthScale(value){commands.setNoteSize(baseNoteSize*Math.max(0.1,Number(value)||1))},
 setScrollMode(value){scoreLayout.apply(value);updatePosition();loopSelection.sync();emit('mLayoutDidHappen')},
 setMargin(value){document.body.style.paddingTop=Math.max(0,Number(value?.top)||0)+'px';document.body.style.paddingBottom=Math.max(0,Number(value?.bottom)||0)+'px';updatePosition();loopSelection.sync()},
 setScrollOffset(x,y){window.scrollTo(x,y)},
 setTheme(mode){document.body.style.filter=mode==='night'?'invert(1)':'none'},
 setPlayHeadVisible(value){scoreCursor.setVisible(value)},
 setCursorPosition(x,y){if(!scoreCursor.seek(x,y))emit('mCursorPositionSet',{success:false,second:0})},
 setGeneralVolume(value){volume=Math.max(0,Math.min(1,value));applyVolume();emit('mGeneralAudioInfoUpdated',{balance:0,volume,muted})},
 setGeneralMuted(value){muted=value;applyVolume();emit('mGeneralAudioInfoUpdated',{balance:0,volume,muted})},
 setPartVolume(track,value){partVolumes[track]=Math.max(0,Math.min(1,Number(value)||0));applyVolume();emit('mPartAudioInfoUpdated',{track,volume:partVolumes[track],balance:0,pitch:0})},
 setPlayableParts(ids){playableParts=ids;applyVolume()},
 setLoopRegionFromSecond(a,b){if(!(b>a))throw Error('Некорректные границы повтора');loop=[a,b];loopSelection.sync();emit('mLoopRegionChanged',{start:a,end:b})},
 setLoopRegion(a,b){const events=positions?.events||[];const elements=positions?.elements||[];const first=events.find(e=>e.elid===elements[a]?.id);const last=events.find(e=>e.elid===elements[b+1]?.id);if(first)commands.setLoopRegionFromSecond(first.position/1000,last?last.position/1000:metadata.duration)},
 setLoopEnabled(value){loopEnabled=!!value;if(loopEnabled&&!loop){const i=webScoreCoordinates.eventIndex(positions?.events||[],currentSecond());const events=positions?.events||[];if(events[i])loop=[events[i].position/1000,(events[i+1]?.position??metadata.duration*1000)/1000]}loopSelection.sync();emit('mLoopEnable',loopEnabled)},setLoopActive(value){commands.setLoopEnabled(value)},
 async exportPdf(path){if(!score)throw Error('Партитура не загружена');const pdf=await score.savePdf();emit('savePdf',{path,data:base64(pdf)})},
 async exportToJson(){if(!score)throw Error('Партитура не загружена');emit('mExportedToJson',await score.metadata())},
 setEnabledDebugMode(){},
};
// Unsupported controls report their limitation; they never fabricate a result event.
const reported=new Set();
window.runCommand=async command=>{
 try{if(!commands[command.method]){if(!reported.has(command.method)){reported.add(command.method);emit('unsupported',command.method)}return}await commands[command.method](...command.args)}
 catch(error){showError(error);if(command.method==='open'||command.method==='getMeta')emit(command.method==='open'?'mNotationLoaded':'mMetaInfoRead',{status:4,data:null,error:String(error)});if(command.method==='exportPdf')emit('mPdfExported',{path:command.args[0],success:false})}
};
window.onscroll=()=>{
 const {scrollWidth,scrollHeight}=document.documentElement;
 setVisiblePage(scoreLayout.visiblePage());
 emit('mSizeScrollChanged',{contentOffset:{x:scrollX,y:scrollY},contentSize:{width:scrollWidth,height:scrollHeight}});
};

window.addEventListener('resize',()=>{scoreLayout.refresh();updatePosition();loopSelection.sync()});
emit('ready');
