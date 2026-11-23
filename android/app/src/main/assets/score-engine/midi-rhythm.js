/* SMF tempo/meter events define beat times; never infer them from page spacing. */
const midiRhythm=(()=>{
 function meter(numerator,denominator){
  const compound=denominator>=8&&numerator>3&&numerator%3===0;
  return {step:(compound?12:4)/denominator,beats:compound?numerator/3:numerator};
 }
 function parse(buffer){
  const data=new Uint8Array(buffer),view=new DataView(data.buffer,data.byteOffset,data.byteLength);
  let at=0,end=data.length;
  const need=n=>{if(at+n>end)throw Error('Оборвана карта MIDI')};
  const byte=()=>{need(1);return data[at++]};
  const u16=()=>{need(2);const v=view.getUint16(at);at+=2;return v};
  const u32=()=>{need(4);const v=view.getUint32(at);at+=4;return v};
  const text=n=>{need(n);let s='';while(n--)s+=String.fromCharCode(byte());return s};
  const variable=()=>{let value=0;for(let i=0;i<4;i++){const b=byte();value=value*128+(b&127);if(!(b&128))return value}throw Error('Некорректная карта MIDI')};
  if(text(4)!=='MThd')throw Error('Нет заголовка MIDI');
  const header=u32(),headerEnd=at+header;
  if(header<6)throw Error('Некорректный заголовок MIDI');
  const format=u16(),tracks=u16(),ppq=u16();
  if(format>1||!ppq||(ppq&32768))throw Error('Не поддерживается формат времени MIDI');
  at=headerEnd;
  const events=[];let finalTick=0;
  for(let track=0;track<tracks;track++){
   end=data.length;if(text(4)!=='MTrk')throw Error('Нет дорожки MIDI');
   const length=u32();end=at+length;if(end>data.length)throw Error('Оборвана дорожка MIDI');
   let tick=0,running=0;
   while(at<end){
    tick+=variable();let status=byte(),first=null;
    if(status<128){if(!running)throw Error('Нет статуса MIDI');first=status;status=running}
    if(status===255){
     running=0;const type=byte(),size=variable();need(size);const finish=at+size;
     if(type===81&&size===3)events.push({tick,tempo:(byte()<<16)|(byte()<<8)|byte()});
     else if(type===88&&size===4){const numerator=byte(),denominator=2**byte();events.push({tick,numerator,denominator})}
     at=finish;
    }else if(status===240||status===247){running=0;const size=variable();need(size);at+=size}
    else if(status>=128&&status<240){
     running=status;
     const count=(status>>4)===12||(status>>4)===13?1:2;
     if(first===null)byte();if(count===2)byte();
    }else throw Error('Некорректное событие MIDI');
   }
   finalTick=Math.max(finalTick,tick);
  }
  events.sort((a,b)=>a.tick-b.tick);
  let tick=0,second=0,tempo=500000,numerator=4,denominator=4,barStart=0,next=0,index=0;
  const beats=[];
  while(tick<finalTick&&beats.length<100000){
   while(index<events.length&&events[index].tick<=tick+1e-7){
    const event=events[index++];
    if(event.tempo>0)tempo=event.tempo;
    if(event.numerator>0&&event.denominator>0){
     numerator=event.numerator;denominator=event.denominator;
     barStart=event.tick;next=event.tick;
    }
   }
   const pulse=meter(numerator,denominator);
   const step=ppq*pulse.step,bar=ppq*numerator*4/denominator;
   if(!(step>0&&bar>0))throw Error('Некорректный размер MIDI');
   if(next<=tick+1e-7){
    const phase=(tick-barStart)%bar;
    const quarter=tempo/1000000;
    beats.push({second,accent:phase<1e-6||bar-phase<1e-6,interval:quarter*pulse.step,quarter,...pulse});
    next=tick+step;
   }
   const target=Math.min(next,events[index]?.tick??Infinity,finalTick);
   if(target<=tick)break;
   second+=(target-tick)*tempo/1000000/ppq;tick=target;
  }
  for(let i=0;i+1<beats.length;i++)beats[i].interval=beats[i+1].second-beats[i].second;
  return beats;
 }
 return {parse,meter};
})();
