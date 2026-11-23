/* Measure rectangles include clefs/key signatures. Anchor system starts to actual SVG glyphs. */
const noteAnchors=(()=>{
 let anchors=new Map();
 // Measure geometry from archive pages without attaching their active content.
 const geometryTags=new Set(['svg','g','path','rect','circle','ellipse','line','polygon','polyline','text','tspan']);
 const geometryAttributes=new Set([
  'viewBox','preserveAspectRatio','width','height','x','y','x1','x2','y1','y2','cx','cy','r','rx','ry',
  'd','dx','dy','points','transform','class','stroke-width','font-family','font-size','font-weight','text-anchor',
  'fill','stroke',
 ]);
 function keepGeometry(svg){
  for(const node of [svg,...svg.querySelectorAll('*')]){
   if(node.namespaceURI!=='http://www.w3.org/2000/svg'||!geometryTags.has(node.localName)){
    node.remove();
    continue;
   }
   for(const attribute of [...node.attributes]){
    if(attribute.namespaceURI||!geometryAttributes.has(attribute.name)||
       (['fill','stroke'].includes(attribute.name)&&
        !/^(?:[a-z]+|#[0-9a-f]{3,8}|(?:rgb|hsl)a?\([0-9.,%+\s-]+\))$/i.test(attribute.value.trim()))){
     node.removeAttributeNode(attribute);
    }
   }
  }
 }
 async function prepare(urls,map,token,isCurrent,imported){
  const result=new Map(), bounds=new Map();
  async function measure(url,page){
   if(!url)return;
   let host;
   try{
    const text=await(await fetch(url)).text();if(!isCurrent(token))return;
    const doc=new DOMParser().parseFromString(text,'image/svg+xml'),svg=doc.documentElement;
    if(svg.localName!=='svg')return;
    scoreLayout.prepareSvg(svg);
    if(imported){
     if(svg.namespaceURI!=='http://www.w3.org/2000/svg')return;
     keepGeometry(svg);
    }else{
     svg.querySelectorAll('script,foreignObject,image,use').forEach(node=>node.remove());
     for(const node of [svg,...svg.querySelectorAll('*')])for(const attr of [...node.attributes])if(/^on/i.test(attr.name))node.removeAttribute(attr.name);
    }
    host=document.createElement('div');host.style.cssText='position:fixed;left:0;top:0;width:1000px;visibility:hidden;pointer-events:none';
    host.append(document.importNode(svg,true));document.body.append(host);
    const root=host.firstElementChild,rect=root.getBoundingClientRect();if(!rect.width||!rect.height)return;
    const ink=scoreLayout.inkBounds(root);if(ink)bounds.set(page,ink);
    if(!map?.pageSize)return;
    const glyphs=[...root.querySelectorAll('.Note,.NoteHead,.Rest')].map(node=>node.getBoundingClientRect()).filter(r=>r.width>0&&r.height>0).map(r=>({x:(r.left+r.width/2-rect.left)/rect.width,y:(r.top+r.height/2-rect.top)/rect.height}));
    const elements=map.elements.filter(e=>e.page===page);
    for(const element of elements){
     if(elements.some(e=>e.y===element.y&&e.x<element.x))continue;
     const box=webScoreCoordinates.rectangle(element,map.pageSize);if(!box)continue;
     const candidates=glyphs.filter(p=>webScoreCoordinates.contains(box,p));
     if(candidates.length)result.set(element.id,Math.min(...candidates.map(p=>p.x)));
    }
   }catch(_){/* Missing glyph geometry leaves the verified web rectangle unchanged. */}
   finally{host?.remove()}
  }
  for(let start=0;start<urls.length&&isCurrent(token);start+=4){
   await Promise.all(urls.slice(start,start+4).map((url,index)=>measure(url,start+index)));
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(isCurrent(token))anchors=result;
  return bounds;
 }
 function adjust(element,box){
  const first=anchors.get(element.id);if(first===undefined||first<=box.left||first>=box.left+box.width)return box;
  return {...box,left:first,width:box.left+box.width-first};
 }
 return {prepare,adjust,reset(){anchors=new Map()}};
})();
