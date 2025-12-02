const preview = document.getElementById('preview');
const btnGenerate = document.getElementById('btn-generate');

/* -------------------------
   Grid selection (random)
   - currentGrid holds the chosen grid object { cols, rows } (single-layer)
   ------------------------- */
let currentGridIndex = 2;
let currentGrid = Array.isArray(window.grids) && window.grids[currentGridIndex]
  ? window.grids[currentGridIndex]
  : { cols: 4, rows: 6 };

function pickRandomGrid() {
  if (!Array.isArray(window.grids) || window.grids.length === 0) return;
  currentGridIndex = Math.floor(Math.random() * window.grids.length);
  currentGrid = window.grids[currentGridIndex];
  preview.dataset.gridIndex = currentGridIndex;
}

/* -------------------------
   Small helpers
   ------------------------- */
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* -------------------------
   Read input modules
   ------------------------- */
function getTextModules() {
  const modules = [];
  const headline = document.getElementById('headline').value.trim();
  if (headline) modules.push({ key: 'headline', value: headline, weight: 900 });
  const sub = document.getElementById('sub').value.trim();
  if (sub) modules.push({ key: 'sub', value: sub, weight: 500 });
  const info = document.getElementById('info').value.trim();
  if (info) modules.push({ key: 'info', value: info, weight: 300 });
  const date = document.getElementById('date').value.trim();
  if (date) modules.push({ key: 'date', value: date, weight: 200 });
  return modules;
}

/* -------------------------
   Grid drawing + fitting
   ------------------------- */
function drawGrid() {
  preview.querySelectorAll('.grid-line').forEach(el => el.remove());

  const cols = currentGrid.cols;
  for (let i = 1; i < cols; i++) {
    const col = document.createElement('div');
    col.className = 'grid-line grid-col';
    col.style.width = '1px';
    col.style.height = preview.clientHeight + 'px';
    col.style.background = 'rgba(0,0,255,0.12)';
    col.style.position = 'absolute';
    col.style.left = (i * preview.clientWidth / cols) + 'px';
    col.style.top = '0';
    col.style.pointerEvents = 'none';
    preview.appendChild(col);
  }

  const rows = currentGrid.rows;
  for (let r = 1; r < rows; r++) {
    const row = document.createElement('div');
    row.className = 'grid-line grid-row';
    row.style.height = '1px';
    row.style.width = preview.clientWidth + 'px';
    row.style.background = 'rgba(0,0,255,0.12)';
    row.style.position = 'absolute';
    row.style.top = (r * preview.clientHeight / rows) + 'px';
    row.style.left = '0';
    row.style.pointerEvents = 'none';
    preview.appendChild(row);
  }
}

function fitAllModules() {
  preview.querySelectorAll('.text-block').forEach(el => {
    if (typeof fitModuleToGrid === 'function') {
      fitModuleToGrid(el, preview, currentGrid.cols, currentGrid.rows);
    }
  });
}

/* -------------------------
   Decorative repeating text (stores placement data)
   ------------------------- */
function createRepeatingText(modules, previewEl, grid) {
  const cols = grid.cols;
  const rows = grid.rows;
  const cellW = previewEl.clientWidth / cols;
  const cellH = previewEl.clientHeight / rows;

  const source = modules.length ? modules.map(m => m.value) : ['repeat'];
  const count = randInt(4, 12);

  for (let i = 0; i < count; i++) {
    const txt = choice(source);
    const el = document.createElement('div');
    el.className = 'repeat-text';
    el.innerText = txt;

    const fs = randInt(8, 18);
    el.style.position = 'absolute';
    el.style.fontSize = fs + 'px';
    // el.style.opacity = (Math.random() * 0.45 + 0.12).toFixed(2);
    el.style.pointerEvents = 'none';
    el.style.color = '#000'; 
    el.style.fontFamily = 'Arial Black, sans-serif';
    el.style.whiteSpace = 'nowrap';
    el.style.transform = `translate(-50%,-50%) rotate(${Math.random() < 0.2 ? 90 : 0}deg)`;

    const col = randInt(0, Math.max(0, cols - 1));
    const row = randInt(0, Math.max(0, rows - 1));
    const jitterX = (Math.random() - 0.5) * (cellW * 0.2);
    const jitterY = (Math.random() - 0.5) * (cellH * 0.2);

    // store placement so we can reposition on resize
    el.dataset.col = col;
    el.dataset.row = row;
    el.dataset.jitterX = jitterX;
    el.dataset.jitterY = jitterY;
    el.dataset.rot = Math.random() < 0.2 ? '90' : '0';

    previewEl.appendChild(el);
  }
}

