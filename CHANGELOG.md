# Changelog

All notable changes to this project will be documented in this file.

## [4.5.4] — 2026-04-25

### Changed
- Address dependencies vulnerability and update related packages for security and stability.
- Dependabot configuration added for automated dependency updates and security monitoring.

## [4.5.3] — 2026-04-22

### Changed
- Added song data extraction integration through a dedicated composable and content script entry-point wiring.
- Improved export utility integration for the new extraction flow.

## [4.5.2] — 2026-04-22

### Added
- Lyrics export flow with configurable formatting options and DOM-based text extraction.
- Onboarding wizard stepper for language, theme, and mode selection.

### Changed
- Improved first-run setup experience with a more guided onboarding flow.

## [4.5.1] — 2026-04-06

### Added
- Background fetch proxy and lyric card utilities for artist image retrieval and rendering.
- Manual release workflow for versioning, building, and publishing artifacts.

### Changed
- Updated README with expanded feature list, multi-browser support details, and formatting improvements.

## [4.5.0] — 2026-04-03

### Added
- Core song data extraction foundations and initial project infrastructure.
- Onboarding wizard implementation with multi-language support and configuration flow.
- Lyric card modal and generation flow with image customization and export capability.

## [4.4.12] — 2026-03-27

### Changed
- Address dependencies vulnerability and update related packages for security and stability.

## [4.4.1 - 4.4.11] — 2026-03-20 to 2026-03-21

### Added
- Firefox-specific manifest settings (extension ID and minimum browser version).
- `data_collection_permissions` in Firefox manifest configuration for AMO compliance.

### Changed
- Iterative manual release workflow refinements for version validation, artifact handling, GitHub Releases, and Firefox/AMO submission.
- Improved CI release behavior for GitHub Releases and Firefox Add-ons publishing.
- Increased Firefox minimum version requirement.
- Explicitly declared no data collection permissions for Firefox/AMO compliance.

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
