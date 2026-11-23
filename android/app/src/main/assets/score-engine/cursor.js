/* One coordinate transform is shared by drawing, dragging and point seeking. */
const scoreCursor = (() => {
 const node=document.getElementById('cursor');
 let visible=false, dragging=false, dragId=null, tap=null, singleTimer=null, suppressUntil=0;
 let mappedPositions=null, elementsById=new Map();
 function elementById(id){
  if(mappedPositions!==positions){mappedPositions=positions;elementsById=new Map((positions?.elements||[]).map(element=>[element.id,element]))}
  return elementsById.get(id);
 }
 let followedEvent=null, lastFollowTime=0;
 function geometry(element){
  if(!positions?.pageSize?.width||!positions.pageSize.height)return null;
  return scoreLayout.geometry(element);
 }
 function rectangle(element){
  if(positions.coordinateSystem==='musescore-web')return noteAnchors.adjust(element,webScoreCoordinates.rectangle(element,positions.pageSize));
  const width=positions.pageSize.width,height=positions.pageSize.height;
  return {left:element.x/width,top:element.y/height,width:element.sx/width,height:element.sy/height};
 }
 function span(index){
  const event=positions?.events?.[index];if(!event)return null;
  const element=elementById(event.elid);if(!element)return null;
  const nextEvent=positions.events[index+1];
  return {event,element,nextEvent};
 }
 function draw(index,second,follow){
  const item=span(index),g=item&&geometry(item.element);
  if(!g||!visible){node.style.display='none';return;}
  const {element,event,nextEvent}=item,box=rectangle(element);
  if(!box||![box.left,box.top,box.width,box.height].every(Number.isFinite)||box.height<=0){node.style.display='none';return;}
  const duration=(nextEvent?.position??(metadata?.duration||0)*1000)-event.position;
  const fraction=duration>0?Math.max(0,Math.min(1,(second*1000-event.position)/duration)):0;
  const x=box.left+box.width*fraction;
  if(x<0||x>1||box.top<0||box.top>=1){node.style.display='none';return;}
  if(node.parentElement!==g.section){g.section.append(node);if(dragId!==null){try{node.setPointerCapture(dragId)}catch(_){}}}
  const {width,height}=g;
  const zoom=g.rect.width/width,hitWidth=Math.min(width,28/zoom);
  node.style.left=Math.max(0,Math.min(width-hitWidth,x*width-hitWidth/2))+'px';
  node.style.top=((box.top-g.top)*height)+'px';node.style.width=hitWidth+'px';
  node.style.height=(Math.min(box.height,1-box.top)*height)+'px';
  node.style.setProperty('--cursor-line-width',(3/zoom)+'px');node.style.display='block';
  if(follow&&!dragging){
   const now=Date.now();
   if(item.event!==followedEvent&&now-lastFollowTime>500){
    followedEvent=item.event;lastFollowTime=now;
    const top=g.rect.top+box.top*g.rect.height,bottom=top+box.height*g.rect.height;
    const cursorX=g.rect.left+x*g.rect.width;
    const dx=cursorX<0||cursorX>innerWidth ? cursorX-innerWidth*0.15 : 0;
    const dy=top<0||bottom>innerHeight ? top-innerHeight*0.2 : 0;
    if(dx||dy)window.scrollBy(dx,dy);
   }
  }
 }
 function pick(x,y){
  if(!positions?.events?.length)return false;
  let best=null;const geometries=new Map();
  for(let i=0;i<positions.events.length;i++){
   const item=span(i);if(!item)continue;
   const key=scoreLayout.geometryKey(item.element);
   if(!geometries.has(key)){
    const candidate=geometry(item.element);
    const view=candidate?.section.getBoundingClientRect();
    geometries.set(key,view&&x>=view.left&&x<view.right&&y>=view.top&&y<view.bottom?candidate:null);
   }
   const g=geometries.get(key);if(!g)continue;
   const box=rectangle(item.element),point=webScoreCoordinates.point(x,y,g.rect);
   // Web player selects the space rectangle containing the normalized point.
   if(!box||!webScoreCoordinates.contains(box,point))continue;
   const repeatDistance=Math.abs(item.event.position/1000-currentSecond());
   if(best&&repeatDistance>=best.repeatDistance)continue;
   const fraction=box.width>0?Math.max(0,Math.min(1,(point.x-box.left)/box.width)):0;
   const endTime=item.nextEvent?.position??(metadata?.duration||0)*1000;
   best={index:i,repeatDistance,second:(item.event.position+Math.max(0,endTime-item.event.position)*fraction)/1000};
  }
  return best;
 }
 function seek(x,y){
  const best=pick(x,y);if(!best)return false;
  setSecond(best.second);emit('mCursorPositionSet',{success:true,second:best.second});emit('cursorInteraction');return true;
 }
 function setVisible(value){visible=!!value;if(!visible)endDrag();updatePosition()}
 function endDrag(){if(dragId!==null){try{node.releasePointerCapture(dragId)}catch(_){}}dragId=null;dragging=false;node.classList.remove('dragging')}
 node.addEventListener('pointerdown',event=>{
  if(!visible||event.button!==0)return;
  event.preventDefault();event.stopPropagation();clearTimeout(singleTimer);tap=null;
  dragId=event.pointerId;dragging=true;node.classList.add('dragging');node.setPointerCapture(dragId);emit('cursorInteraction');
 });
 node.addEventListener('pointermove',event=>{
  if(event.pointerId!==dragId)return;event.preventDefault();event.stopPropagation();seek(event.clientX,event.clientY);
  if(event.clientY<36)window.scrollBy(0,-20);else if(event.clientY>innerHeight-36)window.scrollBy(0,20);
 });
 for(const type of ['pointerup','pointercancel','lostpointercapture'])node.addEventListener(type,event=>{
  if(event.pointerId!==dragId)return;event.stopPropagation();suppressUntil=Date.now()+350;endDrag();
 });
 node.addEventListener('click',event=>{event.preventDefault();event.stopPropagation()});
 let down=null;
 document.getElementById('pages').addEventListener('pointerdown',event=>{
  if(!event.isPrimary||event.button!==0)return;down={x:event.clientX,y:event.clientY,id:event.pointerId,time:Date.now()};
 });
 document.getElementById('pages').addEventListener('pointercancel',()=>{down=null;tap=null});
 document.getElementById('pages').addEventListener('pointerup',event=>{
  const start=down;down=null;
  if(!start||start.id!==event.pointerId||Date.now()<suppressUntil||Date.now()-start.time>500||Math.hypot(start.x-event.clientX,start.y-event.clientY)>8)return;
  const current={x:event.clientX,y:event.clientY,time:Date.now()};
  clearTimeout(singleTimer);
  if(tap&&current.time-tap.time<320&&Math.hypot(current.x-tap.x,current.y-tap.y)<24){
   tap=null;suppressUntil=Date.now()+350;event.preventDefault();seek(current.x,current.y);
  }else{
   tap=current;singleTimer=setTimeout(()=>{tap=null;emit('singleTap',{x:current.x,y:current.y,width:innerWidth,height:innerHeight})},320);
  }
 });
 document.getElementById('pages').addEventListener('dblclick',event=>{
  event.preventDefault();clearTimeout(singleTimer);tap=null;if(Date.now()>=suppressUntil){suppressUntil=Date.now()+350;seek(event.clientX,event.clientY)}
 });
 function reset(){followedEvent=null;lastFollowTime=0;endDrag();clearTimeout(singleTimer);tap=null;down=null;node.style.display='none';document.body.append(node)}
 return {draw,seek,pick,rectangle,geometry,span,setVisible,reset,cancelTap(){clearTimeout(singleTimer);tap=null;down=null}};
})();
