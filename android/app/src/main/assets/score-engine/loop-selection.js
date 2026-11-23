/* Measure-snapped repeat selection uses the same page transform as the playhead. */
const loopSelection=(()=>{
 const pages=document.getElementById("pages");
 let first=null,last=null,gesture=null,timer=null,stamp='';
 const nodes=[];
 function clearNodes(){while(nodes.length)nodes.pop().remove()}
 function bounds(index){const s=scoreCursor.span(index);if(!s)return null;return [s.event.position/1000,(s.nextEvent?.position??metadata.duration*1000)/1000]}
 function notify(){
  if(first===null||last===null)return;
  const a=bounds(first),b=bounds(last);if(!a||!b)return;
  loop=[a[0],b[1]];loopEnabled=true;
  emit('mLoopEnable',true);emit('mLoopRegionChanged',{start:loop[0],end:loop[1]});
  emit('mRangeSelectionEnable',true);
  emit('mRangeSelectionRegionChanged',{startMeasureIdx:first,endMeasureIdx:last,startSec:loop[0],endSec:loop[1]});
  stamp='';render();
 }
 function reset(){clearTimeout(timer);gesture=null;first=last=null;loop=null;loopEnabled=false;stamp='';clearNodes()}
 function clear(){reset();emit('mLoopEnable',false);emit('mRangeSelectionEnable',false)}
 function sync(){
  if(!loopEnabled||!loop){clearNodes();stamp='';return}
  const events=positions?.events||[];
  first=events.findIndex((e,i)=>e.position/1000<=loop[0]&&(events[i+1]?.position/1000??Infinity)>loop[0]);
  last=events.findIndex((e,i)=>e.position/1000<loop[1]&&(events[i+1]?.position/1000??Infinity)>=loop[1]);
  stamp='';render();
 }
 function render(){
  if(!loopEnabled||first===null||first<0||last===null||last<0){clearNodes();return}
  const signature=[first,last,pages.clientWidth,pages.style.zoom,pages.dataset.layout].join(':');
  if(signature===stamp)return;stamp=signature;clearNodes();
  const rows=new Map();
  for(let i=first;i<=last;i++){
   const s=scoreCursor.span(i);if(!s)continue;
   const g=scoreCursor.geometry(s.element),b=scoreCursor.rectangle(s.element);if(!g||!b)continue;
   const key=s.element.page+':'+b.top;
   const row=rows.get(key);
   if(row){row.right=Math.max(row.right,b.left+b.width);row.left=Math.min(row.left,b.left)}
   else rows.set(key,{g,left:b.left,right:b.left+b.width,top:b.top,height:b.height});
  }
  const list=[...rows.values()];
  list.forEach((row,i)=>{
   const layer=document.createElement('div');layer.className='loop-region';
   layer.style.cssText=`position:absolute;pointer-events:none;z-index:1;box-sizing:border-box;background:#7856ff22;border-top:2px solid #7856ff;border-bottom:2px solid #7856ff;left:${row.left*row.g.width}px;top:${(row.top-row.g.top)*row.g.height}px;width:${(row.right-row.left)*row.g.width}px;height:${row.height*row.g.height}px`;
   row.g.section.append(layer);nodes.push(layer);
   for(const edge of [...(i===0?['start']:[]),...(i===list.length-1?['end']:[])]){
    const handle=document.createElement('div');handle.dataset.loopHandle=edge;
    handle.style.cssText=`position:absolute;pointer-events:auto;touch-action:none;z-index:4;top:0;bottom:0;width:26px;${edge==='start'?'left':'right'}:-13px;cursor:ew-resize`;
    const bar=document.createElement('div');bar.style.cssText='position:absolute;left:11px;width:4px;height:100%;background:#7856ff;border-radius:4px';handle.append(bar);layer.append(handle);
   }
  });
 }
 pages.addEventListener('pointerdown',e=>{
  if(!e.isPrimary||e.button!==0)return;
  const edge=e.target.closest?.('[data-loop-handle]')?.dataset.loopHandle;
  const point=scoreCursor.pick(e.clientX,e.clientY);
  if(edge){
   clearTimeout(timer);gesture={id:e.pointerId,edge,active:true};pages.setPointerCapture(e.pointerId);
   e.preventDefault();e.stopImmediatePropagation();emit('cursorInteraction');return;
  }
  if(e.target.closest?.('#cursor'))return;
  gesture={id:e.pointerId,x:e.clientX,y:e.clientY,index:point?.index,active:false};
  clearTimeout(timer);timer=setTimeout(()=>{
   if(!gesture||gesture.index===undefined)return;
   first=last=gesture.index;gesture.active=true;pages.setPointerCapture(gesture.id);notify();emit('cursorInteraction');
  },450);
 },true);
 pages.addEventListener('pointermove',e=>{
  if(!gesture||e.pointerId!==gesture.id)return;
  if(!gesture.active){if(Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>8){clearTimeout(timer);gesture=null}return}
  e.preventDefault();e.stopImmediatePropagation();
  const p=scoreCursor.pick(e.clientX,e.clientY);
  if(p){
   if(gesture.edge==='start')first=Math.min(p.index,last);
   else if(gesture.edge==='end')last=Math.max(p.index,first);
   else {first=Math.min(gesture.index,p.index);last=Math.max(gesture.index,p.index)}
   notify();
  }
  if(e.clientY<40)scrollBy(0,-16);else if(e.clientY>innerHeight-40)scrollBy(0,16);
 },true);
 pages.addEventListener('pointerup',e=>{
  clearTimeout(timer);const g=gesture;gesture=null;if(!g||g.id!==e.pointerId)return;
  if(g.active){e.preventDefault();e.stopImmediatePropagation();try{pages.releasePointerCapture(e.pointerId)}catch(_){};return}
  if(loopEnabled&&Math.hypot(e.clientX-g.x,e.clientY-g.y)<8){
   const p=scoreCursor.pick(e.clientX,e.clientY);
   if(!p||p.index<first||p.index>last){clear();e.preventDefault();e.stopImmediatePropagation()}
  }
 },true);
 pages.addEventListener('pointercancel',()=>{clearTimeout(timer);gesture=null},true);
 window.addEventListener('resize',()=>{stamp='';render()});
 return {sync,render,reset,clear,isSelecting:()=>!!gesture?.active,cancelGesture(){clearTimeout(timer);gesture=null}};
})();
