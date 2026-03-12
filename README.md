# 🎵 Genius Fast Transcriber + Lyric Card Maker

![Version](https://img.shields.io/badge/version-4.2.0-blue.svg?style=for-the-badge)
![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-green.svg?style=for-the-badge&logo=google-chrome)
![License](https://img.shields.io/badge/license-MIT-orange.svg?style=for-the-badge)
![Built with](https://img.shields.io/badge/built_with-WXT_+_Vue_+_TypeScript-blueviolet.svg?style=for-the-badge)

**The ultimate tool for transcribers on Genius.com.**
Transform your editing experience with a suite of professional tools, a modern interface, smart automations, and full customization.

---

---

## 🌟 Why use Genius Fast Transcriber?

🚀 **Save time**: Insert entire structures and fix typography in one click.
🧠 **Customizable**: Create your own buttons and macros.
🎨 **Impeccable results**: Your lyrics automatically respect Genius quality standards.
🌍 **International**: Available in **French**, **English**, and **Polish** (with specific typography rules for each).
🌙 **Dark Mode by default**: Beautiful dark interface that's easy on the eyes.

---

## 🔥 Key Features

### � New in v3.0: Custom Buttons!
*   **Create your own buttons**: Add your own tags or complex regex cleanup tools.
*   **Easy Interface**: A simple graphical manager to add/edit buttons.
*   **Regex Support**: Power users can use Regular Expressions for advanced find/replace.
*   **Share Presets**: Export your buttons as a code snippet and share them with friends!

### �🏗️ Structure & Smart Tags
*   **Unified Verse Manager**: A dynamic central button for `[Couplet 1]`, `[Couplet 2]` with fast navigation ← →.
*   **Artist Detection**: The extension scans the page and proposes artists (Main & Feat) to check for automatic attribution.
*   **Quick Tags**: `[Refrain]`, `[Intro]`, `[Bridge]`... inserted cleanly with correct credits.
*   **Multi-language**: Adapts tags to English (`[Verse]`, `[Chorus]`) or French (`[Couplet]`, `[Refrain]`).

### ✨ Corrections & Quality
*   **Fix All** ✨: A prominent button that cleans everything in one click:
    *   Curly apostrophes `'` → `'`
    *   Capitalization at start of lines
    *   Removal of unnecessary final punctuation (preserves `...` ellipsis!)
    *   Correction of spaces `y'` → `y `
    *   French quotes `«»` → `"` (or Polish `„""` → `"`)
    *   Long dashes `— –` → `-` (or `-` → `—` for Polish)
    *   Double spaces removed
    *   Proper line spacing between sections
*   **Parenthesis Check**: Detects and highlights in **RED** unclosed or mismatched parentheses `( )` or brackets `[ ]`.

### 🎨 Creation Tools
*   **Floating Bar**: Select text, a bar appears to format **Bold**, *Italics*...
*   **Number to Words Converter**: Select "42" and click the magic button to get "forty-two" (or "quarante-deux" in FR, "czterdzieści dwa" in PL).
*   **Customizable Lyric Card**: Create beautiful images of lyrics for Instagram/Twitter.
    *   Choose between **Album Art** or **Artist Image** for the background! 🖼️
    *   Multiple formats: 16:9, 9:16, 1:1
    *   Preview before download.
*   **Lyric Card Only Mode**: Hide the transcription tools to keep only Lyric Card functionality.

### 📤 Export & Sharing
*   **Export as .txt**: Download the song lyrics as a clean text file directly from the Genius toolbar.
*   **Smart Cleaning**: Automatically removes "Contributors" headers, Genius annotations (hyperlinks), and HTML tags.
*   **Multiple Formats**:
    *   **Standard**: Keeps tags and spacing.
    *   **No Tags**: Removes [Verse], [Chorus], etc.
    *   **No Spacing**: Removes empty lines.
    *   **Raw**: Pure text without tags or spacing.
*   **Intelligent Scraper**: If the editor is closed, GFT automatically scrapes the lyrics from the page.

### 🤖 AI Transcription
*   **Quick access** to external AI transcription tool directly from the panel footer.

### ❓ Tutorial & Support
*   **Interactive Tutorial**: A step-by-step guide on first install to choose your language, theme, and mode.
*   **Relaunch Tutorial**: Access via the settings menu to replay the tutorial at any time.

### 📺 YouTube Control
*   **Control music** without taking your eyes off the editor:
    *   Play / Pause
    *   Rewind / Forward 5 seconds
    *   Compatible with "nocookie" integrations (privacy protection).

### 🛡️ Security & History
*   **Visual Undo/Redo**: Undo your actions (Ctrl+Z) with a history of 10 states.
*   **Draft Save**: Your changes are saved locally. A crash? We restore everything.
*   **Dark Mode**: An interface perfectly adapted to dark theme, enabled by default.

---

## ⌨️ Pro Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + 1` to `5` | Insert structure tags (Verse, Chorus...) |
| `Ctrl + Shift + C` | **Fix All** (Opens preview) |
| `Ctrl + D` | Duplicate current line |
| `Ctrl + Z` | Undo |
| `Ctrl + Y` | Redo |
| `Ctrl + Shift + S` | Show/Hide statistics |
| `Ctrl + Alt + Space` | **Play / Pause** YouTube |
| `Ctrl + Alt + ←` | Rewind 5s |
| `Ctrl + Alt + →` | Forward 5s |

---

## 📥 Installation

### Chrome Web Store
Install from the [Chrome Web Store](https://chromewebstore.google.com/detail/cbldlkiakadclpjfkkafpjomilmmgdjm).

### Manual (Developer Mode)
1. Clone or download the repository.
2. Install dependencies and build:
   ```bash
   npm install
   npm run build
   ```
3. Go to `chrome://extensions`, enable **Developer mode**.
4. Click **Load unpacked** and select the `.output/chrome-mv3` folder.

---

## Development

The project is built with [WXT](https://wxt.dev), [Vue 3](https://vuejs.org), and [TypeScript](https://www.typescriptlang.org).

```bash
npm install
npm run dev          # Start dev server with HMR
npm run build        # Production build
npm run zip          # Package for Chrome Web Store
npm run lint         # Lint the code with Biome
npm run lint:fix     # Fix linting errors with Biome
npm run format       # Format the code with Biome
npm run typecheck    # TypeScript type-checking
```

### Project Structure

```
src/
├── entrypoints/          # WXT entrypoints
│   ├── content/          # Content script (injected on *://*.genius.com/*-lyrics)
│   └── popup/            # Extension popup
├── components/           # Vue 3 SFC components
│   ├── content/          # Panel, toolbar, modals (15 components)
│   └── popup/            # Mode, theme, language selectors
├── composables/          # Reactive state management
├── utils/                # Pure utility functions
├── types/                # TypeScript type definitions
├── locales/              # @wxt-dev/i18n (Chrome manifest strings)
│   └── app/              # vue-i18n (in-app translations, 320+ keys)
└── i18n/                 # vue-i18n setup
```

---

## 🛠️ Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup instructions, coding standards, and PR workflow.

Additional documentation is available in the [`docs/`](docs/) folder:

- [ROADMAP.md](docs/ROADMAP.md) — Feature ideas and priorities
- [PUBLISHING.md](docs/PUBLISHING.md) — Chrome Web Store publishing guide
- [TESTING.md](docs/TESTING.md) — Testing checklist

---

## License

[MIT](LICENSE) — Developed with ❤️ by [Lnkhey](https://github.com/anthogoz).
