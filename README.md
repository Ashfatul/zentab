# ZenTab 🧘‍♂️

> A fast, distraction-free modern new tab page extension for taking notes and managing todos with persistent memory.

Designed from the ground up for a **100 UX** experience with a single-page, no-full-page-scroll architecture.

---

## ✨ Features

- **Single-Page No Full-Page Scroll Model**: The browser window remains fixed at `100vh`. The left capture area and the right feed scroll independently with slim, minimalist custom scrollbars.
- **33% / 67% Split**:
  - **Left Area (~33%)**: Distraction-free capture & edit workspace. Switch seamlessly between Todo and Note modes. Add subtasks/checklists, priorities (Low/Med/High), due dates, color tones, and tags.
  - **Right Area (~67%)**: Chronological feed of your notes and tasks with clear visual separation.
- **Dual View Modes**:
  - **Card View**: Clean, balanced multi-column grid.
  - **List View**: Compact horizontal rows for rapid task scanning and checking.
- **Full-Width Date Separators**: Automatically groups items chronologically (*Today*, *Yesterday*, *This Week*, *Earlier*) with clean count badges and dividers.
- **Sticky Note Mode (Setting)**:
  - Toggle anytime via Settings or the top header button (default: `false`).
  - Transforms cards into modern pastel sticky notes (warm cream, soft mint, sky blue, muted lavender, blush rose) with paper tactile styling.
- **Persistent Memory**:
  - Uses `chrome.storage.local` in extension mode (Firefox & Chrome).
  - Automatically falls back to `localStorage` in web preview.
  - Sub-30ms startup with zero external network dependencies.
- **Backup & Portability**:
  - 1-Click JSON Backup & Restore.
  - 1-Click Markdown Export.
- **Keyboard-Driven Workflow**:
  - `Ctrl / ⌘ + Enter`: Quick save current note or task.
  - `/`: Jump focus directly to search bar.
  - `Esc`: Cancel edit / clear search.
  - `?`: Open keyboard shortcuts cheat sheet.
- **Dark, Light & System Themes**: Clean, cohesive zinc/slate styling with emerald zen accents.
- **Accidental Deletion Protection**: Toast with instant **"Undo"** action.

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Local Web Development
Run the Next.js development server to test features in your browser:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 3. Build Extension Package
```bash
npm run build:ext
```
This automatically:
1. Runs static export.
2. Formats assets to satisfy Chrome's strict directory naming (`next_assets`).
3. Extracts inline scripts into standalone JS files to comply with Manifest V3 Content Security Policy (`script-src 'self'`).
4. Bundles `dist-extension/` and creates `zentab-extension.zip`.

---

## 📦 How to Install in Browsers

### Google Chrome (Manual Unpacked Upload)
1. Open Chrome and navigate to:
   ```text
   chrome://extensions
   ```
2. Enable the **"Developer mode"** toggle in the top-right corner.
3. Click **"Load unpacked"** in the top-left corner.
4. Select the `dist-extension` folder inside this project directory:
   ```text
   /mnt/01DAAF995C961E10/personal_projects/extensions/zentab/dist-extension
   ```
5. Open a new tab (`Ctrl + T`) — ZenTab will greet you!

---

### Mozilla Firefox (Temporary Add-on or AMO)

#### Temporary Local Testing:
1. Open Firefox and navigate to:
   ```text
   about:debugging#/runtime/this-firefox
   ```
2. Click **"Load Temporary Add-on..."**.
3. Select the `manifest.json` file inside `dist-extension`:
   ```text
   /mnt/01DAAF995C961E10/personal_projects/extensions/zentab/dist-extension/manifest.json
   ```
4. Open a new tab (`Ctrl + T`) to use ZenTab.

#### Publishing to Firefox Add-ons (AMO):
1. Sign in to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/developers/).
2. Submit `zentab-extension.zip` generated in the root directory.
3. The extension is pre-configured with `browser_specific_settings.gecko.id: "zentab@personal.newtab"`.

---

## 📂 Project Structure

```text
zentab/
├── app/
│   ├── globals.css           # Tailwind v4 theme, custom scrollbars, sticky note palette
│   ├── layout.tsx            # Full-height layout container and metadata
│   └── page.tsx              # Single-page orchestrator, state, and shortcuts
├── components/
│   ├── DateSeparator.tsx     # Full-width chronological date headers
│   ├── Header.tsx            # Live search, filter tabs, view toggles, clock
│   ├── ItemCard.tsx          # Card view item & sticky note renderer
│   ├── ItemListRow.tsx       # Compact list row renderer
│   ├── LeftPanel.tsx         # 33% input & edit area, checklists, colors, tags
│   ├── RightFeed.tsx         # 67% feed container with list/grid layouts
│   ├── SettingsModal.tsx     # Sticky note toggle, themes, backup/import
│   ├── KeyboardShortcutsModal.tsx # Shortcuts cheat sheet
│   └── Toast.tsx             # Undo deletion notification toast
├── lib/
│   ├── dateUtils.ts          # Chronological date grouping & relative timestamps
│   ├── sampleData.ts         # First-time onboarding sample notes and todos
│   ├── storage.ts            # Chrome/Firefox storage + localStorage fallback
│   └── types.ts              # TypeScript interfaces
├── public/
│   ├── icons/                # 16px, 32px, 48px, 128px PNG icons
│   └── manifest.json         # Manifest V3 (Chrome & Firefox gecko ID)
├── scripts/
│   ├── build-extension.mjs   # Automated packaging & CSP script extractor
│   └── generate-icons.py     # Icon generator
├── dist-extension/           # Production-ready unpacked extension folder
└── zentab-extension.zip      # Packaged zip ready for AMO / Chrome Web Store
```
