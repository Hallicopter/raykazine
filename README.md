# RAYKAZINE [media labs]

A retro-analog architect's workbench for exploring digital gardening, essays, and audio tapes. Built with React and Vite.

## Setup

```bash
npm install
npm run dev
```

## Adding Content

The workbench content is dynamically loaded from the `src/content` directory.

### Essays
Add a new markdown file to `src/content/essays/`.
The filename becomes the ID.

**Format (`example_essay.md`):**
```markdown
---
title: "The Mechanics of Modern Web"
date: "2024-10-12"
type: "ESSAY"
x: 400  # Optional: Initial X position (overridden by auto-layout)
y: 300  # Optional: Initial Y position (overridden by auto-layout)
---

Your essay content here...
```

### Tapes (Audio)
1. Add an audio file (`.mp3` or `.wav`) to `src/content/tapes/`.
2. Add a matching JSON metadata file to `src/content/tapes/`.
   *Example: if audio is `podcast.mp3`, JSON must be `podcast.json`.*

**Format (`podcast.json`):**
```json
{
  "title": "The Builder's Mindset",
  "date": "2024-05-15",
  "duration": "42:10",
  "description": "An exploration of how we build...",
  "x": 800,
  "y": 100
}
```

### Notes
Add a JSON file to `src/content/notes/`.

**Format (`note_001.json`):**
```json
{
  "text": "The interface is the message.",
  "x": 1000,
  "y": 50
}
```

## Layout System
The workbench uses a **Deterministic Greedy Max-Min** algorithm to layout items. 
- It attempts to spread items as far apart as possible within a `1250x750` viewport.
- It ignores hardcoded `x`/`y` coordinates to ensure optimal distribution.
- The layout is deterministic based on the Item ID (filename).

## Architecture
- **`src/data/content.js`**: Handles dynamic importing and layout logic.
- **`src/components/TapePlayer.jsx`**: Custom audio player with spinning animation.
- **`src/pages/Home.jsx`**: Main Workbench view.
- **`src/pages/IndexPage.jsx`**: List view of all content.
