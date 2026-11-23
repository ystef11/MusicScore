/* MuseScore web player coordinate contract.
 * Source: 7636.675ed54fcc6b2645fe8e7b7edb9d7537.js, modules 34384/36179/26959.
 * Space coordinates are twelve times the web page dimensions, not SVG viewBox units.
 */
const webScoreCoordinates = Object.freeze({
 pageSize(dimensions){
  const match=String(dimensions||'').match(/^\s*(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*$/i);
  if(!match)return null;
  const width=Math.round(parseInt(match[1],10)*3.9380952381);
  const height=Math.round(parseInt(match[2],10)*3.9380952381);
  return width>0&&height>0?{width,height}:null;
 },
 rectangle(element,pageSize){
  if(!pageSize?.width||!pageSize?.height)return null;
  return {left:element.x/12/pageSize.width,top:element.y/12/pageSize.height,
   width:element.sx/12/pageSize.width,height:element.sy/12/pageSize.height};
 },
 point(clientX,clientY,imageRect){
  return {x:(clientX-imageRect.left)/imageRect.width,y:(clientY-imageRect.top)/imageRect.height};
 },
 contains(rect,point){
  return rect.left<=point.x&&rect.top<=point.y&&point.x<rect.left+rect.width&&point.y<rect.top+rect.height;
 },
 eventIndex(events,second){
  for(let i=events.length-1;i>=0;i--)if(events[i].position<=second*1000)return i;
  return -1;
 }
});
