# PRD: EvidenceCanvas — Evidence-Based Visual Planning & Brainstorming Tool

> **Version:** 1.0.0  
> **Status:** Ready for Agent Implementation  
> **Deploy Target:** GitHub Pages (zero backend, fully client-side)  
> **Storage:** Browser File System Access API + localStorage + IndexedDB  

---

## AGENT IMPLEMENTATION CHECKLIST

> ✅ = Complete this before moving to next item. Do NOT skip steps.

### Phase 0 — Project Bootstrap
- [ ] Init Vite + React + TypeScript project
- [ ] Install dependencies: `reactflow`, `zustand`, `idb` (IndexedDB wrapper), `lucide-react`, `tailwindcss`, `@tailwindcss/typography`, `framer-motion`, `react-dropzone`, `pdfjs-dist`, `mammoth` (docx reader), `fuse.js` (search)
- [ ] Configure Tailwind with dark/light theme via `class` strategy
- [ ] Set `base: './'` in `vite.config.ts` for GitHub Pages relative paths
- [ ] Add `gh-pages` deploy script in `package.json`
- [ ] Set up folder structure as described in Architecture section
- [ ] Create Zustand store skeleton with all slices
- [ ] Confirm app renders blank canvas on `npm run dev`

### Phase 1 — File System & Source Ingestion
- [ ] Implement `FolderPicker` component using File System Access API (`showDirectoryPicker`)
- [ ] Implement `LocalFolderFallback` using `<input type="file" webkitdirectory>` for Safari/Firefox
- [ ] Build `FileWatcher` service: poll selected directory handle every 5s for new/changed files
- [ ] Implement file parsers:
  - [ ] Images: `.jpg .jpeg .png .gif .webp .svg` → thumbnail + full blob URL
  - [ ] PDFs: `pdfjs-dist` → extract first page as image + full text
  - [ ] Documents: `.docx` via `mammoth` → HTML text; `.txt .md` → raw text
  - [ ] Links: `.url` files and `.webloc` files → extract href, fetch Open Graph meta
  - [ ] Data: `.json .csv` → preview table
  - [ ] Video/Audio: `.mp4 .mp3 .wav .webm` → thumbnail/waveform placeholder
- [ ] Build `SourceStore` in Zustand: store parsed sources keyed by file path
- [ ] Persist source index to IndexedDB (file blobs excluded; re-read from disk)
- [ ] Show `SourcePanel` sidebar listing all detected files with type icon + filename

### Phase 2 — Node Canvas (Core)
- [ ] Integrate `ReactFlow` with a custom dark/light theme
- [ ] Create node types:
  - [ ] `SourceNode` — displays file thumbnail/icon, filename, type badge
  - [ ] `IdeaNode` — free-text sticky note style
  - [ ] `QuestionNode` — styled as open question card
  - [ ] `ClaimNode` — bold assertion card with evidence counter badge
  - [ ] `EvidenceNode` — linked to a source, shows excerpt + source ref
  - [ ] `GroupNode` — resizable container to cluster nodes
  - [ ] `LinkNode` — external URL card with OG preview
- [ ] Auto-create node from source file drag from `SourcePanel` → canvas
- [ ] Support manual node creation via right-click context menu or toolbar
- [ ] Implement `EdgeTypes`:
  - [ ] `SupportEdge` — green, "supports"
  - [ ] `ContradictEdge` — red, "contradicts"
  - [ ] `RelatesEdge` — gray dashed, "relates to"
  - [ ] `CausesEdge` — orange, "causes"
- [ ] Edge label picker when connecting two nodes
- [ ] Multi-select with Shift+click and drag-select box
- [ ] Group selected nodes into `GroupNode`
- [ ] Mini-map (ReactFlow built-in, themed)
- [ ] Zoom controls + fit-to-view button

### Phase 3 — Node Detail Panel
- [ ] Click any node → open `NodeDetailPanel` slide-in drawer (right side)
- [ ] Fields in panel:
  - [ ] Title (editable inline)
  - [ ] Description / Body text (rich plain-text area)
  - [ ] Node Type selector (change type)
  - [ ] Tags input (comma-separated, stored as array)
  - [ ] Color accent picker (6 preset colors per theme)
  - [ ] Linked Sources list (drag source from panel to link)
  - [ ] Comments thread (timestamped, author = "You", stored locally)
  - [ ] Created / Modified timestamps
