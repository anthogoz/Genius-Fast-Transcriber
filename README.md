# 🎵 Genius Fast Transcriber + Lyric Card Maker

[![Version](https://img.shields.io/github/v/release/anthogoz/Genius-Fast-Transcriber?display_name=tag&style=for-the-badge&label=version)](https://github.com/anthogoz/Genius-Fast-Transcriber/releases/latest)
![Chrome Web Store](https://img.shields.io/badge/Chrome-Available-green.svg?style=for-the-badge&logo=google-chrome)
![Firefox Add-ons](https://img.shields.io/badge/Firefox-Available-orange.svg?style=for-the-badge&logo=firefox)
![License](https://img.shields.io/badge/license-MIT-orange.svg?style=for-the-badge)
![Built with](https://img.shields.io/badge/built_with-WXT_+_Vue_3_+_TypeScript-blueviolet.svg?style=for-the-badge)

**The ultimate toolkit for transcribers and contributors on Genius.com.**
A browser extension that injects a professional-grade floating panel directly into the Genius lyrics editor — smart tags, one-click typographic cleanup, lyric card generation, custom macros, and much more.

---

## 🌟 Why use Genius Fast Transcriber?

| | |
|---|---|
| 🚀 **Save time** | Insert structures and fix typography in a single click. |
| 🧠 **Customizable** | Create your own buttons, macros, and regex-based tools. |
| ✨ **Quality assured** | Lyrics automatically respect Genius editorial standards. |
| 🌍 **8 languages** | FR · EN · PL · ES · DE · IT · PT · RU — with locale-specific typography rules. |
| 🎨 **Lyric Cards** | Generate shareable lyric images in 1:1, 9:16, and 16:9 formats. |
| 🌙 **Dark mode** | Beautiful dark interface enabled by default; light mode available. |
| 🔒 **Safe editing** | Undo/redo history (10 states) + auto-draft backup to local storage. |

---

## 🔥 Features

### 🏗️ Structure & Smart Tags
- **Unified Verse Manager** — Dynamic `[Couplet 1]`, `[Couplet 2]` button with fast ← → navigation.
- **Artist Detection** — Scans the page for main & featured artists; auto-proposes them for tag credits.
- **Quick Tags** — `[Refrain]`, `[Intro]`, `[Bridge]`, `[Outro]`, `[Pré-Refrain]`… inserted with correct formatting.
- **Multi-language tags** — Adapts to English (`[Verse]`, `[Chorus]`), French (`[Couplet]`, `[Refrain]`), Polish (`[Zwrotka]`, `[Refren]`), and more.

### ✨ Corrections & Quality (Fix All)
One prominent **Fix All** button that cleans everything in one click:
- Curly apostrophes `'` → `'`
- Capitalization at the start of lines
- Unnecessary final punctuation removed (preserves `...` ellipsis)
- French quotes `« »` → `"` (or Polish `„"` → `"`)
- Long dashes `— –` → `-` (or `-` → `—` for Polish)
- Double spaces removed
- Proper line spacing between sections
- **Correction Preview** — Interactive diff view showing every change before applying.
- **Parenthesis Check** — Detects and highlights unclosed `( )` or `[ ]` in red.

### 🎨 Lyric Card Maker
- Select text → generate a beautiful shareable image for Instagram / Twitter / TikTok.
- Background options: **Album art** or **Artist photo**, fetched automatically.
- Multiple formats: **1:1**, **9:16**, **16:9**.
- Live preview before download.
- **Lyric Card Only Mode** — Hide transcription tools and keep only the card generator.

### 🛠️ Custom Button Manager
- Create your own **insertion buttons** or complex **regex find/replace** tools.
- Simple graphical manager — no coding required.
- **Import / Export** — Share button presets as code snippets with other contributors.

### 🔢 Number to Words Converter
Select a number like `42` and convert it to:
- 🇫🇷 *quarante-deux* · 🇬🇧 *forty-two* · 🇵🇱 *czterdzieści dwa*

### 📤 Export & Sharing
- **Export as `.txt`** — Download lyrics as a clean text file directly from the Genius toolbar.
- **Copy to clipboard** — One-click copy alongside file download.
- **Smart cleaning** — Automatically strips Contributors headers, Genius hyperlink annotations, and HTML tags.
- **4 export formats**:
  - **Standard** — Keeps tags and spacing.
  - **No Tags** — Removes `[Verse]`, `[Chorus]`, etc.
  - **No Spacing** — Removes empty lines.
  - **Raw** — Pure text, no tags or spacing.
- **Intelligent Scraper** — If the editor is closed, GFT scrapes lyrics from the public page.

### 📺 YouTube Control
Control the embedded YouTube player without leaving the editor:
- ▶️ Play / ⏸️ Pause
- ⏪ Rewind 5s / ⏩ Forward 5s
- Compatible with `nocookie` privacy embeds.

### 🔍 Find & Replace
- In-editor find & replace with a **regex toggle** for power users.

### ✏️ Floating Toolbar
- Select text in the editor → a contextual toolbar appears for **Bold**, *Italic*, and quick formatting.

### 🛡️ Security & History
- **Undo / Redo** — Visual 10-state history with `Ctrl+Z` / `Ctrl+Y`.
- **Auto Draft** — Periodic local save with `💾` pulse indicator. Crash-proof your work.

### ❓ Onboarding & Tutorial
- **Interactive wizard** on first install — choose language, theme, and mode.
- **Replay tutorial** anytime from the settings menu.

### 🤖 AI Transcription
- Quick-access link to external AI transcription tools directly from the panel footer.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + 1` to `5` | Insert structure tags (Verse, Chorus…) |
| `Ctrl + Shift + C` | **Fix All** (opens correction preview) |
| `Ctrl + D` | Duplicate current line |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + S` | Show / hide statistics |
| `Ctrl + Alt + Space` | Play / Pause YouTube |
| `Ctrl + Alt + ←` | Rewind 5s |
| `Ctrl + Alt + →` | Forward 5s |

> Shortcuts are customizable from the **Settings** menu inside the panel.

---

## 📥 Installation

### Chrome Web Store
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/cbldlkiakadclpjfkkafpjomilmmgdjm).

### Firefox Add-ons
Install from [Firefox Add-ons (AMO)](https://addons.mozilla.org/firefox/addon/genius-fast-transcriber/).

### Manual Installation

#### Option A: Pre-built Release (Recommended & Easiest)
1. Go to the [Releases](https://github.com/anthogoz/Genius-Fast-Transcriber/releases) tab and download the latest zip file (e.g. `genius-fast-transcriber-chrome.zip` or `genius-fast-transcriber-firefox.zip`).
2. Extract the downloaded zip file on your computer.
3. **Chrome** — Go to `chrome://extensions`, enable **Developer mode** (top right toggle), click **Load unpacked** and select the extracted folder.
4. **Firefox** — Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and select the `manifest.json` file inside the extracted folder.

#### Option B: From Source (Developer Mode)
1. Clone or download the repository.
2. Install dependencies and build:
   ```bash
   npm install
   npm run build            # Chrome (Manifest V3)
   npm run build:firefox    # Firefox
   ```
3. **Chrome** — Go to `chrome://extensions`, enable **Developer mode**, click **Load unpacked** and select `.output/chrome-mv3`.
4. **Firefox** — Go to `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on** and select `.output/firefox-mv2/manifest.json`.

---

## 🧑‍💻 Development

The project is built with [WXT](https://wxt.dev) (next-gen browser extension framework), [Vue 3](https://vuejs.org) (Composition API), and [TypeScript](https://www.typescriptlang.org) (strict mode). Linting and formatting are handled by [Biome](https://biomejs.dev).

```bash
npm install
npm run dev              # Chrome dev server with HMR
npm run dev:firefox      # Firefox dev server with HMR
npm run build            # Production build (Chrome)
npm run build:firefox    # Production build (Firefox)
npm run zip              # Package for Chrome Web Store
npm run zip:firefox      # Package for Firefox AMO
npm run lint             # Lint with Biome
npm run lint:fix         # Auto-fix lint errors
npm run format           # Format with Biome
npm run typecheck        # TypeScript type-checking (wxt prepare + vue-tsc)
```

### Project Structure

```
src/
├── entrypoints/              # WXT entry points
│   ├── content.ts            # Content script — injected on *://*.genius.com/*-lyrics
│   ├── background.ts         # Service worker
│   └── popup/                # Extension popup (HTML + Vue mount)
├── components/
│   ├── content/              # 18 Vue SFCs injected into the page
│   │   ├── GftPanel.vue      #   Main floating panel (root component)
│   │   ├── StructureSection  #   Tag insertion UI
│   │   ├── CleanupSection    #   Fix All controls
│   │   ├── CorrectionPreview #   Diff preview modal
│   │   ├── LyricCardModal    #   Lyric card generator
│   │   ├── CustomButtonMgr   #   User-defined buttons
│   │   ├── FloatingToolbar   #   Contextual formatting bar
│   │   ├── OnboardingWizard  #   First-run tutorial
│   │   └── ...               #   + 10 more
│   └── popup/                # 3 popup components (Language, Mode, Theme selectors)
├── composables/              # 11 reactive composables
│   ├── useEditor.ts          #   Genius contenteditable interaction
│   ├── useCorrections.ts     #   Typographic cleanup engine
│   ├── useSettings.ts        #   Persistent user settings
│   ├── useSongData.ts        #   Page scraping (cover, artists, metadata)
│   ├── useLyricCard.ts       #   Card generation logic
│   ├── useUndoRedo.ts        #   10-state history
│   ├── useDraft.ts           #   Auto-save drafts
│   ├── useKeyboardShortcuts  #   Shortcut bindings
│   ├── useYoutubeControls    #   YouTube iframe API
│   ├── useExport.ts          #   .txt export
│   └── useGftState.ts        #   Global panel state
├── utils/                    # 9 pure utility modules
│   ├── corrections.ts        #   Correction rules (locale-aware)
│   ├── numberToWords.ts      #   Number → text conversion
│   ├── lyricCard.ts          #   Canvas rendering
│   ├── dom.ts                #   DOM helpers for Genius page
│   ├── diff.ts               #   Text diff algorithm
│   └── ...
├── types/                    # TypeScript type definitions
└── locales/
    ├── app/                  # Runtime translations (vue-i18n) — 8 locales
    │   ├── fr.json
    │   ├── en.json
    │   ├── pl.json
    │   ├── es.json
    │   ├── de.json
    │   ├── it.json
    │   ├── pt.json
    │   └── ru.json
    ├── *.json                # Manifest i18n (@wxt-dev/i18n) — 8 locales
    └── index.ts              # i18n setup & locale registration
```

---

## 🛠️ Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding standards, and PR workflow.

Additional documentation in the [`docs/`](docs/) folder:

| Document | Description |
|---|---|
| [ROADMAP.md](docs/ROADMAP.md) | Feature ideas and priorities |
| [PUBLISHING.md](docs/PUBLISHING.md) | Chrome Web Store & Firefox AMO publishing guide |
| [TESTING.md](docs/TESTING.md) | Manual testing checklist |
| [CHANGELOG.md](CHANGELOG.md) | Full version history |

---

## 🌍 Supported Languages

| Language | Tags | Fix All | Number → Words | UI |
|---|---|---|---|---|
| 🇫🇷 French | ✅ | ✅ | ✅ | ✅ |
| 🇬🇧 English | ✅ | ✅ | ✅ | ✅ |
| 🇵🇱 Polish | ✅ | ✅ | ✅ | ✅ |
| 🇪🇸 Spanish | ✅ | ✅ | — | ✅ |
| 🇩🇪 German | ✅ | ✅ | — | ✅ |
| 🇮🇹 Italian | ✅ | ✅ | — | ✅ |
| 🇵🇹 Portuguese | ✅ | ✅ | — | ✅ |
| 🇷🇺 Russian | ✅ | ✅ | — | ✅ |

---

## License

[MIT](LICENSE) — Developed with ❤️ by [Lnkhey](https://github.com/anthogoz).
