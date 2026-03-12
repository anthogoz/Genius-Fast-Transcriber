# Roadmap

Feature ideas and improvement priorities for Genius Fast Transcriber.

> The extension is already fully functional. These are suggestions for future enhancements, not obligations.

---

## High Priority

### Automated Testing
- [ ] Unit tests for utility functions (corrections, number conversion, artist extraction)
- [ ] Component tests for key Vue components
- [ ] CI/CD with GitHub Actions (build + type-check on PR)

### Performance Optimization
- [ ] Lazy-load heavy components (Lyric Card modal, Correction Preview)
- [ ] Debounce frequent events (editor input, selection change)
- [ ] Optimize regex execution in correction rules

### Better YouTube Integration
- [ ] Auto-detect YouTube timestamps
- [ ] Sync playback with editor cursor position
- [ ] Extract lyrics from YouTube auto-captions

---

## Medium Priority

### Structure Templates
- [ ] Predefined templates for common song structures (Intro/Verse/Chorus/Bridge/Outro)
- [ ] Save custom templates
- [ ] One-click insertion of full structure

### Configurable Keyboard Shortcuts
- [ ] User-editable shortcut bindings
- [ ] Keyboard navigation within the panel

### Additional Languages
- [ ] Spanish, Portuguese, German, Italian support
- [ ] Auto-detect page language and suggest matching locale

### Genius API Integration
- [ ] Fetch official metadata (artists, album, release date)
- [ ] Tag validation against Genius guidelines
- [ ] Richer artist suggestions

---

## Low Priority (Nice to Have)

### Theming
- [ ] Custom color themes beyond light/dark
- [ ] High-contrast accessibility mode
- [ ] Compact mode for small screens

### Additional Export Formats
- [ ] Export as `.lrc` (synced lyrics)
- [ ] Export as JSON
- [ ] Copy formatted for Discord/Markdown

### UX Improvements
- [ ] Drag & drop to reorder custom buttons
- [ ] Contribution stats (corrections applied, songs edited)
- [ ] Print-friendly lyrics formatting

### Browser Support
- [ ] Firefox extension (WXT supports this via `npm run build:firefox`)
- [ ] Safari Web Extension

---

## Community Ideas

These have been suggested but need further discussion:

- AI-powered lyric suggestions (GPT API)
- OCR for lyrics from images
- Voice-to-text transcription
- Real-time collaboration between editors
- Mobile companion app

---

## For Contributors

### Beginner-Friendly
- Add missing translation keys
- Write unit tests for `src/utils/` functions
- Fix typos in documentation

### Intermediate
- Implement structure templates
- Add a new language locale
- Improve correction rules

### Advanced
- Genius API integration
- YouTube sync improvements
- Performance profiling and optimization

See [CONTRIBUTING.md](../CONTRIBUTING.md) for setup instructions and coding standards.