- [ ] All edits auto-save to Zustand → IndexedDB within 500ms debounce
- [ ] Keyboard shortcut `Escape` closes panel, `Enter` confirms edits

### Phase 4 — Comments & Annotations
- [ ] `CommentThread` component inside `NodeDetailPanel`
- [ ] Add comment: textarea + "Add Comment" button
- [ ] Each comment shows: avatar initial, timestamp, text, delete button
- [ ] Comments stored per node in IndexedDB
- [ ] Visual indicator on node card: small comment bubble icon with count if >0
- [ ] Canvas-level annotation: double-click empty canvas → create sticky `IdeaNode` immediately

### Phase 5 — Source Preview & Evidence Linking
- [ ] `SourcePreviewModal`: click source in panel → full preview overlay
  - [ ] Images: full size with zoom
  - [ ] PDFs: paginated viewer (pdfjs-dist canvas render)
  - [ ] Text/Docs: scrollable formatted text
  - [ ] Links: iframe embed attempt + fallback to OG card + "Open in Tab" button
- [ ] "Add to Canvas" button in preview → creates `SourceNode` or `EvidenceNode`
- [ ] Text selection inside PDF/doc preview → "Quote as Evidence" → creates `EvidenceNode` with selected excerpt pre-filled
- [ ] Evidence nodes always show source attribution chip

### Phase 6 — Search & Filter
- [ ] Global search bar (Cmd/Ctrl+K): searches node titles, descriptions, tags, comments
- [ ] Powered by `fuse.js` fuzzy search over all nodes
- [ ] Search result list → click → pan canvas to node + highlight it
- [ ] Filter toolbar above canvas:
  - [ ] Filter by node type (multi-select chips)
  - [ ] Filter by tag
  - [ ] Filter by "has comments", "has sources", "unlinked"
- [ ] Filtered-out nodes dim to 20% opacity (not hidden)

### Phase 7 — Layouts & Organization
- [ ] `Auto Layout` button: applies dagre graph layout to all nodes
- [ ] Layout modes: `Hierarchical`, `Radial`, `Grid`, `Force-directed`
- [ ] Keyboard shortcuts:
  - [ ] `Ctrl+A` — select all
  - [ ] `Ctrl+Z / Ctrl+Y` — undo/redo (history stack in Zustand, 50 steps)
  - [ ] `Delete / Backspace` — delete selected nodes/edges
  - [ ] `Ctrl+D` — duplicate selected node
  - [ ] `Ctrl+G` — group selected
  - [ ] `Ctrl+F` — focus search
  - [ ] `Space` — pan mode toggle
- [ ] Undo/Redo stack: store snapshots of node+edge state

### Phase 8 — Projects & Workspaces
- [ ] Multiple "Projects" (canvases) stored in IndexedDB
- [ ] `ProjectSidebar` or header dropdown: list projects, create new, rename, delete
- [ ] Each project stores: name, created date, nodes, edges, source folder path, tags
- [ ] `Export Project`:
  - [ ] Export as `.json` (full project dump)
  - [ ] Export canvas as `.png` (html-to-canvas or ReactFlow `toImage`)
  - [ ] Export outline as `.md` (nodes as markdown outline by group)
- [ ] `Import Project`: drag `.json` file → restore project
- [ ] Auto-save every 30 seconds + on window `beforeunload`

### Phase 9 — Theme & UI Polish
- [ ] Dark / Light toggle in header (persisted in localStorage)
- [ ] Dark theme: deep navy `#0d1117` base, `#161b22` cards, accent `#58a6ff`
- [ ] Light theme: `#f6f8fa` base, `#ffffff` cards, accent `#0969da`
- [ ] Smooth theme transition: `transition: background 0.2s, color 0.2s`
- [ ] Font: `IBM Plex Sans` for UI, `IBM Plex Mono` for code/tags
- [ ] Canvas background: dot grid pattern (CSS `radial-gradient` dots), theme-aware
- [ ] Node shadows and hover states: subtle lift effect on hover
- [ ] Framer Motion: panel slide-ins, modal fade-ins, node appear animations
- [ ] Fully responsive: sidebar collapses to icon rail on narrow screens
- [ ] Empty state illustrations: SVG placeholders for empty canvas, no sources

