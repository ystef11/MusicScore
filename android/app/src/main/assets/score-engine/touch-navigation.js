/* Handle score panning and pinch zoom without the WebView's own page zoom. */
(() => {
 const root = document.getElementById('pages'), points = new Map();
 let pinch = null;
 root.addEventListener('contextmenu', event => event.preventDefault());

 function measurePinch() {
  const [a,b] = points.values();
  return {distance:Math.hypot(a.x-b.x,a.y-b.y), x:(a.x+b.x)/2, y:(a.y+b.y)/2};
 }

 root.addEventListener('pointerdown', event => {
  if (event.pointerType !== 'touch' || points.size >= 2 ||
      (!points.size && event.target.closest?.('#cursor,[data-loop-handle]'))) return;
  points.set(event.pointerId, {
   x:event.clientX, y:event.clientY, startX:event.clientX, startY:event.clientY,
   startPage:scoreLayout.visiblePage(), moved:false, pinched:false,
  });
  root.setPointerCapture(event.pointerId);
  if (points.size === 2) {
   for (const point of points.values()) point.pinched = true;
   loopSelection.cancelGesture();
   scoreCursor.cancelTap();
   const {distance,x,y} = measurePinch();
   pinch = {distance,x,y,size:noteSize};
   emit('cursorInteraction');
  }
 }, true);

 root.addEventListener('pointermove', event => {
  const point = points.get(event.pointerId);
  if (!point) return;
  const dx = point.x - event.clientX, dy = point.y - event.clientY;
  point.x = event.clientX;
  point.y = event.clientY;
  if (pinch) {
   event.preventDefault();
   if (pinch.distance) {
    const {distance,x,y} = measurePinch();
    commands.setNoteSize(pinch.size * distance / pinch.distance, pinch.x, pinch.y, x, y);
    pinch.x = x;
    pinch.y = y;
   }
   return;
  }
  if (loopSelection.isSelecting()) return;
  if (!point.moved) {
   if (Math.hypot(point.x - point.startX, point.y - point.startY) <= 8) return;
   point.moved = true;
   emit('cursorInteraction');
  }
  loopSelection.cancelGesture();
  scoreCursor.cancelTap();
  event.preventDefault();
  scrollBy(dx,dy);
 }, true);

 function end(event) {
  const point = points.get(event.pointerId);
  if (!point) return;
  points.delete(event.pointerId);
  pinch = null;
  if (event.type==='pointerup' && point.moved && !point.pinched &&
      scoreLayout.isPaged() && scoreLayout.zoom() <= 1) {
   const dx = point.x - point.startX, dy = point.y - point.startY;
   const direction = Math.abs(dx) > Math.max(32, Math.abs(dy)) ? Math.sign(dx) : 0;
   if (Number.isFinite(point.startPage)) commands.setPage(point.startPage-direction);
  }
 }
 document.addEventListener('pointerup', end, true);
 document.addEventListener('pointercancel', end, true);
})();
