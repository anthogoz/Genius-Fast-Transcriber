# 🎵 Genius Fast Transcriber + Lyric Card Maker

![Version](https://img.shields.io/badge/version-3.1.0-blue.svg?style=for-the-badge)
![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-Available-green.svg?style=for-the-badge&logo=google-chrome)
![License](https://img.shields.io/badge/license-MIT-orange.svg?style=for-the-badge)

**The ultimate tool for transcribers on Genius.com.**
Transform your editing experience with a suite of professional tools, a modern interface, smart automations, and full customization.

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
|-----------|--------|
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

1.  Go to the **Chrome Web Store** here: https://chromewebstore.google.com/detail/cbldlkiakadclpjfkkafpjomilmmgdjm.
2.  Or install manually (Developer Mode):
    *   Download the code.
    *   Go to `chrome://extensions`.
    *   Enable "Developer mode".
    *   "Load unpacked" and select the folder.

---

## 🆕 What's New in v3.1.0

- 🇵🇱 **Polish Language Support**: Full support for Genius Polska guidelines!
    - **UI Translation**: Interface fully localized in Polish.
    - **Smart Tags**: `[Zwrotka]`, `[Refren]`, `[Przyśpiewka]`, etc. with correct variations.
    - **Specific Cleanups**: Polish quotes `„”` and Em-dashes `-` → `—`.
- 🔍 **Find & Replace Tool**:
    - A powerful new tool integrated directly into the panel.
    - **Regex Support**: toggleable regex mode for advanced users.
    - **Collapsible UI**: Keeps the panel clean when not in use.
- 🎨 **UI Overhaul**:
    - **Transitions**: Smooth animations for opening/closing sections.
    - **Improved Layout**: Better button placement and consistent sizing.
    - **Auto-save Indicator**: Clearer `💾` icon pulsation when drafts are saved.
- 🛠️ **Fixes & Optimizations**:
    - Enhanced tooltip visibility.
    - Improved formatting for multi-line replacements.

## 🆕 What's New in v3.0.1

- 🇵🇱 **Polish Language Support**: Full support for Genius Polska guidelines!
    - **UI Translation**: Interface available in Polish.
    - **Smart Tags**: `[Zwrotka]`, `[Refren]`, `[Przyśpiewka]`, etc.
    - **Specific Cleanups**: Polish quotes `„""` -> `"` and Em-dashes `-` -> `—`.
- 🐛 **Bug Fixes**: Improved notification translations and formatting fixes.

## 🆕 What's New in v3.0.0

- ✨ **Custom Buttons Manager**: Power to the users! Create your own insertion or cleanup buttons.
- 🌍 **Full English Support**: Number conversion, tags, and tools are now fully localized.
- � **Number to Words**: Convert digits to words in seconds (English & French supported).
- �️ **Lyric Card Only Mode**: For users who just want to share lyrics.
- 🎨 **Premium UI**: New animations, better spacing, and improved readability.
- � **Bug fixes**: Stability and performance improvements.

---

## 🛠️ Contribute

This project is open-source and community-driven!
We need your ideas for **Code Modularization** and new features.

👉 **See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.**

---

*Developed with ❤️ by Lnkhey.*
