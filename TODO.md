# 🚧 Roadmap & TODO

The project has reached a major milestone with **Version 4.0.0**! The infrastructure is now modern, modular, and ready for community growth. 🎉

---

## ✅ Completed (v4.0.0)
- [x] **Modularization Phase 1**: Code extraction to `src/modules/` (Translations, Constants, Utils, Corrections).
- [x] **Build System**: esbuild integration for ultra-fast builds (<100ms).
- [x] **Automated Releases**: Packaging script that names the ZIP based on the manifest version.
- [x] **Dev Documentation**: Creation of comprehensive guides for contributors.
- [x] **License & Open Source**: Switched to MIT license and project cleanup.
- [x] **Modularization Phase 2**: Removal of duplicated code in `content.js` and module imports.
  - [x] Removed ~960 lines of `TRANSLATIONS` (imported from `translations/index.js`).
  - [x] Removed ~480 lines of utility functions (imported from `modules/utils.js`).
  - [x] Removed ~510 lines of correction functions (imported from `modules/corrections.js`).
  - [x] Removed 4 duplicate functions (isHeaderFeatEnabled, setHeaderFeatEnabled, generateLyricsCard, highlightUnmatchedBracketsInEditor).
  - [x] Decoupled `showProgress` via callback in `applyAllTextCorrectionsAsync`.
  - [x] `content.js` reduced from **8685 → 6585 lines** (~24% reduction).

---

- [x] **Modularization Phase 3**:
  - [x] Shared state management (`GFT_STATE`) across all modules.
  - [x] Extracted `extractSongData` (100+ lines), configuration helpers, and artist UI logic into separate modules.
  - [x] `content.js` reduced from **6585 → 6427 lines**.
- [x] **Full Internationalization**: All side panel UI labels, tooltips, and feedback messages migrated to the translation system (FR, EN, PL).
- [x] **Zero Build Warnings**: 91 duplicate translation keys resolved and cleaned up via automated script.

---

## 🚨 Current Priorities (Phase 4)

### 🧪 Quality Assurance & Testing
- [ ] **Unit Testing**: Set up Jest to test critical functions (text corrections, number conversion).
- [ ] **Integration Tests**: Verify that modularized state (`GFT_STATE`) works correctly under different browser scenarios.

### 🔧 Further Modularization
- [ ] **Modularization Phase 4**: Extract the massive `initLyricsEditorEnhancer` and `showCorrectionPreview` functions.


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
