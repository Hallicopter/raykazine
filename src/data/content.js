// Helper to extract frontmatter-like JSON from the top of MD files
const parseMarkdown = (raw) => {
    const match = raw.match(/^{([\s\S]*?)}\n([\s\S]*)$/);
    if (match) {
        try {
            const metadata = JSON.parse(`{${match[1]}}`);
            const body = match[2].trim();
            return { ...metadata, body, excerpt: body.slice(0, 150) + '...' };
        } catch (e) {
            console.error("Failed to parse frontmatter", e);
            return { body: raw, excerpt: raw.slice(0, 50) + '...' };
        }
    }
    return { body: raw, excerpt: raw.slice(0, 50) + '...' };
};

// Auto-load all content from src/content/
const essaysGlob = import.meta.glob('../content/essays/*.md', { query: '?raw', import: 'default', eager: true });
const tapesGlob = import.meta.glob('../content/tapes/*.json', { eager: true });
const audioGlob = import.meta.glob('../content/tapes/*.{mp3,wav}', { eager: true, import: 'default' }); // Load URL
const notesGlob = import.meta.glob('../content/notes/*.json', { eager: true });

// Deterministic RNG
const hashCode = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

class SeededRNG {
    constructor(seed) {
        this.seed = seed;
    }
    // Simple LCG
    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }
    nextRange(min, max) {
        return min + this.next() * (max - min);
    }
}

let rawItems = [];

// Process Essays
for (const path in essaysGlob) {
    const raw = essaysGlob[path];
    const { body, excerpt, ...meta } = parseMarkdown(raw);
    const id = path.split('/').pop().replace('.md', '');

    rawItems.push({
        id: id,
        type: 'ESSAY',
        // Don't set defaults yet, check existence later
        data: { ...meta, body, excerpt },
        providedX: meta.x,
        providedY: meta.y,
        providedR: meta.r,
        providedZ: meta.z
    });
}

// Process Tapes
for (const path in tapesGlob) {
    const data = tapesGlob[path].default || tapesGlob[path];
    const id = path.split('/').pop().replace('.json', '');
    const audioPathMp3 = path.replace('.json', '.mp3');
    const audioPathWav = path.replace('.json', '.wav');
    const audioSrc = audioGlob[audioPathMp3] || audioGlob[audioPathWav];

    rawItems.push({
        id: id,
        type: 'TAPE',
        data: {
            title: data.title,
            date: data.date,
            duration: data.duration,
            description: data.description,
            audioSrc: audioSrc
        },
        providedX: data.x,
        providedY: data.y,
        providedR: data.r,
        providedZ: data.z
    });
}

// Process Notes
for (const path in notesGlob) {
    const data = notesGlob[path].default || notesGlob[path];
    rawItems.push({
        id: path.split('/').pop().replace('.json', ''),
        type: 'NOTE',
        data: { text: data.text },
        providedX: data.x,
        providedY: data.y,
        providedR: data.r,
        providedZ: data.z
    });
}

// Sort by Date (primary) for Z-Index
rawItems.sort((a, b) => {
    const dateA = new Date(a.data.date || '1970-01-01');
    const dateB = new Date(b.data.date || '1970-01-01');
    return dateA - dateB;
});

// Deterministic Grumpy Max-Min Layout
// "Grumpy" because items want to be as far away from each other as possible.

const CANVAS_WIDTH = 1250;
const CANVAS_HEIGHT = 750;
const COLS = 6;
const ROWS = 4;
const PADDING = 100;

// Generate Grid Candidates
let candidates = [];
const xStep = (CANVAS_WIDTH - PADDING * 2) / (COLS - 1);
const yStep = (CANVAS_HEIGHT - PADDING * 2) / (ROWS - 1);

for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
        candidates.push({
            x: PADDING + c * xStep,
            y: PADDING + r * yStep
        });
    }
}

// Prepare items for placement
// 1. Sort by ID (stable determinism for placement calculation)
rawItems.sort((a, b) => a.id.localeCompare(b.id));

// Global RNG for layout decisions
const globalSeed = rawItems.reduce((acc, item) => acc + hashCode(item.id), 0);
const layoutRng = new SeededRNG(Math.abs(globalSeed));

// 2. Assign positions using Greedy Max-Min
let placedItems = [];
let takenCandidates = new Set(); // Keep track of used grid points to avoid exact stacking

rawItems.forEach(item => {
    // Individual item RNG for jitter
    const itemRng = new SeededRNG(Math.abs(hashCode(item.id)));
    const jitterRange = 20; // Reduced jitter for strict spacing

    let bestX, bestY;

    // FORCE ALGORITHM: Ignore providedX/providedY to ensure "Super Spread"
    // Find candidate with MAX minimum distance to all already placed items
    let bestCandidate = null;
    let maxMinDist = -1;

    // First item placement
    if (placedItems.length === 0) {
        const index = Math.floor(layoutRng.next() * candidates.length);
        bestCandidate = candidates[index];
    } else {
        // Check all candidates
        for (let i = 0; i < candidates.length; i++) {
            if (takenCandidates.has(i)) continue;

            const cand = candidates[i];
            let minDist = Infinity;

            placedItems.forEach(placed => {
                const dx = placed.x - cand.x;
                const dy = placed.y - cand.y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d < minDist) minDist = d;
            });

            if (minDist > maxMinDist) {
                maxMinDist = minDist;
                bestCandidate = cand;
                bestCandidate.index = i;
            }
        }
    }

    if (!bestCandidate) {
        bestX = layoutRng.nextRange(PADDING, CANVAS_WIDTH - PADDING);
        bestY = layoutRng.nextRange(PADDING, CANVAS_HEIGHT - PADDING);
    } else {
        bestX = bestCandidate.x;
        bestY = bestCandidate.y;
        takenCandidates.add(bestCandidate.index);
    }

    // Apply Reduced Jitter
    bestX += itemRng.nextRange(-jitterRange, jitterRange);
    bestY += itemRng.nextRange(-jitterRange, jitterRange);

    // Rotation
    const r = item.providedR !== undefined ? item.providedR : itemRng.nextRange(-12, 12);

    const placedItem = {
        ...item,
        x: bestX,
        y: bestY,
        r: r
    };
    placedItems.push(placedItem);
});

// 3. Re-sort by Date for Z-Index/DOM Order (Newer = Top)
placedItems.sort((a, b) => {
    const dateA = new Date(a.data.date || '1970-01-01');
    const dateB = new Date(b.data.date || '1970-01-01');
    return dateA - dateB;
});

// 4. Final mapping with Z-index
let items = placedItems.map((item, index) => ({
    id: item.id,
    type: item.type,
    x: item.x,
    y: item.y,
    r: item.r,
    z: item.providedZ !== undefined ? item.providedZ : index + 10, // Base Z > 10
    data: item.data
}));

export const contentItems = items;