/* -------------------------
   Reposition repeats after resize/redraw
   ------------------------- */
function repositionRepeats() {
  const cols = currentGrid.cols;
  const rows = currentGrid.rows;
  const cellW = preview.clientWidth / cols;
  const cellH = preview.clientHeight / rows;

  preview.querySelectorAll('.repeat-text').forEach(el => {
    const col = parseInt(el.dataset.col, 10) || 0;
    const row = parseInt(el.dataset.row, 10) || 0;
    const jitterX = parseFloat(el.dataset.jitterX) || 0;
    const jitterY = parseFloat(el.dataset.jitterY) || 0;
    const rot = el.dataset.rot === '90' ? 90 : 0;

    const left = Math.round(col * cellW + cellW / 2 + jitterX);
    const top = Math.round(row * cellH + cellH / 2 + jitterY);

    el.style.left = left + 'px';
    el.style.top = top + 'px';
    el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
    el.style.zIndex = '0'; // keep repeats behind main text
  });
}

/* -------------------------
   Generate handler
   ------------------------- */
btnGenerate.addEventListener('click', () => {
  // keep controls like resize handle; remove previous content lines and repeats
  preview.querySelectorAll('.text-block, .grid-line, .repeat-text').forEach(el => el.remove());

  const modules = getTextModules();
  if (modules.length === 0) {
    alert('Bitte mindestens ein Textfeld ausfüllen!');
    return;
  }

  pickRandomGrid();
  drawGrid();

  // place main modules (placement.js provides placeModuleOnGrid)
  modules.forEach(module => placeModuleOnGrid(module, preview, currentGrid.cols, currentGrid.rows));

  // fit them precisely
  fitAllModules();

  // ensure any existing repeats are repositioned (safe)
  repositionRepeats();

  // optionally add repeating decorative text
  if (Math.random() < 0.7) createRepeatingText(modules, preview, currentGrid);

  // position repeats after creation
  repositionRepeats();
});

/* -------------------------
   Preview initial size & style
   ------------------------- */
preview.style.position = 'absolute';
preview.style.left = '50px';
preview.style.top = '50px';
preview.style.width = '300px';
preview.style.height = '450px';
preview.style.cursor = 'grab';

/* -------------------------
   Drag & Resize variables
   ------------------------- */
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

let isResizing = false;
let startX = 0;
let startWidth = 0;

/* -------------------------
   Resize handle (bottom-right)
   ------------------------- */
const resizeHandle = document.createElement('div');
resizeHandle.style.position = 'absolute';
resizeHandle.style.width = '10px';
resizeHandle.style.height = '10px';
resizeHandle.style.right = '0';
resizeHandle.style.bottom = '0';
resizeHandle.style.cursor = 'se-resize';
resizeHandle.style.background = 'black';
resizeHandle.style.zIndex = '100';
preview.appendChild(resizeHandle);

/* -------------------------
   Mouse / pointer handlers
   ------------------------- */
preview.addEventListener('mousedown', e => {
  if (e.target !== preview) return;
  isDragging = true;
  dragOffsetX = e.clientX - preview.offsetLeft;
  dragOffsetY = e.clientY - preview.offsetTop;
  preview.style.cursor = 'grabbing';
});

resizeHandle.addEventListener('mousedown', e => {
  isResizing = true;
  startX = e.clientX;
  startWidth = preview.offsetWidth;
  e.stopPropagation();
});