### Phase 10 — GitHub Pages Deploy
- [ ] Confirm all asset paths are relative (no `/` prefix routes)
- [ ] Add `404.html` = copy of `index.html` for SPA routing fallback
- [ ] `npm run deploy` via `gh-pages` package publishes `dist/` to `gh-pages` branch
- [ ] Test File System Access API on deployed URL (requires HTTPS — GitHub Pages satisfies this)
- [ ] Add README with usage instructions + browser support table

---

## 1. Problem Statement

### 1.1 Who Is This For?
Researchers, students, writers, product managers, investigators, designers, and anyone who needs to **make sense of a pile of evidence** before making a decision, writing something, or presenting an argument.

### 1.2 Core Problems People Face Today

| # | Problem | Current Workaround | Why It Fails |
|---|---------|-------------------|--------------|
| P1 | Evidence scattered across folders, browser tabs, PDFs, images, notes | Manual copy-paste into docs | Breaks context, loses source links |
| P2 | Can't see relationships between pieces of evidence | Mind maps in separate tool | Disconnected from actual files |
| P3 | No way to attach "why this matters" to a file | Rename files or add sticky notes | Fragile, not searchable |
| P4 | Hard to distinguish what supports vs. contradicts an idea | Color-coded folders | No semantic meaning |
| P5 | Brainstorming tools don't work with real files/documents | Screenshots + paste | Lossy, tedious |
| P6 | Can't annotate or comment on evidence inline | Post-its, separate notes doc | Disconnected from source |
| P7 | No way to track "I've reviewed this" vs. "need to check" | Manual checklists | Manual, error-prone |
| P8 | Tools require accounts / cloud sync (privacy concern) | Nothing available | All good tools are cloud-first |
| P9 | Can't export thinking as structured outline | Re-type everything | Double work |
| P10 | Multiple research projects get mixed up | Separate folders | No visual canvas per project |

---

## 2. Product Vision

**EvidenceCanvas** is a zero-backend, privacy-first visual workspace that lets you **point it at any folder on your computer**, automatically ingest every file inside, and display them as draggable nodes on an infinite canvas. You connect, annotate, and organize those nodes to map your thinking — then export your structured argument or outline when you're done.

> **Tagline:** *"Drop your research in. See the connections. Think clearly."*

---

## 3. Feature Specifications

### Feature 1: Folder Ingestion Engine
**Problem solved:** P1, P5  
**Name:** `FolderWatcher`

The user clicks "Open Folder" and selects a project folder. The app reads every file in it (including subdirectories) and creates a source entry for each. It polls for changes every 5 seconds. New files added to the folder appear automatically in the Sources panel. No upload. No server. Files stay on disk.

**Supported file types:**
- Images: jpg, jpeg, png, gif, webp, svg
- Documents: pdf, docx, txt, md
- Links: .url, .webloc (exported browser bookmarks)
- Data: json, csv
- Media: mp4, mp3, wav (thumbnail placeholder)

**UI:** Left sidebar "Sources" panel with file type icons, filename, modified date. Search box filters the list.

---

### Feature 2: Infinite Node Canvas
**Problem solved:** P2, P3  
**Name:** `EvidenceCanvas`

The main workspace. An infinite, pannable, zoomable canvas powered by ReactFlow. Users drag sources from the Sources panel onto the canvas to create nodes. They can also manually add idea/question/claim nodes.

**Node Types:**
- `SourceNode` — auto-generated from file. Shows thumbnail/icon, filename.
- `IdeaNode` — free-text sticky note. Yellow by default.
- `QuestionNode` — open question card. Blue border.
- `ClaimNode` — bold assertion. Shows evidence count badge.
- `EvidenceNode` — excerpt + source reference chip.
- `GroupNode` — resizable transparent container with label.

---

### Feature 3: Semantic Edge Connections
**Problem solved:** P2, P4  
**Name:** `SemanticEdges`

When connecting two nodes, a small popover asks: "How does this relate?" Options: Supports (green), Contradicts (red), Relates To (gray dashed), Causes (orange). Edge renders with color + label. This turns the canvas into a genuine argument map, not just a mind map.

---

### Feature 4: Node Detail & Annotation Panel
**Problem solved:** P3, P6  
**Name:** `NodeDetailPanel`

Click any node → right side panel slides in. Contains:
- Editable title and description
- Tag system
- Color accent
- Linked sources list
- Comments thread (local, timestamped)

Everything auto-saves. No save button needed.

