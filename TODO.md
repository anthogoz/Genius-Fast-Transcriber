# 🚧 Roadmap & TODO

The project has reached a major milestone with **Version 4.0.0**! The infrastructure is now modern, modular, and ready for community growth. 🎉

---

## ✅ Completed (v4.0.0)
- [x] **Modularization Phase 1**: Code extraction to `src/modules/` (Translations, Constants, Utils, Corrections).
- [x] **Build System**: esbuild integration for ultra-fast builds (<100ms).
- [x] **Automated Releases**: Packaging script that names the ZIP based on the manifest version.
- [x] **Dev Documentation**: Creation of comprehensive guides for contributors.
- [x] **Export to .txt**: New toolbar feature for instant, cleaned lyrics downloads.
- [x] **License & Open Source**: Switched to MIT license and project cleanup.
- [x] **Disable Tooltips**: New setting to toggle button tooltips in the interface.
- [x] **Stability Fix**: Resolved "Extension context invalidated" errors during updates.
- [x] **Lyric Card Update (v4.0.2)**:
  - [x] Support for **9:16 (Portrait/Stories)** format.
  - [x] Replaced format cycle button with a **dropdown selector**.
  - [x] Added a **Zoom Slider** (0.5x to 2.0x) for precise lyric sizing.
  - [x] **Bug Fix**: Vertical text centering corrected for all zoom levels.
  - [x] **Modern UI Overhaul**: New professional design with glassmorphism and icons.
- [x] **Fixes & Improvements (v4.0.3)**:
  - [x] **Bug Fix**: Incorrect apostrophe counts and regex patterns fixed.
  - [x] **Feature**: Auto-spacing before punctuation (`?` and `!`) in French transcription mode.
- [x] **Refactoring (v4.1.0)**:
  - [x] Merged duplicated text cleanup code into a unified pipeline in `corrections.js`.
  ### 🛠️ Personalization (Custom Commands System)
- [x] Create an interface allowing users to define their own buttons and regex macros without       touching the code.
- [x] Import/Export system for "Button Packs" for the community.
- [ ] **Modularization Phase 2 (HELP WANTED)**: 
  - [ ] Remove duplicated code in `src/content.js` and replace with module imports.
  - [ ] Decouple `showProgress` via callback in `applyAllTextCorrectionsAsync` (partially done).
  - [ ] Finalize `GFT_STATE` shared state management across all modules.
- [ ] **Modularization Phase 3**: 
  - [ ] Extract `extractSongData`, configuration helpers, and artist UI logic into separate modules (partially done).
  - [ ] Extract the massive `initLyricsEditorEnhancer` and `showCorrectionPreview` functions.



---

## 💡 Ideas & Future Roadmap



### 🎨 User Experience (UX)
- [ ] **Keyboard Shortcuts**: Add hotkeys for frequent actions (e.g., `Ctrl+Shift+F` for Fix All).

### 🔌 Advanced Integrations
- [ ] **GFT + YouTube**: Better synchronization with the built-in Genius YouTube player.
- [ ] **Genius API**: Use the official API to validate metadata and suggest tags.

---

## 🤝 Community Call
The project is now open! 
**Feel free to propose your own ideas.**
Whether it's a small fix, a new shortcut, or a revolutionary feature, open an **Issue** or a **Pull Request**. The project evolves thanks to you.

*For more technical details, see `ROADMAP.md`.*