window.addEventListener('mousemove', e => {
  if (isDragging) {
    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;

    const main = preview.parentElement;
    newLeft = Math.max(0, Math.min(newLeft, main.clientWidth - preview.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, main.clientHeight - preview.offsetHeight));

    preview.style.left = newLeft + 'px';
    preview.style.top = newTop + 'px';
    return;
  }

  if (isResizing) {
    let dx = e.clientX - startX;
    let newWidth = startWidth + dx;
    let newHeight = newWidth * 1.5; // keep 2:3 aspect

    const main = preview.parentElement;
    newWidth = Math.max(100, Math.min(newWidth, main.clientWidth - preview.offsetLeft));
    newHeight = Math.max(150, Math.min(newHeight, main.clientHeight - preview.offsetTop));

    preview.style.width = newWidth + 'px';
    preview.style.height = newHeight + 'px';

    // best-effort update for any positioned text-blocks
    preview.querySelectorAll('.text-block').forEach(block => {
      block.style.maxWidth = `${preview.clientWidth - 10}px`;
    });

    // redraw grid and re-fit modules to keep alignment
    drawGrid();
    fitAllModules();

    // reposition decorative repeats so they stay aligned to the grid
    repositionRepeats();
  }
});

window.addEventListener('mouseup', () => {
  isDragging = false;
  isResizing = false;
  preview.style.cursor = 'grab';
}); 

// const preview = document.getElementById('preview');
// const btnGenerate = document.getElementById('btn-generate');

// /* -------------------------
//    Grid selection (random)
//    ------------------------- */
// let currentGridIndex = 2;
// let currentGrid = Array.isArray(window.grids) && window.grids[currentGridIndex]
//   ? window.grids[currentGridIndex]
//   : { cols: 4, rows: 6 };

// function pickRandomGrid() {
//   if (!Array.isArray(window.grids) || window.grids.length === 0) return;
//   currentGridIndex = Math.floor(Math.random() * window.grids.length);
//   currentGrid = window.grids[currentGridIndex];
//   preview.dataset.gridIndex = currentGridIndex;
// }

// /* -------------------------
//    Small helpers
//    ------------------------- */
// function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
// function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// /* -------------------------
//    Read input modules
//    ------------------------- */
// function getTextModules() {
//   const modules = [];
//   const headline = document.getElementById('headline').value.trim();
//   if (headline) modules.push({ key: 'headline', value: headline, weight: 900 });
//   const sub = document.getElementById('sub').value.trim();
//   if (sub) modules.push({ key: 'sub', value: sub, weight: 500 });
//   const info = document.getElementById('info').value.trim();
//   if (info) modules.push({ key: 'info', value: info, weight: 300 });
//   const date = document.getElementById('date').value.trim();
//   if (date) modules.push({ key: 'date', value: date, weight: 200 });
//   return modules;
// }

// /* -------------------------
//    Grid drawing + fitting
//    ------------------------- */
// function drawGrid() {
//   preview.querySelectorAll('.grid-line').forEach(el => el.remove());

//   const cols = currentGrid.cols;
//   for (let i = 1; i < cols; i++) {
//     const col = document.createElement('div');
//     col.className = 'grid-line grid-col';
//     col.style.width = '1px';
//     col.style.height = preview.clientHeight + 'px';
//     col.style.background = 'rgba(0,0,255,0.12)';
//     col.style.position = 'absolute';
//     col.style.left = (i * preview.clientWidth / cols) + 'px';
//     col.style.top = '0';
//     col.style.pointerEvents = 'none';
//     preview.appendChild(col);
//   }

//   const rows = currentGrid.rows;
//   for (let r = 1; r < rows; r++) {
//     const row = document.createElement('div');
//     row.className = 'grid-line grid-row';
//     row.style.height = '1px';
//     row.style.width = preview.clientWidth + 'px';
//     row.style.background = 'rgba(0,0,255,0.12)';
//     row.style.position = 'absolute';
//     row.style.top = (r * preview.clientHeight / rows) + 'px';
//     row.style.left = '0';
//     row.style.pointerEvents = 'none';
//     preview.appendChild(row);
//   }
// }

// function fitAllModules() {
//   preview.querySelectorAll('.text-block').forEach(el => {
//     if (typeof fitModuleToGrid === 'function') {
//       fitModuleToGrid(el, preview, currentGrid.cols, currentGrid.rows);
//     }
//   });
// }

// /* -------------------------
//    Decorative repeating text
//    ------------------------- */
// function createRepeatingText(modules, previewEl, grid) {
//   const cols = grid.cols;
//   const rows = grid.rows;
//   const cellW = previewEl.clientWidth / cols;
//   const cellH = previewEl.clientHeight / rows;

//   const source = modules.length ? modules.map(m => m.value) : ['repeat'];
//   const count = randInt(4, 12);

//   for (let i = 0; i < count; i++) {
//     const txt = choice(source);
//     const el = document.createElement('div');
//     el.className = 'repeat-text';
//     el.innerText = txt;