---

### Feature 5: Source Preview & Evidence Quoting
**Problem solved:** P1, P5, P6  
**Name:** `SourcePreview`

Click any source in the panel → full preview modal. PDFs render page by page. Documents show formatted text. Images show full-size. Users can **select text** in a PDF or document and click "Quote as Evidence" — this instantly creates an `EvidenceNode` on the canvas with the quoted text and the source automatically linked.

---

### Feature 6: Global Fuzzy Search
**Problem solved:** P7  
**Name:** `UniversalSearch`

`Cmd+K` opens a command palette. Searches across all node titles, descriptions, tags, and comments. Results show node type icon + title + project name. Click any result → canvas pans and zooms to that node with a highlight pulse.

---

### Feature 7: Multiple Projects
**Problem solved:** P10  
**Name:** `ProjectManager`

The app supports multiple separate canvases, each called a "Project." Projects are listed in a header dropdown. Each project has its own canvas, source folder, and settings. All stored in IndexedDB. Import/export as `.json`.

---

### Feature 8: Export
**Problem solved:** P9  
**Name:** `ExportEngine`

Three export formats:
1. **Canvas PNG** — screenshot of current viewport or full canvas
2. **Project JSON** — full data dump for backup or sharing
3. **Markdown Outline** — nodes organized by group, formatted as `##` headings with bullet children. Great for turning a brainstorm into a document outline.

---

### Feature 9: Dark / Light Theme
**Problem solved:** UX preference  
**Name:** `ThemeEngine`

System default detected on first load. Toggle in header. Smooth CSS transition. Both themes are fully designed — not just color-inverted. Persisted in localStorage.

---

### Feature 10: Undo / Redo History
**Problem solved:** P3 (fear of losing work)  
**Name:** `HistoryStack`

Every action (move, add, delete, edit) is recorded. `Ctrl+Z` / `Ctrl+Y` navigates history. 50-step limit. Stored in memory (not persisted across sessions to keep storage lean).

---

## 4. Technical Architecture

```
src/
├── components/
│   ├── canvas/
│   │   ├── CanvasView.tsx          ← ReactFlow wrapper
│   │   ├── nodes/
│   │   │   ├── SourceNode.tsx
│   │   │   ├── IdeaNode.tsx
│   │   │   ├── ClaimNode.tsx
│   │   │   ├── EvidenceNode.tsx
│   │   │   ├── QuestionNode.tsx
│   │   │   └── GroupNode.tsx
│   │   └── edges/
│   │       └── SemanticEdge.tsx
│   ├── panels/
│   │   ├── SourcePanel.tsx         ← Left sidebar
│   │   ├── NodeDetailPanel.tsx     ← Right drawer
│   │   └── SearchPalette.tsx       ← Cmd+K overlay
│   ├── modals/
│   │   ├── SourcePreviewModal.tsx
│   │   └── ExportModal.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── ProjectSwitcher.tsx
│   └── ui/                         ← Shared primitives
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Badge.tsx
│       └── Tooltip.tsx
├── store/
│   ├── canvasStore.ts              ← Zustand: nodes, edges, history
│   ├── sourceStore.ts              ← Zustand: parsed files
│   ├── projectStore.ts             ← Zustand: projects list
│   └── uiStore.ts                  ← Zustand: theme, panels open
├── services/
│   ├── folderWatcher.ts            ← File System Access API
│   ├── fileParsers/
│   │   ├── pdfParser.ts
│   │   ├── docxParser.ts
│   │   ├── imageParser.ts
│   │   └── linkParser.ts
│   ├── db.ts                       ← IndexedDB via idb
│   └── exportService.ts
├── hooks/
│   ├── useTheme.ts
│   ├── useKeyboardShortcuts.ts
│   └── useAutoSave.ts
├── types/
│   └── index.ts                    ← All TypeScript interfaces
└── App.tsx
```

### Storage Strategy
| Data | Storage | Why |
|------|---------|-----|
| Node positions, edges, content | IndexedDB | Large structured data |
| Project list, settings | localStorage | Small, fast access |
| Theme preference | localStorage | Tiny, sync on load |
| File blobs | NOT stored | Re-read from disk via FileHandle |
| FileHandle references | IndexedDB (serialized) | Persist folder access across sessions |

---

## 5. UI Design Specification

