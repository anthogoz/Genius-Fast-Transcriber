# Changelog

All notable changes to this project will be documented in this file.

## [4.2.0] — 2026-03-12

### Changed
- **Complete rewrite** using [WXT](https://wxt.dev), Vue 3, and TypeScript.
- Modular architecture: 48 source files replacing the monolithic `content.js` (~6350 lines).
- Vue 3 SFC components for all UI (panel, toolbar, modals, popup, onboarding).
- Type-safe codebase with strict TypeScript and `vue-tsc` checking.
- Reactive state management via Vue composables (`useGftState`, `useSettings`, `useEditor`, etc.).
- Tailwind CSS v4 for styling.
- `@wxt-dev/i18n` for Chrome manifest i18n, `vue-i18n` for runtime translations with locale switching.
- Vite-based build with HMR dev server replacing esbuild.
- New documentation in the `docs/` folder.

## [4.1.1]

### Fixed
- Minor bug fixes and tooltip improvements.
- Custom Button Manager UI refinements.

## [4.0.0]

### Added
- **Export to .txt**: Professional lyrics export with smart cleaning (removes annotations, HTML, headers).
- Four export formats: Standard, No Tags, No Spacing, Raw text.
- Modular ES6 architecture with esbuild bundling.

### Changed
- Custom Buttons Manager UI overhaul.
- Smoother dropdown menus and improved button alignment.
- Native Genius styling for seamless integration.

## [3.1.0]

### Added
- **Polish language support**: Full UI translation, smart tags (`[Zwrotka]`, `[Refren]`, `[Przyśpiewka]`), Polish-specific cleanups (`„"` quotes, em-dashes).
- **Find & Replace** tool with regex toggle.
- Auto-save indicator with `💾` pulsation.

### Changed
- UI overhaul: smooth transitions, better button placement, improved layout.
- Enhanced tooltip visibility.

## [3.0.0]

### Added
- **Custom Buttons Manager**: Create insertion or regex cleanup buttons with import/export.
- **Full English support**: Number conversion, tags, and tools localized.
- **Number to Words**: Digit-to-word conversion (FR, EN).
- **Lyric Card Only Mode**: Simplified mode for sharing lyrics as images.

### Changed
- Premium UI with new animations, better spacing, and improved readability.