//     const fs = randInt(8, 18);
//     el.style.position = 'absolute';
//     el.style.fontSize = fs + 'px';
//     el.style.opacity = (Math.random() * 0.45 + 0.12).toFixed(2);
//     el.style.pointerEvents = 'none';
//     el.style.color = '#000';
//     el.style.whiteSpace = 'nowrap';
//     el.style.transform = `translate(-50%,-50%) rotate(${Math.random() < 0.2 ? 90 : 0}deg)`;

//     const col = randInt(0, Math.max(0, cols - 1));
//     const row = randInt(0, Math.max(0, rows - 1));
//     const jitterX = (Math.random() - 0.5) * (cellW * 0.2);
//     const jitterY = (Math.random() - 0.5) * (cellH * 0.2);

//     // store placement so we can reposition on resize
//     el.dataset.col = col;
//     el.dataset.row = row;
//     el.dataset.jitterX = jitterX;
//     el.dataset.jitterY = jitterY;
//     el.dataset.rot = Math.random() < 0.2 ? '90' : '0';

//     previewEl.appendChild(el);
//   }
// }

// /* -------------------------
//    Reposition repeats after resize/redraw
//    ------------------------- */
// function repositionRepeats() {
//   const cols = currentGrid.cols;
//   const rows = currentGrid.rows;
//   const cellW = preview.clientWidth / cols;
//   const cellH = preview.clientHeight / rows;

//   preview.querySelectorAll('.repeat-text').forEach(el => {
//     const col = parseInt(el.dataset.col, 10) || 0;
//     const row = parseInt(el.dataset.row, 10) || 0;
//     const jitterX = parseFloat(el.dataset.jitterX) || 0;
//     const jitterY = parseFloat(el.dataset.jitterY) || 0;
//     const rot = el.dataset.rot === '90' ? 90 : 0;

//     const left = Math.round(col * cellW + cellW / 2 + jitterX);
//     const top = Math.round(row * cellH + cellH / 2 + jitterY);

//     el.style.left = left + 'px';
//     el.style.top = top + 'px';
//     el.style.transform = `translate(-50%,-50%) rotate(${rot}deg)`;
//     el.style.zIndex = '0';
//   });
// }

// /* -------------------------
//    Snapshot / Artboards
//    - save, list thumbnails, load, export/import
//    ------------------------- */
// const snapshots = []; // { name, html, gridIndex, width, height }

// function getSnapshotHtml() {
//   // clone only text blocks and repeats (not resize handle, not grid lines)
//   const tmp = document.createElement('div');
//   preview.querySelectorAll('.text-block, .repeat-text').forEach(el => tmp.appendChild(el.cloneNode(true)));
//   return tmp.innerHTML;
// }

// function saveSnapshot(name) {
//   const html = getSnapshotHtml();
//   const snap = {
//     name: name || `Artboard ${snapshots.length + 1}`,
//     html,
//     gridIndex: currentGridIndex,
//     width: preview.style.width || preview.clientWidth + 'px',
//     height: preview.style.height || preview.clientHeight + 'px'
//   };
//   snapshots.push(snap);
//   renderSnapshotsList();
// }

// function loadSnapshot(index) {
//   const s = snapshots[index];
//   if (!s) return;
//   // clear existing content (keep resize handle)
//   preview.querySelectorAll('.text-block, .repeat-text, .grid-line').forEach(el => el.remove());
//   // restore preview size & grid selection
//   currentGridIndex = s.gridIndex || 2;
//   currentGrid = Array.isArray(window.grids) && window.grids[currentGridIndex] ? window.grids[currentGridIndex] : currentGrid;
//   preview.style.width = s.width;
//   preview.style.height = s.height;
//   // insert saved nodes
//   preview.insertAdjacentHTML('beforeend', s.html);
//   drawGrid();
//   fitAllModules();
//   repositionRepeats();
// }

// function exportSnapshots() {
//   const data = JSON.stringify(snapshots);
//   const blob = new Blob([data], { type: 'application/json' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = 'artboards.json';
//   a.click();
//   URL.revokeObjectURL(url);
// }

