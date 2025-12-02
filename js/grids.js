// const grids = [
//     { name: 'Grid A', cols: 2, rows: 2 },
//     { name: 'Grid B', cols: 3, rows: 3 },
//     { name: 'Grid C', cols: 4, rows: 4 }, 
//     { name: 'Grid D', cols: 5, rows: 5 },
//     { name: 'Grid E', cols: 6, rows: 6 }, 
//     { name: 'Grid F', cols: 7, rows: 7 },

// ];

// ...existing code...

/**
 * Generate grid definitions programmatically instead of hand-writing each entry.
 * Tweak MIN/MAX and filters below to control which combos are created.
 */

const MIN = 2;
const MAX = 100; // highest cols/rows to consider

// helper: generate square grids (2x2, 3x3, ...)
function generateSquareGrids(min = MIN, max = MAX) {
    const out = [];
    for (let n = min; n <= max; n++) {
        out.push({ name: `Square ${n}×${n}`, cols: n, rows: n });
    }
    return out;
}

// helper: generate rectangular grids but filter to keep only "reasonable" shapes
// filterFn can be adjusted; default keeps aspect differences up to 3 and area <= 56
function generateRectGrids(min = MIN, max = MAX, filterFn = (c, r) => Math.abs(c - r) <= 3 && c * r <= 56) {
    const out = [];
    for (let c = min; c <= max; c++) {
        for (let r = min; r <= max; r++) {
            if (c === r) continue; // squares already added
            if (!filterFn(c, r)) continue;
            out.push({ name: `Grid ${c}×${r}`, cols: c, rows: r });
        }
    }
    return out;
}

// Example: create a combined list: squares first, then filtered rectangles.
// You can change order, add or remove generation functions, or export only a subset.
let grids = [
    ...generateSquareGrids(2, 20),
    ...generateRectGrids(2, 50)
];

// Optional: shuffle the grids if you want randomness in pickRandomGrid()
function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
} 

// uncomment to shuffle
grids = shuffleArray(grids);

// Export for debugging (keeps old code expecting a global `grids`)
window.grids = grids;
