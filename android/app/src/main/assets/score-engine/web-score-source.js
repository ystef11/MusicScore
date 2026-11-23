(function(){
 const expected=__SCORE__;
 const normal=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
 const store=window.UGAPP?.store;
 const current=store?.page?.data?.score;
 const hash=(expected.preview||'').match(/scoredata\/[^/]+\/([^/]+)\//)?.[1];
 if(!current?.pages_count && !(expected.urlOnly && current?.url)){
   let target=null;
   if(hash)for(const img of document.images){if(!(img.currentSrc||img.src).includes(hash))continue;let el=img;for(let n=0;el&&n<7;n++,el=el.parentElement){const a=el.matches?.('a[href*="/scores/"]')?el:el.querySelector?.('a[href*="/scores/"]');if(a){target=a.href;break}}if(target)break}
   if(!target){const seen=new WeakSet();const visit=(v,depth=0)=>{if(target||!v||typeof v!=='object'||depth>10||seen.has(v))return;seen.add(v);if(normal(v.title)===normal(expected.title)&&Number(v.user?.id)===Number(expected.authorId)&&typeof v.url==='string'&&/\/scores\/\d+/.test(v.url)){target=v.url;return}Object.values(v).forEach(x=>visit(x,depth+1))};visit(store)}
   if(!target)for(const a of document.querySelectorAll('a[href*="/scores/"]')){if(normal(a.textContent)!==normal(expected.title))continue;let el=a;for(let n=0;el&&n<6;n++,el=el.parentElement){if(expected.authorName&&normal(el.textContent).includes(normal(expected.authorName))){target=a.href;break}}if(target)break}
   if(target&&new URL(target,location.href).hostname==='musescore.com'){location.replace(target);return{pending:true}}
   if(/\/sheetmusic\/?$/.test(location.pathname)){
     const started=window.__musicScoreSearchStarted??=Date.now();
     if(document.readyState==='complete'&&Date.now()-started>=12000)return{error:'Не удалось найти партитуру на сайте MuseScore'};
   }
   return{pending:true};
 }
 if(normal(current.title)!==normal(expected.title))return {error:'Веб-поиск вернул другую партитуру'};
 if (expected.urlOnly) {
   const currentPreview = current.thumbnails?.large || current.thumbnails?.small || '';
   const currentHash = currentPreview.match(/scoredata\/[^/]+\/([^/]+)\//)?.[1];
   if (Number(current.user?.id) !== Number(expected.authorId) || (hash && currentHash && hash !== currentHash)) {
     return {error:'Веб-поиск вернул другую партитуру'};
   }
   if (current.is_private !== 0 && current.is_private !== false) {
     return {error:'Партитура не опубликована'};
   }
   return {sourceUrl: current.url || location.href};
 }
 if(store.page.data.score_blocked_by_country||store.page.data.is_blocked||current.is_blocked)return{error:'Источник ограничил доступ к этой партитуре'};
 const count=Number(current.pages_count);
 if(!Number.isSafeInteger(count)||count<1)return{error:'Источник не указал число страниц'};
 // Observe the site's own responses, without issuing cross-origin media requests.
 const sync=window.__musicScoreSync||(window.__musicScoreSync={responses:{}});
 if(!sync.observing){
  sync.observing=true;
  const capture=(url,text)=>{if(/(?:time|space|position|\.mpos|\.spos)/i.test(url)&&text&&text.length<8000000)sync.responses[url]=text};
  const open=XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open=function(method,url,...rest){this.addEventListener('load',()=>{try{if(!this.responseType||this.responseType==='text')capture(String(url),this.responseText);else if(this.responseType==='json')capture(String(url),JSON.stringify(this.response))}catch(_){}});return open.call(this,method,url,...rest)};
  const fetch=window.fetch;
  window.fetch=function(...args){return fetch.apply(this,args).then(response=>{const url=response.url||String(args[0]);if(/(?:time|space|position|\.mpos|\.spos)/i.test(url))response.clone().text().then(text=>capture(url,text)).catch(()=>{});return response})};
 }

 const now=Date.now();
 const state=window.__musicScoreView||(window.__musicScoreView={started:now,pages:{},renderedPages:new Set(),scroll:0,pass:0,clicked:false});
 if(!state.observing){
   state.observing=true;
   performance.setResourceTimingBufferSize?.(4096);
 }
 const scroller=document.getElementById('jmuse-scroller-component');
 const resources=performance.getEntriesByType('resource').map(entry=>entry.name);
 const remember=(url, rendered=false)=>{
   // The viewer uses PNG @0 for full pages and @WIDTHxHEIGHT for catalog thumbnails.
   const m=typeof url==='string'&&url.match(/\/score_(\d+)\.(svg|png(?:@0)?)(?:[?#]|$)/i);
   if(!m||Number(m[1])>=count)return;
   const index=Number(m[1]);
   if(rendered){
     state.renderedPages.add(index);
     state.pages[index]=url;
   }else if(!state.renderedPages.has(index)&&(m[2].toLowerCase()==='svg'||!state.pages[index])){
     state.pages[index]=url;
   }
 };
 const first=document.querySelector('link[as="image"][href*="/score_0."]')?.href;
 remember(first);
 resources.forEach(url=>remember(url));
 scroller?.querySelectorAll('img[src*="/score_"]').forEach(image=>remember(image.currentSrc||image.src,true));
 // The player also renders pages as CSS background images on some clients.
 scroller?.querySelectorAll('.Q05uP[style*="background-image"]').forEach(page=>{
   const url=page.style.backgroundImage.match(/^url\(["']?(.*?)["']?\)$/i)?.[1];
   remember(url,true);
 });
 const audio=Array.from(document.querySelectorAll('audio')).map(a=>a.currentSrc||a.src).find(Boolean)
   ||resources.find(u=>/\.(mp3|ogg|m4a)(?:\?|$)/i.test(u));
 if(!state.clicked){const play=document.getElementById('scorePlayButton')||document.querySelector('button[title="Toggle Play"]');if(play){HTMLMediaElement.prototype.play=function(){return Promise.resolve()};if(window.AudioContext)AudioContext.prototype.resume=function(){return Promise.resolve()};play.click();state.clicked=true}}
 const found=Object.keys(state.pages).length;
 const viewportReady=scroller?.clientWidth>0&&scroller.clientHeight>0;
 if(!state.pages[0]&&viewportReady&&!state.positionedAtFirstPage){
   const firstWrapper=scroller.querySelector('.SQS_G');
   if(firstWrapper){
     firstWrapper.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
     state.positionedAtFirstPage=true;
   }
 }
 if(state.pages[0]&&found<count&&!state.scanDone&&viewportReady&&(now>=(state.nextScroll||0)||state.pages[state.awaitedPage])){
   // The player requests each page only while its wrapper intersects this scroller.
   const wrappers=scroller.querySelectorAll('.SQS_G');
   while(state.scroll<count&&state.pages[state.scroll])state.scroll++;
   if(state.scroll>=count){
    state.scroll=0;
    if(++state.pass>=2)state.scanDone=now;
   }else{
    const index=state.scroll++;
    const wrapper=wrappers.length===count?wrappers[index]:null;
    if(wrapper)wrapper.scrollIntoView({block:'center',inline:'center',behavior:'instant'});
    else{
     const fraction=index/Math.max(1,count-1);
     scroller.scrollTo({top:fraction*(scroller.scrollHeight-scroller.clientHeight),
      left:fraction*(scroller.scrollWidth-scroller.clientWidth),behavior:'instant'});
    }
    state.awaitedPage=index;
    state.nextScroll=now+1250;
   }
 }
 if(!state.pages[0]){
   if(now-state.started>23000)return{error:'Источник не выдал первую страницу нот',
     viewer:{width:scroller?.clientWidth||0,height:scroller?.clientHeight||0,
       visible:!document.hidden,found}};
   return {pending:true};
 }
 const customAudio=!!(current.has_custom_audio||store.score?.hasCustomAudio);
 const manifest={pending:true,version:5,customAudio,sourceUrl:location.href,title:current.title,
  pages:Array.from({length:count},(_,i)=>state.pages[i]||null),audioUrl:audio||null,
  metadata:{dimensions:current.dimension||current.dimensions||store.score?.metadata?.dimensions,bpm:Number(store.score?.score_bpm)||0,timeSignature:current.timesig||store.score?.timesig,title:current.title,pages:count,measures:Number(current.measures)||0,duration:current.duration,keysig:current.keysig,
   parts:(current.parts_names||store.score?.partNames||[]).map(name=>({name,instrumentName:name}))}};
 if(!state.firstReady)state.firstReady=now;
 const scanComplete=found===count||state.scanDone&&now-state.scanDone>=4000||!viewportReady&&now-state.firstReady>15000;
 if(scanComplete&&(audio||now-state.firstReady>12000)){
   const settings=store.modules?.jmuseSettings||store.jmuseSettings||store.jmuse_settings;
   // Read the same MIDI bytes as the piano roll, through its browser session and headers.
   if(!state.midiRequest&&window.webpackChunkmusescore_es6){
    state.midiRequest={started:Date.now(),done:false};
    try{window.webpackChunkmusescore_es6.push([['musicscore-rhythm-'+Date.now()],{},require=>{
     try{
      const transport=require(49218),urls=require(44726),authorization=require(40740);
      const request=state.midiRequest;
      Promise.resolve(transport.OF(urls.N6(current.id,'midi',0,settings?.urls?.mainServer||''),authorization.c(current.id,'midi',0)))
       .then(url=>{
        if(typeof url!=='string'){request.done=true;return}
        request.url=new URL(url,location.href).href;
        transport.iK(request.url,data=>{
         if(typeof data==='string'&&data.startsWith('MThd')&&data.length<=256*1024)request.data=btoa(data);
         request.done=true;
        },()=>{request.done=true});
       })
       .catch(()=>{request.done=true});
     }catch(_){state.midiRequest.done=true}
    }])}catch(_){state.midiRequest.done=true}
   }
   if(state.midiRequest&&!state.midiRequest.done&&now-state.midiRequest.started<4000)return progress();
   const midiData=state.midiRequest?.data;
   const midi=midiData?null:state.midiRequest?.url||settings?.urls?.midi
    ||resources.find(u=>/\.(?:mid|midi)(?:\?|$)/i.test(u));
   const syncUrls=resources.filter(u=>/(?:[/_](?:time|space|time_space)(?:[._?]|$)|\.(?:spos|mpos)(?:\?|$)|[?&]type=(?:time|space|time_space)(?:&|$))/i.test(u));
   for(const text of Object.values(sync.responses)){try{const value=JSON.parse(text);const url=value?.info?.url||value?.url||value?.data?.url;if(typeof url==='string'&&url.startsWith('https://'))syncUrls.push(url)}catch(_){}}
   return {...manifest,pending:false,midiData,midiUrl:typeof midi==='string'?new URL(midi,location.href).href:null,
    syncResponses:Object.values(sync.responses),syncUrls:[...new Set(syncUrls)]};
 }
 return progress();
 function progress(){
   const snapshot=JSON.stringify([manifest.pages,manifest.audioUrl]);
   if(snapshot===state.lastSnapshot)return{pending:true};
   state.lastSnapshot=snapshot;
   return manifest;
 }
})()