// function importSnapshots(json) {
//   try {
//     const arr = JSON.parse(json);
//     if (!Array.isArray(arr)) throw new Error('Invalid format');
//     arr.forEach(s => snapshots.push(s));
//     renderSnapshotsList();
//   } catch (err) {
//     alert('Import failed: ' + err.message);
//   }
// }

// function renderSnapshotsList() {
//   let panel = document.getElementById('snapshots-panel');
//   if (!panel) {
//     panel = document.createElement('div');
//     panel.id = 'snapshots-panel';
//     panel.style.position = 'fixed';
//     panel.style.right = '12px';
//     panel.style.top = '12px';
//     panel.style.width = '220px';
//     panel.style.maxHeight = '70vh';
//     panel.style.overflowY = 'auto';
//     panel.style.background = 'rgba(255,255,255,0.95)';
//     panel.style.border = '1px solid #ddd';
//     panel.style.padding = '8px';
//     panel.style.zIndex = 9999;
//     document.body.appendChild(panel);
//   }
//   panel.innerHTML = '';

//   const title = document.createElement('div');
//   title.innerText = 'Artboards';
//   title.style.fontWeight = '700';
//   title.style.marginBottom = '6px';
//   panel.appendChild(title);

//   // controls: save, export, import
//   const controls = document.createElement('div');
//   controls.style.display = 'flex';
//   controls.style.gap = '6px';
//   controls.style.marginBottom = '8px';

//   const input = document.createElement('input');
//   input.placeholder = 'name';
//   input.style.flex = '1';
//   input.style.fontSize = '12px';

//   const saveBtn = document.createElement('button');
//   saveBtn.innerText = 'Save';
//   saveBtn.onclick = () => saveSnapshot(input.value || undefined);

//   const exportBtn = document.createElement('button');
//   exportBtn.innerText = 'Export';
//   exportBtn.onclick = exportSnapshots;

//   controls.appendChild(input);
//   controls.appendChild(saveBtn);
//   controls.appendChild(exportBtn);
//   panel.appendChild(controls);

//   // import field
//   const imp = document.createElement('input');
//   imp.type = 'file';
//   imp.accept = 'application/json';
//   imp.style.fontSize = '12px';
//   imp.onchange = (ev) => {
//     const f = ev.target.files[0];
//     if (!f) return;
//     const r = new FileReader();
//     r.onload = () => importSnapshots(r.result);
//     r.readAsText(f);
//     imp.value = '';
//   };
//   panel.appendChild(imp);

//   // list thumbnails
//   snapshots.forEach((s, i) => {
//     const item = document.createElement('div');
//     item.style.display = 'flex';
//     item.style.alignItems = 'center';
//     item.style.marginTop = '8px';
//     item.style.borderTop = '1px solid #eee';
//     item.style.paddingTop = '6px';

//     const thumb = document.createElement('div');
//     thumb.style.width = '56px';
//     thumb.style.height = '78px';
//     thumb.style.overflow = 'hidden';
//     thumb.style.border = '1px solid #ccc';
//     thumb.style.marginRight = '8px';
//     thumb.style.background = '#fff';
//     // scaled preview inside thumb
//     const inner = document.createElement('div');
//     inner.style.transformOrigin = '0 0';
//     inner.style.transform = `scale(${Math.min(56 / parseInt(s.width, 10) || 0.18, 78 / parseInt(s.height, 10) || 0.18)})`;
//     inner.style.width = s.width;
//     inner.style.height = s.height;
//     inner.style.pointerEvents = 'none';
//     inner.innerHTML = s.html;
//     thumb.appendChild(inner);

//     const meta = document.createElement('div');
//     meta.style.flex = '1';
//     meta.style.fontSize = '12px';

//     const name = document.createElement('div');
//     name.innerText = s.name;
//     name.style.fontWeight = '600';

//     const actions = document.createElement('div');
//     actions.style.display = 'flex';
//     actions.style.gap = '6px';
//     actions.style.marginTop = '6px';

//     const loadBtn = document.createElement('button');
//     loadBtn.innerText = 'Load';
//     loadBtn.onclick = () => loadSnapshot(i);

//     const dupBtn = document.createElement('button');
//     dupBtn.innerText = 'Duplicate';
//     dupBtn.onclick = () => saveSnapshot(s.name + ' (copy)');

//     const delBtn = document.createElement('button');
//     delBtn.innerText = 'Delete';
//     delBtn.onclick = () => {
//       snapshots.splice(i, 1);
//       renderSnapshotsList();
//     };

