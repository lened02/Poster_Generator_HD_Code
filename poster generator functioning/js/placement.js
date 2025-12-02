// Random helpers
function random(min, max) {
    return Math.random() * (max - min) + min;
}
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create and append a text module positioned on the grid.
 * Adds optional rotation (0° or 90°). Stores grid placement, base font and rotation
 * in data-* attributes so it can be re-fitted when the preview is resized.
 */
function placeModuleOnGrid(module, preview, cols = grids[2].cols, rows = grids[2].rows) {
    const el = document.createElement('div');
    el.className = 'text-block';
    el.innerText = module.value;

    // basic styles
    el.style.display = 'inline-block';
    el.style.fontWeight = module.weight || 400; 
    el.style.fontFamily = randomFont (); 
    el.style.whiteSpace = 'normal';
    el.style.wordWrap = 'break-word';
    el.style.overflowWrap = 'break-word';
    el.style.boxSizing = 'border-box';
    el.style.padding = '4px';
    el.style.position = 'absolute';
    el.style.pointerEvents = 'auto';
    el.style.color = '#000';
    el.style.transformOrigin = 'center center' 
    // el.style.textAlign = 'center'

    // choose span within grid bounds
    const maxColSpan = Math.min(3, cols);
    const maxRowSpan = Math.min(3, rows);
    const spanCols = randomInt(1, maxColSpan);
    const spanRows = randomInt(1, maxRowSpan);

    const startCol = randomInt(0, Math.max(0, cols - spanCols));
    const startRow = randomInt(0, Math.max(0, rows - spanRows));

    // optionally rotate 0 or 90 degrees
    const rotate = Math.random() < 0.5 ? 0 : 90;
    el.dataset.rotation = rotate;
    if (rotate === 90) el.style.transform = 'rotate(90deg)';

    // compute available area in px for this block (swap when rotated)
    const cellW = preview.clientWidth / cols;
    const cellH = preview.clientHeight / rows;
    let availW = Math.max(10, Math.floor(spanCols * cellW) - 8);
    let availH = Math.max(10, Math.floor(spanRows * cellH) - 8);
    if (rotate === 90) {
        // when rotated, treat available width as height and vice versa for fitting
        const tmp = availW;
        availW = availH;
        availH = tmp;
    }

    // append to measure and fit font size
    el.style.left = '0px';
    el.style.top = '0px';
    preview.appendChild(el);

    let fs = Math.floor(random(18, 56));
    el.style.fontSize = fs + 'px';
    el.style.maxWidth = availW + 'px';

    let rect = el.getBoundingClientRect();
    // shrink until fits the available (considering the swapped avail when rotated)
    while ((rect.width > availW || rect.height > availH) && fs > 8) {
        fs -= 1;
        el.style.fontSize = fs + 'px';
        rect = el.getBoundingClientRect();
    }

    // persist placement for later re-fit
    el.dataset.startCol = startCol;
    el.dataset.startRow = startRow;
    el.dataset.spanCols = spanCols;
    el.dataset.spanRows = spanRows;
    el.dataset.baseFont = fs;

    // center inside chosen span using the measured rect (rect already accounts for transform)
    const left = Math.round(startCol * cellW + (spanCols * cellW - rect.width) / 2);
    const top = Math.round(startRow * cellH + (spanRows * cellH - rect.height) / 2);

    el.style.left = Math.max(0, left) + 'px';
    el.style.top = Math.max(0, top) + 'px';

    return el;
}

/**
 * Re-fit an existing text-block element to the current preview/grid size.
 * Respects stored rotation (0° or 90°) and recomputes font + position.
 */
function fitModuleToGrid(el, previewEl = preview, cols = grids[2].cols, rows = grids[2].rows) {
    const startCol = parseInt(el.dataset.startCol, 10) || 0;
    const startRow = parseInt(el.dataset.startRow, 10) || 0;
    const spanCols = parseInt(el.dataset.spanCols, 10) || 1;
    const spanRows = parseInt(el.dataset.spanRows, 10) || 1;
    const baseFont = parseInt(el.dataset.baseFont, 10) ||
                     parseInt(window.getComputedStyle(el).fontSize, 10) ||
                     16;
    const rotate = parseInt(el.dataset.rotation || '0', 10) || 0;

    // ensure transform matches stored rotation
    el.style.transformOrigin = 'center center';
    el.style.transform = rotate === 90 ? 'rotate(90deg)' : 'none';

    const cellW = previewEl.clientWidth / cols;
    const cellH = previewEl.clientHeight / rows;
    let availW = Math.max(10, Math.floor(spanCols * cellW) - 8);
    let availH = Math.max(10, Math.floor(spanRows * cellH) - 8);

    if (rotate === 90) {
        const tmp = availW;
        availW = availH;
        availH = tmp;
    }

    el.style.maxWidth = availW + 'px';

    let fs = baseFont;
    el.style.fontSize = fs + 'px';
    let rect = el.getBoundingClientRect();
    while ((rect.width > availW || rect.height > availH) && fs > 8) {
        fs -= 1;
        el.style.fontSize = fs + 'px';
        rect = el.getBoundingClientRect();
    }

    const left = Math.round(startCol * cellW + (spanCols * cellW - rect.width) / 2);
    const top = Math.round(startRow * cellH + (spanRows * cellH - rect.height) / 2);

    el.style.left = Math.max(0, left) + 'px';
    el.style.top = Math.max(0, top) + 'px';
} 