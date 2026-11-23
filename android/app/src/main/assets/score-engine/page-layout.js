/* Reuse the engraving and keep a shared coordinate transform for every layout. */
const scoreLayout = (() => {
 const root = document.getElementById('pages');
 const singleLine = 0, vertical = 1, paged = 2;
 let original = [], sections = [], systems = new Map(), bounds = new Map();
 let mode = vertical, appliedMode = null;

 function setSize() {
  const scale = zoom();
  const width = document.documentElement.clientWidth || innerWidth;
  root.style.setProperty('--score-page-width', width + 'px');
  root.style.setProperty('--score-viewport-width', width / scale + 'px');
  root.style.setProperty('--score-page-gutter', Math.max(0, (width / scale - width) / 2) + 'px');
 }

 function reset(value = vertical) {
  original = [];
  sections = [];
  systems.clear();
  bounds.clear();
  noteHints.setPages([], []);
  mode = normalizeMode(value);
  appliedMode = null;
 }

 function capture() {
  original = Array.from(root.children, section => ({
   section,
   image: section.querySelector('img,svg'),
   top: 0,
  }));
  setSize();
  for (const [page, item] of original.entries()) {
   if (item.image.localName !== 'svg') continue;
   const ink = inkBounds(item.image);
   if (ink) bounds.set(page, ink);
  }
  render();
 }

 function prepareSvg(svg) {
  if (svg.hasAttribute('viewBox')) return;
  const width = parseFloat(svg.getAttribute('width'));
  const height = parseFloat(svg.getAttribute('height'));
  if (width > 0 && height > 0) svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
 }

 function inkBounds(svg) {
  const paper = svg.getBoundingClientRect();
  if (!(paper.width && paper.height)) return null;
  let top = 1, bottom = 0;
  const tolerance = Math.min(paper.width, paper.height) * 0.002;
  for (const child of svg.children) {
   const box = child.getBoundingClientRect();
   if (!(box.width || box.height)) continue;
   // MuseScore exports the white page background as a full-size SVG path.
   if (box.top <= paper.top + tolerance && box.bottom >= paper.bottom - tolerance &&
       box.left <= paper.left + tolerance && box.right >= paper.right - tolerance &&
       getComputedStyle(child).fill === 'rgb(255, 255, 255)') continue;
   top = Math.min(top, (box.top - paper.top) / paper.height);
   bottom = Math.max(bottom, (box.bottom - paper.top) / paper.height);
  }
  return bottom > top ? {top: Math.max(0, top - 0.015), bottom: Math.min(1, bottom + 0.015)} : null;
 }

 function crop(item, top, bottom, aspect) {
  const {section, image} = item;
  const height = bottom - top;
  item.top = top;
  section.style.aspectRatio = height < 1 ? String(aspect / height) : '';
  image.style.position = height < 1 ? 'absolute' : '';
  image.style.top = height < 1 ? -top / height * 100 + '%' : '';
  image.style.height = height < 1 ? 100 / height + '%' : '';
  section.style.setProperty('--note-hints-top', image.style.top || '0%');
  section.style.setProperty('--note-hints-height', image.style.height || '100%');
 }

 function aspectRatio(image) {
  if (image.naturalWidth && image.naturalHeight) return image.naturalWidth / image.naturalHeight;
  const rect = image.getBoundingClientRect();
  if (rect.width && rect.height) return rect.width / rect.height;
  const size = positions?.pageSize;
  return size?.width && size?.height ? size.width / size.height : 0;
 }

 function rowKey(element) {
  return element.page + ':' + element.y;
 }

 function renderSystems() {
  const rows = new Map();
  if (!positions?.pageSize) return;
  for (const element of positions.elements) {
   const box = scoreCursor.rectangle(element);
   if (!box || !(box.height > 0 && box.top >= 0 && box.top < 1)) continue;
   const key = rowKey(element);
   const row = rows.get(key);
   if (row) row.bottom = Math.max(row.bottom, box.top + box.height);
   else rows.set(key, {key, page:element.page, top:box.top, bottom:box.top + box.height});
  }
  for (const row of [...rows.values()].sort((a, b) => a.page - b.page || a.top - b.top)) {
   const source = original[row.page]?.image;
   if (source?.localName === 'img' && !source.hasAttribute('src')) continue;
   const aspect = source && aspectRatio(source);
   if (!aspect) continue;
   const section = document.createElement('section'), image = source.cloneNode(true);
   section.dataset.page = String(row.page);
   section.append(image);
   const item = {section, image, top:0};
   crop(item, Math.max(0, row.top - 0.012), Math.min(1, row.bottom + 0.025), aspect);
   systems.set(row.key, item);
  }
 }

 function render() {
  systems.clear();
  root.dataset.layout = String(mode);
  setSize();
  for (const item of original) crop(item, 0, 1, 1);
  root.replaceChildren(...original.map(item => item.section));
  if (mode === singleLine) renderSystems();
  sections = original;
  if (systems.size) {
   const byPage = new Map();
   for (const item of systems.values()) {
    const page = Number(item.section.dataset.page);
    if (!byPage.has(page)) byPage.set(page, []);
    byPage.get(page).push(item);
   }
   sections = original.flatMap((item, page) => byPage.get(page) || [item]);
  }
  if (systems.size) root.replaceChildren(...sections.map(item => item.section));
  if (mode === vertical) cropPages();
  root.dataset.layout = String(mode === singleLine && !systems.size ? vertical : mode);
  noteHints.setPages(original.map(item => item.image), sections);
  appliedMode = mode;
 }

 function cropPages() {
  for (const [page, range] of bounds) {
   const item = original[page];
   if (!item) continue;
   const aspect = aspectRatio(item.image);
   if (aspect) crop(item, range.top, range.bottom, aspect);
  }
 }

 function updateBounds(ink) {
  if (!ink.size) return;
  bounds = ink;
  if (mode === vertical) keepAnchor(cropPages);
 }

 function geometry(element) {
  const item = systems.size ? systems.get(rowKey(element)) : original[element.page];
  if (!item) return null;
  const rect = item.image.getBoundingClientRect();
  if (!(rect.width && rect.height)) return null;
  const scale = zoom();
  return {...item, rect, width:rect.width / scale, height:rect.height / scale};
 }

 function sectionAtViewport() {
  const horizontal = root.dataset.layout !== String(vertical);
  const axis = horizontal ? 'right' : 'bottom';
  // Choose the first visible section, ignoring the rounded document scroll offset.
  let low = 0, high = sections.length;
  while (low < high) {
   const mid = (low + high) >>> 1;
   if (sections[mid].section.getBoundingClientRect()[axis] <= 1) low = mid + 1;
   else high = mid;
  }
  return sections[Math.min(low, sections.length - 1)];
 }

 function visiblePage() {
  return Number(sectionAtViewport()?.section.dataset.page);
 }

 function goToPage(page) {
  const item = sections.find(({section}) => Number(section.dataset.page) === page);
  if (!item) return;
  const box = item.section.getBoundingClientRect();
  if (root.dataset.layout === String(vertical)) {
   scrollTo(0, page === 0 ? 0 : scrollY + box.top);
  } else {
   const gutter = isPaged() ? Math.max(0, (innerWidth - box.width) / 2) : 0;
   scrollTo(Math.max(0, scrollX + box.left - gutter), 0);
  }
 }

 function keepAnchor(change, x = innerWidth / 2, y = innerHeight / 2, targetX = x, targetY = y) {
  const section = document.elementFromPoint(x, y)?.closest('#pages > section');
  const anchor = section?.querySelector('img,svg') || root;
  const before = anchor.getBoundingClientRect();
  change();
  if (!before.width || !before.height || !anchor.isConnected) return;
  const after = anchor.getBoundingClientRect();
  scrollBy(after.left + (x - before.left) * after.width / before.width - targetX,
           after.top + (y - before.top) * after.height / before.height - targetY);
 }

 function normalizeMode(value) {
  const number = Number(value);
  return [singleLine, vertical, paged].includes(number) ? number : vertical;
 }

 function apply(value) {
  mode = normalizeMode(value);
  if (appliedMode === mode) return;
  refreshContent();
 }

 function refreshContent() {
  const page = visiblePage();
  render();
  if (Number.isFinite(page)) goToPage(page);
 }

 function zoom() {
  return Number(root.style.zoom) || 1;
 }

 function setZoom(scale, x, y, targetX, targetY) {
  keepAnchor(() => {
   root.style.zoom = String(scale);
   setSize();
  }, x, y, targetX, targetY);
 }

 function isPaged() {
  return mode === paged;
 }

 return {reset, capture, apply, refreshSingleLine:() => {if (mode === singleLine) refreshContent();}, geometry, inkBounds, updateBounds, visiblePage, goToPage,
  isPaged, zoom, setZoom, prepareSvg, refresh:() => keepAnchor(setSize), geometryKey: element => systems.size ? rowKey(element) : element.page};
})();