//     actions.appendChild(loadBtn);
//     actions.appendChild(dupBtn);
//     actions.appendChild(delBtn);

//     meta.appendChild(name);
//     meta.appendChild(actions);

//     item.appendChild(thumb);
//     item.appendChild(meta);

//     panel.appendChild(item);
//   });
// }

// /* -------------------------
//    Generate handler
//    ------------------------- */
// btnGenerate.addEventListener('click', () => {
//   preview.querySelectorAll('.text-block, .grid-line, .repeat-text').forEach(el => el.remove());

//   const modules = getTextModules();
//   if (modules.length === 0) {
//     alert('Bitte mindestens ein Textfeld ausfüllen!');
//     return;
//   }

//   pickRandomGrid();
//   drawGrid();

//   modules.forEach(module => placeModuleOnGrid(module, preview, currentGrid.cols, currentGrid.rows));

//   fitAllModules();

//   repositionRepeats();

//   if (Math.random() < 0.7) createRepeatingText(modules, preview, currentGrid);
//   repositionRepeats();
// });

// /* -------------------------
//    Preview initial size & style
//    ------------------------- */
// preview.style.position = 'absolute';
// preview.style.left = '50px';
// preview.style.top = '50px';
// preview.style.width = '300px';
// preview.style.height = '450px';
// preview.style.cursor = 'grab';

// /* -------------------------
//    Drag & Resize variables
//    ------------------------- */
// let isDragging = false;
// let dragOffsetX = 0;
// let dragOffsetY = 0;

// let isResizing = false;
// let startX = 0;
// let startWidth = 0;

// /* -------------------------
//    Resize handle (bottom-right)
//    ------------------------- */
// const resizeHandle = document.createElement('div');
// resizeHandle.style.position = 'absolute';
// resizeHandle.style.width = '15px';
// resizeHandle.style.height = '15px';
// resizeHandle.style.right = '0';
// resizeHandle.style.bottom = '0';
// resizeHandle.style.cursor = 'se-resize';
// resizeHandle.style.background = 'red';
// resizeHandle.style.zIndex = '100';
// preview.appendChild(resizeHandle);

// /* -------------------------
//    Mouse / pointer handlers
//    ------------------------- */
// preview.addEventListener('mousedown', e => {
//   if (e.target !== preview) return;
//   isDragging = true;
//   dragOffsetX = e.clientX - preview.offsetLeft;
//   dragOffsetY = e.clientY - preview.offsetTop;
//   preview.style.cursor = 'grabbing';
// });

// resizeHandle.addEventListener('mousedown', e => {
//   isResizing = true;
//   startX = e.clientX;
//   startWidth = preview.offsetWidth;
//   e.stopPropagation();
// });

// window.addEventListener('mousemove', e => {
//   if (isDragging) {
//     let newLeft = e.clientX - dragOffsetX;
//     let newTop = e.clientY - dragOffsetY;

//     const main = preview.parentElement;
//     newLeft = Math.max(0, Math.min(newLeft, main.clientWidth - preview.offsetWidth));
//     newTop = Math.max(0, Math.min(newTop, main.clientHeight - preview.clientHeight));

//     preview.style.left = newLeft + 'px';
//     preview.style.top = newTop + 'px';
//     return;
//   }

//   if (isResizing) {
//     let dx = e.clientX - startX;
//     let newWidth = startWidth + dx;
//     let newHeight = newWidth * 1.5;

//     const main = preview.parentElement;
//     newWidth = Math.max(100, Math.min(newWidth, main.clientWidth - preview.offsetLeft));
//     newHeight = Math.max(150, Math.min(newHeight, main.clientHeight - preview.offsetTop));

//     preview.style.width = newWidth + 'px';
//     preview.style.height = newHeight + 'px';

//     preview.querySelectorAll('.text-block').forEach(block => {
//       block.style.maxWidth = `${preview.clientWidth - 10}px`;
//     });

//     drawGrid();
//     fitAllModules();
//     repositionRepeats();
//   }
// });

// window.addEventListener('mouseup', () => {
//   isDragging = false;
//   isResizing = false;
//   preview.style.cursor = 'grab';
// });

// /* -------------------------
//    Initialize snapshot UI
//    ------------------------- */
// renderSnapshotsList();