### Color Tokens
```css
/* Dark Theme */
--bg-base: #0d1117;
--bg-card: #161b22;
--bg-elevated: #21262d;
--border: #30363d;
--text-primary: #e6edf3;
--text-secondary: #8b949e;
--accent: #58a6ff;
--accent-hover: #79c0ff;
--green: #3fb950;
--red: #f85149;
--orange: #d29922;
--yellow: #e3b341;

/* Light Theme */
--bg-base: #f6f8fa;
--bg-card: #ffffff;
--bg-elevated: #f0f2f5;
--border: #d0d7de;
--text-primary: #1f2328;
--text-secondary: #636c76;
--accent: #0969da;
--accent-hover: #0550ae;
```

### Canvas Background
Subtle dot grid: CSS `radial-gradient` creating a dot at every 24px intersection. Dots are `var(--border)` at 0.5 opacity.

### Typography
- UI: `IBM Plex Sans` (Google Fonts)
- Code / tags / metadata: `IBM Plex Mono`
- Node titles: `500` weight, `14px`
- Node body: `400` weight, `13px`
- Section headers: `600` weight, `11px` uppercase tracking

### Node Visual Design
- Border radius: `8px`
- Border: `1px solid var(--border)`
- Shadow dark: `0 2px 8px rgba(0,0,0,0.4)`
- Shadow light: `0 2px 8px rgba(0,0,0,0.1)`
- Hover: border-color → `var(--accent)`, shadow lifts
- Selected: `2px solid var(--accent)` + glow
- Min width: `180px`, max width: `280px`

### Layout Zones
```
┌─────────────────────────────────────────────────────┐
│  HEADER: Logo | Project Name ▾ | Search | Theme | ⋯ │
├──────────┬──────────────────────────────┬────────────┤
│  SOURCES │                              │   NODE     │
│  PANEL   │     INFINITE CANVAS          │   DETAIL   │
│  (240px) │     (ReactFlow)              │   PANEL    │
│          │                              │   (320px)  │
│  File    │  Nodes + Edges               │  (hidden   │
│  list    │  Mini-map bottom-right       │  by default│
│  + types │  Zoom controls bottom-left   │  slides in)│
└──────────┴──────────────────────────────┴────────────┘
```

---

## 6. Browser Compatibility & Constraints

| Feature | Chrome | Firefox | Safari | Notes |
|---------|--------|---------|--------|-------|
| File System Access API | ✅ | ❌ | ❌ | Fallback: `<input webkitdirectory>` |
| IndexedDB | ✅ | ✅ | ✅ | Full support |
| Canvas PNG export | ✅ | ✅ | ✅ | |
| PDF rendering (pdfjs) | ✅ | ✅ | ✅ | |
| GitHub Pages HTTPS | ✅ | ✅ | ✅ | Required for FileSystemAPI |

**Recommended browser:** Chrome / Edge  
Show a banner on Firefox/Safari explaining limited folder watching, with `<input>` fallback.

---

## 7. Out of Scope (v1.0)

- Real-time multiplayer / collaboration
- Cloud sync or account system
- AI-powered suggestions (v2 feature)
- Mobile app
- Plugin system
- Version history beyond in-session undo

---

## 8. Success Metrics (Self-Assessment)

After building, verify:
- [ ] Open a folder with 20+ mixed files → all appear in Sources panel within 3 seconds
- [ ] Drag 5 files to canvas → nodes render correctly with correct type icons
- [ ] Connect 2 nodes → edge appears with correct semantic color + label
- [ ] Add comment to node → reopen app → comment persists
- [ ] Switch theme → canvas, panels, all components update instantly
- [ ] Export canvas as PNG → image captures all visible nodes
- [ ] Create 2 projects → switch between them → state is isolated
- [ ] Undo 5 actions → state reverts correctly
- [ ] Search "test" → results show, click → canvas navigates to node
- [ ] Deploy to GitHub Pages → app loads and works fully on HTTPS

---

## 9. Recommended Implementation Order

1. Scaffold + Zustand store + IndexedDB setup  
2. ReactFlow canvas with basic node types  
3. Folder ingestion + Sources panel  
4. Node detail panel + auto-save  
5. Semantic edges  
6. Source preview + quote-as-evidence  
7. Search palette  
8. Projects + export  
9. Theme system + polish  
10. Deploy + README  

---

*End of PRD — EvidenceCanvas v1.0*
