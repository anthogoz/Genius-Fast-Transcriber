# Testing Guide

How to test Genius Fast Transcriber before publishing.

## Development Testing

```bash
npm run dev
```

WXT opens a Chrome window with the extension loaded. Changes hot-reload automatically.

## Manual Testing Checklist

### Content Script (on a Genius lyrics page)

- [ ] Panel appears when entering the lyrics editor
- [ ] Artist detection works (main + featuring)
- [ ] Structure tags insert correctly with artist attribution
- [ ] Verse counter increments/decrements properly
- [ ] "Fix All" opens the correction preview modal
- [ ] Individual correction buttons work (apostrophes, quotes, dashes, spacing…)
- [ ] Bracket check highlights unmatched brackets
- [ ] Export buttons download `.txt` files with correct content
- [ ] Floating toolbar appears on text selection (Bold, Italic, Number→Words, Lyric Card)
- [ ] Undo/Redo works (`Ctrl+Z` / `Ctrl+Y`)
- [ ] Draft auto-save triggers, and restore notification appears on reload
- [ ] Dark mode / Light mode toggle works
- [ ] Settings menu opens and all toggles function
- [ ] Find & Replace works (with and without regex)
- [ ] Statistics display updates reactively
- [ ] Keyboard shortcuts work (`Ctrl+1–5`, `Ctrl+Shift+C`, `Ctrl+D`)
- [ ] YouTube playback controls work (`Ctrl+Alt+Space`, `Ctrl+Alt+←/→`)

### Popup

- [ ] Shows "Available only on Genius.com" on non-Genius tabs
- [ ] Loads current state from content script (mode, theme, language)
- [ ] Mode switching works (Full / Lyric Card Only)
- [ ] Theme switching works (Light / Dark)
- [ ] Language switching works (FR / EN / PL)
- [ ] "Restart tutorial" resets onboarding
- [ ] Page reloads after changes

### Onboarding

- [ ] Appears on first install (or after tutorial reset)
- [ ] All steps navigate correctly
- [ ] Mode, theme, and language selections are saved
- [ ] Panel loads after completing onboarding

### Languages

- [ ] All three locales display correctly (FR, EN, PL)
- [ ] Structure tags adapt to locale ([Couplet] vs [Verse] vs [Zwrotka])
- [ ] Locale-specific corrections appear (French quotes, Polish quotes, etc.)
- [ ] Number-to-words conversion works in all three languages

### Edge Cases

- [ ] Works on both textarea and contenteditable editors
- [ ] Handles pages with no artists gracefully
- [ ] Handles very long lyrics (1000+ lines)
- [ ] No console errors during normal usage

## Type Checking

```bash
npm run typecheck
```

Must pass with zero errors before any release.
