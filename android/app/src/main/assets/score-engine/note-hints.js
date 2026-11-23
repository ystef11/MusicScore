/* Derive written pitches from the engraving, including catalog SVG pages. */
const noteHints = (() => {
 const namespace = 'http://www.w3.org/2000/svg';
 const names = 'CDEFGAB';
 const signs = {'-2':'♭♭', '-1':'♭', 0:'', 1:'♯', 2:'𝄪'};
 const root = document.getElementById('pages');
 let sources = [], sections = [], observer;
 const cache = new WeakMap();
 const pathNumber = '[+-]?(?:\\d*\\.\\d+|\\d+\\.?)(?:[eE][+-]?\\d+)?';
 const relativeMove = new RegExp('^m\\s*('+pathNumber+')[\\s,]*('+pathNumber+')(.*)$','s');

 function transformBox(element, box, svg) {
  let matrix = new DOMMatrix();
  for (let node = element; node !== svg; node = node.parentElement) {
   const own = node.transform?.baseVal.consolidate()?.matrix;
   if (own) matrix = new DOMMatrix([own.a, own.b, own.c, own.d, own.e, own.f]).multiply(matrix);
  }
  const [a,b,c,d] = [
   [box.x, box.y], [box.x + box.width, box.y],
   [box.x, box.y + box.height], [box.x + box.width, box.y + box.height],
  ].map(([x,y]) => matrix.transformPoint({x,y}));
  return {
   left: Math.min(a.x,b.x,c.x,d.x), right: Math.max(a.x,b.x,c.x,d.x),
   top: Math.min(a.y,b.y,c.y,d.y), bottom: Math.max(a.y,b.y,c.y,d.y),
  };
 }

 function shapes(svg, probe, selector, {withStart,withHoles} = {}) {
  const boxes = [];
  for (const element of svg.querySelectorAll(selector)) {
   // The catalog SVG can pack many standalone glyphs into one path.
   const contours = element.getAttribute('d')?.match(/[Mm][^Mm]*/g);
   if (contours) {
    const parts = [];
    for (let contour of contours) {
     if (contour[0] === 'm' && parts.length) {
      // A packed path can place the next glyph relative to the previous contour.
      const move = relativeMove.exec(contour);
      if (!move) continue;
      const end = probe.getPointAtLength(probe.getTotalLength());
      const rest = move[3].trimStart();
      const line = rest && !/^[a-z]/i.test(rest) ? 'l' : '';
      contour = 'M'+(end.x+Number(move[1]))+','+(end.y+Number(move[2]))+line+rest;
     }
     probe.setAttribute('d', contour);
     const box = transformBox(element, probe.getBBox(), svg);
     if (withStart) {
      const {x,y} = probe.getPointAtLength(0);
      box.startY = transformBox(element,{x,y,width:0,height:0},svg).top;
     }
     parts.push(box);
    }
    // Interior outlines of hollow notes, clefs and accidentals are holes.
    const encloses = (outer,part) => outer.left < part.left && outer.right > part.right &&
     outer.top < part.top && outer.bottom > part.bottom;
    for (const part of parts) {
     if (parts.some(outer => encloses(outer,part))) continue;
     if (withHoles) part.holes = parts.filter(hole => encloses(part,hole));
     boxes.push(part);
    }
   } else {
    const values = (element.getAttribute('points') || '').trim().split(/[\s,]+/).map(Number);
    if (values.length === 4 && values.every(Number.isFinite)) {
     const [x1,y1,x2,y2] = values;
     boxes.push(transformBox(element, {
      x: Math.min(x1,x2), y: Math.min(y1,y2), width: Math.abs(x2-x1), height: Math.abs(y2-y1),
     }, svg));
    }
   }
  }
  return boxes;
 }

 function stavesFromLines(lines) {
  const spans = new Map();
  for (const {left,right,top,bottom} of lines) {
   if (right-left < 5 || bottom-top > 0.5) continue;
   const key = Math.round(left*10) + ':' + Math.round(right*10);
   if (!spans.has(key)) spans.set(key, []);
   spans.get(key).push({left,right,top});
  }
  const staves = [];
  for (const span of spans.values()) {
   span.sort((a,b) => a.top-b.top);
   for (let i=0; i+4<span.length; i++) {
    const {left,right,top} = span[i];
    const space = (span[i+4].top-top)/4;
    if (space < 2 || !span.slice(i+1,i+4).every((line,j) =>
     Math.abs(line.top-top-(j+1)*space) < space*0.08)) continue;
    const existing = staves.find(staff => Math.abs(staff.top-top)<space*0.08 &&
     Math.abs(staff.space-space)<space*0.08 && staff.right+space>=left && right+space>=staff.left);
    if (existing) {
     existing.left = Math.min(existing.left,left);
     existing.right = Math.max(existing.right,right);
    } else {
     staves.push({left,right,top,space,clefs:[],keys:[],bars:[],notes:[],accidentals:[]});
    }
    i+=4;
   }
  }
  return staves;
 }

 function staffAt(staves, x, y, maxLedgerSpaces = 5) {
  let closest, distance = Infinity;
  for (const staff of staves) {
   if (x < staff.left-staff.space || x > staff.right+staff.space) continue;
   const offset = Math.abs(y-staff.top-2*staff.space)/staff.space;
   if (offset < distance && offset <= 2+maxLedgerSpaces) {
    closest = staff;
    distance = offset;
   }
  }
  return closest;
 }

 function bassClefAnchor(body, boxes, staff) {
  const {space,top} = staff;
  const dots = boxes.filter(dot => {
   const width = dot.right-dot.left, height = dot.bottom-dot.top;
   return dot.left > body.right-space*0.25 && dot.left < body.right+space*0.8 &&
    dot.top >= body.top-space*0.25 && dot.bottom <= body.bottom &&
    width >= space*0.14 && width <= space*0.6 && height >= width*0.7 && height <= width*1.4;
  }).map(dot => ({x:(dot.left+dot.right)/2, y:(dot.top+dot.bottom)/2}));
  for (const upper of dots) for (const lower of dots) {
   const gap = (lower.y-upper.y)/space;
   if (gap < 0.65 || gap > 1.3 || Math.abs(upper.x-lower.x)>space*0.2) continue;
   const anchor = (upper.y+lower.y)/2;
   const line = (anchor-top)/space;
   if (Math.abs(line-Math.round(line))<=0.2) return anchor;
  }
 }

 function addClefs(staves, boxes) {
  for (const box of boxes) {
   const height = box.bottom-box.top, width = box.right-box.left;
   const ratio = width/height;
   const staff = staffAt(staves, box.left, (box.top+box.bottom)/2, 1.5);
   if (!staff || height < staff.space*2.3) continue;
   // The two bass-clef dots bracket the F line independently of the font.
   let pitch, anchor;
   const bassAnchor = height < staff.space*4.5 ? bassClefAnchor(box,boxes,staff) : undefined;
   if (bassAnchor !== undefined) {
    pitch = 24; anchor = bassAnchor; // F3
   } else if (ratio > 0.28 && ratio < 0.43 && height > staff.space*4.2) {
    pitch = 32; anchor = box.top + height*0.625; // G4
   } else if (ratio >= 0.53 && ratio < 0.85 && height < staff.space*4.2) {
    pitch = 24; anchor = box.top + height*0.289; // F3
   } else if (ratio >= 0.43 && ratio < 0.53 && height < staff.space*4.2) {
    pitch = 28; anchor = (box.top+box.bottom)/2; // C4
   }
   const line = Math.round((anchor-staff.top)/staff.space);
   if (pitch === undefined || !(line >= 0 && line <= 4) ||
    Math.abs(anchor-staff.top-line*staff.space) > staff.space*0.2) continue;
   staff.clefs.push({x:box.left, topPitch:pitch+2*line});
  }
  for (const staff of staves) staff.clefs.sort((a,b) => a.x-b.x);
 }

 function accidental(box, space) {
  const width = (box.right-box.left)/space, height = (box.bottom-box.top)/space;
  // The flat's opening is below the center of its full outline.
  const holeCenters = box.holes?.map(hole => (hole.top+hole.bottom)/2) || [];
  if (height > 2.25 && height < 2.9 && holeCenters.length && holeCenters.length <= 2 &&
   holeCenters.every(y => (y-box.top)/(box.bottom-box.top)>0.62)) {
   const y = holeCenters.reduce((sum,value) => sum+value,0)/holeCenters.length;
   return {x:box.left, right:box.right, y, alter:-holeCenters.length};
  }
  let alter, anchor = 0.5;
  if (height > 0.85 && height < 1.25 && width > 0.85 && width < 1.3) alter = 2;
  if (height > 2.25 && height < 2.9) {
   if (width > 0.58 && width < 0.74) alter = 0;
   if (width >= 0.74 && width < 0.89) {alter = -1; anchor = 0.72}
   if (width >= 0.89 && width < 1.10) alter = 1;
   if (width > 1.30 && width < 1.65) {alter = -2; anchor = 0.72}
  }
  if (alter !== undefined) return {x:box.left, right:box.right, y:box.top+height*space*anchor, alter};
 }

 function addAccidentals(staves, boxes, inKey) {
  for (const box of boxes) {
   const staff = staffAt(staves, box.left, (box.top+box.bottom)/2);
   if (!staff) continue;
   const mark = accidental(box,staff.space);
   if (mark) (inKey ? staff.keys : staff.accidentals).push(mark);
  }
 }

 function connectTies(staves, boxes) {
  for (const box of boxes) for (const staff of staves) {
   const {space, bars, notes} = staff;
   if (!bars.some(bar => bar > box.left && bar < box.right)) continue;
   const nearby = (note,x) => Math.abs(note.x-x)<space*1.3 &&
    Math.abs(note.y-box.startY)<space*1.05;
   const pairs = notes.filter(note => nearby(note,box.left)).flatMap(start => notes
    .filter(end => nearby(end,box.right) && Math.abs(end.y-start.y)<space*0.2)
    .map(end => ({start,end})));
   const distance = ({start,end}) => Math.abs(start.x-box.left)+Math.abs(end.x-box.right) +
    Math.abs(Math.abs(start.y-box.startY)-space*0.7);
   const match = pairs.sort((a,b) => distance(a)-distance(b))[0];
   if (match) match.end.tiedFrom = match.start;
  }
 }

 function nameNotes(staff) {
  const {space, top, clefs, notes, keys, bars, accidentals} = staff;
  const pitch = (y, clef) => clef.topPitch - Math.round((y-top)/(space/2));
  const letter = value => (value%7+7)%7;
  // Attach each sign to the following head at the same staff position.
  const orderedNotes = notes.sort((a,b) => a.x-b.x || a.y-b.y);
  for (const mark of accidentals) {
   const note = orderedNotes.find(note =>
    note.x >= mark.right && note.x-mark.right < space*5 &&
    Math.abs(note.y-mark.y) < space*0.22 &&
    !bars.some(bar => bar > mark.right && bar < note.x));
   if (note) note.alter = mark.alter;
  }
  const events = [
   ...clefs.map(clef => ({...clef, type:'clef'})),
   ...bars.map(x => ({x, type:'bar'})),
   ...keys.map(key => ({...key, type:'key'})),
   ...orderedNotes.map(note => ({x:note.x,y:note.y,note,type:'note'})),
  ].sort((a,b) => a.x-b.x || a.y-b.y);
  let clef, lastKey, key = new Map();
  const overrides = new Map(), labels = [], written = new Map();
  for (const event of events) {
   if (event.type === 'clef') {
    clef = event;
   } else if (event.type === 'bar') {
    overrides.clear();
   } else if (clef && event.type === 'key') {
    if (!lastKey || event.x-lastKey.right > space*1.5) key = new Map();
    key.set(letter(pitch(event.y,clef)),event.alter);
    lastKey = event;
    overrides.clear();
   } else if (clef && event.type === 'note') {
    const value = pitch(event.y,clef), index = letter(value);
    const note = event.note;
    if (note.alter !== undefined) overrides.set(value,note.alter);
    const previous = written.get(note.tiedFrom);
    const tiedAlter = previous?.value === value ? previous.alter : undefined;
    const alter = note.alter ?? tiedAlter ?? overrides.get(value) ?? key.get(index) ?? 0;
    written.set(note,{value,alter});
    labels.push({x:note.x, top:note.top, label:names[index]+signs[alter], space});
   }
  }
  return labels;
 }

 function read(svg) {
  const paper = svg.viewBox.baseVal;
  const width = paper.width || parseFloat(svg.getAttribute('width'));
  const height = paper.height || parseFloat(svg.getAttribute('height'));
  if (!(width>0 && height>0)) return null;
  const host = document.createElementNS(namespace,'svg');
  const probe = document.createElementNS(namespace,'path');
  host.style.cssText = 'position:fixed;width:0;height:0;visibility:hidden;pointer-events:none';
  host.append(probe);
  document.body.append(host);
  try {
   const staves = stavesFromLines(shapes(svg,probe,'.StaffLines'));
   if (!staves.length) return null;
   addClefs(staves,shapes(svg,probe,'.Clef'));
   addAccidentals(staves,shapes(svg,probe,'.KeySig',{withHoles:true}),true);
   addAccidentals(staves,shapes(svg,probe,'.Accidental',{withHoles:true}),false);
   for (const box of shapes(svg,probe,'.BarLine')) {
    const x = (box.left+box.right)/2;
    for (const staff of staves) {
     if (x>=staff.left && x<=staff.right && box.top<=staff.top+staff.space*0.25 &&
      box.bottom>=staff.top+staff.space*3.75 && box.right-box.left<staff.space) staff.bars.push(x);
    }
   }
   const seen = new Set();
   for (const box of shapes(svg,probe,'.Note,.NoteHead')) {
    const x = (box.left+box.right)/2, y = (box.top+box.bottom)/2;
    const staff = staffAt(staves,x,y);
    if (!staff) continue;
    const step = (y-staff.top)/(staff.space/2);
    if (Math.abs(step-Math.round(step))>0.28) continue;
    const id = Math.round(x*10)+':'+Math.round(y*10);
    if (seen.has(id)) continue;
    seen.add(id);
    staff.notes.push({x,y,top:box.top});
   }
   connectTies(staves,shapes(svg,probe,'.TieSegment',{withStart:true}));
   const labels = staves.flatMap(nameNotes);
   return {viewBox:[paper.x,paper.y,width,height].join(' '), width, labels};
  } finally {
   host.remove();
  }
 }

 function overlay(data) {
  const svg = document.createElementNS(namespace,'svg');
  svg.setAttribute('viewBox',data.viewBox);
  svg.setAttribute('class','note-hints');
  svg.setAttribute('aria-hidden','true');
  const placed = [];
  for (const note of data.labels) {
   const size = Math.max(note.space*1.15,data.width*0.016);
   const halfWidth = size*note.label.length*0.34;
   let y = note.top-size*0.29;
   for (const other of placed) {
    if (Math.abs(note.x-other.x) < halfWidth+other.halfWidth && Math.abs(y-other.y) < size) {
     y = other.y-size;
    }
   }
   placed.unshift({x:note.x,y,halfWidth});
   const text = document.createElementNS(namespace,'text');
   text.setAttribute('x',note.x);
   text.setAttribute('y',y);
   text.setAttribute('font-size',size);
   text.setAttribute('stroke-width',size*0.15);
   text.textContent = note.label;
   svg.append(text);
  }
  return svg;
 }

 async function load(source, url) {
  if (source.localName === 'svg') return read(source);
  if (!url || !/\.svg(?:[?#]|$)/i.test(url)) return null;
  const response = await fetch(url);
  if (!response.ok && response.status !== 0) return null;
  const svg = new DOMParser().parseFromString(await response.text(),'image/svg+xml').documentElement;
  // Only path geometry is passed to the measurement probe. The fetched SVG stays detached.
  return svg.localName === 'svg' ? read(svg) : null;
 }

 async function draw(section) {
  const page = Number(section.dataset.page), source = sources[page];
  if (!source || section.querySelector('.note-hints')) return;
  const url = source.getAttribute('src');
  if (source.localName === 'img' && section.querySelector('img')?.getAttribute('src') !== url) return;
  let result = cache.get(source);
  if (!result || result.url !== url) {
   result = {url, data:load(source,url).catch(error => {
    console.warn('Note names:',error);
    return null;
   })};
   cache.set(source,result);
  }
  const data = await result.data;
  if (data?.labels.length && section.isConnected && source === sources[page] &&
   url === source.getAttribute('src') && !section.querySelector('.note-hints')) section.append(overlay(data));
 }

 function watch() {
  observer?.disconnect();
  if (!root.hasAttribute('data-note-hints')) return;
  observer ||= new IntersectionObserver(entries => {
   for (const entry of entries) if (entry.isIntersecting) {
    observer.unobserve(entry.target);
    void draw(entry.target);
   }
  }, {rootMargin:'450px'});
  for (const section of sections) observer.observe(section);
 }

 return {
  setEnabled(value) {
   root.toggleAttribute('data-note-hints',!!value);
   watch();
  },
  setPages(images, items) {
   sources = images;
   sections = items.map(({section}) => section);
   watch();
  },
  updatePage(page) {
   for (const section of sections) if (Number(section.dataset.page)===page) {
    section.querySelector('.note-hints')?.remove();
    if (root.hasAttribute('data-note-hints')) {
     observer.unobserve(section);
     observer.observe(section);
    }
   }
  },
 };
})();
