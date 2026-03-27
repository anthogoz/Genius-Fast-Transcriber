# Changelog

All notable changes to this project will be documented in this file.

## [4.4.12] — 2026-03-27

### Changed
- Address dependencies vulnerability and update related packages for security and stability.

## [4.4.11] — 2026-03-21

### Changed
- Increased Firefox minimum version requirement.
- Explicitly declared no data collection permissions for Firefox/AMO compliance.

## [4.4.10] — 2026-03-21

### Added
- `data_collection_permissions` in Firefox manifest configuration for AMO compliance.

## [4.4.9] — 2026-03-21

### Changed
- Refined the manual GitHub Actions release workflow for version validation, build artifacts, and AMO submission.

## [4.4.7] — 2026-03-21

### Changed
- Improved manual release workflow behavior for GitHub Releases and Firefox Add-ons publishing.

## [4.4.6] — 2026-03-20

### Changed
- Updated CI release flow to support manual GitHub release publishing and Firefox Add-ons submission.

## [4.4.5] — 2026-03-20

### Added
- Manual release workflow for building artifacts, tagging releases, creating GitHub Releases, and publishing to AMO.

## [4.4.4] — 2026-03-20

### Changed
- Iterative improvements to the manual release workflow for version checks, artifact handling, and Firefox Add-ons submission.

## [4.4.3] — 2026-03-20

### Changed
- Improved manual release workflow for validated versioning, artifact build, and GitHub/Firefox publication.

## [4.4.2] — 2026-03-20

### Changed
- Updated manual release automation for version validation, build artifact generation, GitHub Releases, and AMO publication.

## [4.4.1] — 2026-03-20

### Added
- Firefox-specific manifest settings (extension ID and minimum browser version).

### Changed
- Improved manual release GitHub Actions workflow for GitHub Releases and Firefox AMO publishing.

## [4.4.0] — 2026-03-20

### Added
- New correction utilities for section tags, line spacing, repetition expansion, capitalization, and tag separator normalization.
- Composable for extracting Genius song data used by correction workflows.

### Changed
- Integrated and expanded cleanup/correction tools with keyboard shortcut support and multilingual coverage.
- Dependency and formatting maintenance updates for project stability.

## [4.3.0] — 2026-03-15

### Added
- New settings system with dedicated UI for editor preferences, shortcuts, and tool behavior.
- Lyric Card creation modal and related UI flows.
- Expanded localization support across app and content interfaces (French, Polish, English).
- New structuring/cleanup tooling and verse management capabilities.

### Fixed
- Polish pluralization logic for 3-form strings.

## [4.2.0] — 2026-03-15

### Added
- Manual GitHub Actions release workflow (`.github/workflows/release.yml`) for validated version bumps, build artifacts, and tagged GitHub releases.
- VS Code workspace recommendations/settings (`.vscode/extensions.json`, `.vscode/settings.json`).

### Fixed
- YouTube iframe seeking behavior in the editor workflow.
- Lint/type-related issues discovered during the migration stabilization.

### Changed
- **Complete rewrite** using [WXT](https://wxt.dev), Vue 3, and TypeScript.
- Modular architecture: 48 source files replacing the monolithic `content.js` (~6350 lines).
- Vue 3 SFC components for all UI (panel, toolbar, modals, popup, onboarding).
- Type-safe codebase with strict TypeScript and `vue-tsc` checking.
- Reactive state management via Vue composables (`useGftState`, `useSettings`, `useEditor`, etc.).
- `@wxt-dev/i18n` for Chrome manifest i18n, `vue-i18n` for runtime translations with locale switching.
- Vite-based build with HMR dev server replacing esbuild.
- New documentation in the `docs/` folder.
- Biome for linting and formatting.
- Performance improvements for diff/comparison-related flows and general UI responsiveness.
- CI/CD and release process modernization with reproducible zip artifacts for Chromium and Firefox.

### Removed
- Legacy monolithic implementation and obsolete module files from the previous architecture.
- Old build/documentation files replaced by the new project structure.

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
