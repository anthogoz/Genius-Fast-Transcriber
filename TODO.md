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
- [ ] **Modularization Phase 2 (HELP WANTED)**: 
  - [ ] Remove duplicated code in `src/content.js` and replace with module imports.
  - [ ] Decouple `showProgress` via callback in `applyAllTextCorrectionsAsync` (partially done).
  - [ ] Finalize `GFT_STATE` shared state management across all modules.
- [ ] **Modularization Phase 3**: 
  - [ ] Extract `extractSongData`, configuration helpers, and artist UI logic into separate modules (partially done).
  - [ ] Extract the massive `initLyricsEditorEnhancer` and `showCorrectionPreview` functions.



---

## 💡 Ideas & Future Roadmap

### 🛠️ Personalization (Custom Commands System)
- [ ] Create an interface allowing users to define their own buttons and regex macros without touching the code.
- [ ] Import/Export system for "Button Packs" for the community.

### 🎨 User Experience (UX)
- [ ] **Keyboard Shortcuts**: Add hotkeys for frequent actions (e.g., `Ctrl+Shift+F` for Fix All).
- [ ] **Live Preview**: Highlight changes that corrections are about to make before applying them.
- [ ] **Themes**: Compact mode and customizable color themes.

### 🔌 Advanced Integrations
- [ ] **GFT + YouTube**: Better synchronization with the built-in Genius YouTube player.
- [ ] **Genius API**: Use the official API to validate metadata and suggest tags.

---

## 🤝 Community Call
The project is now open! 
**Feel free to propose your own ideas.**
Whether it's a small fix, a new shortcut, or a revolutionary feature, open an **Issue** or a **Pull Request**. The project evolves thanks to you.

*For more technical details, see `ROADMAP.md`.*
