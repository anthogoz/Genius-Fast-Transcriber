# 🤝 Contribution Guide

Thank you for your interest in contributing to **Genius Fast Transcriber**! This document will guide you through the contribution process.

## 📋 Table of Contents

1. [Test the Extension](#test-the-extension)
2. [Code of Conduct](#code-of-conduct)
3. [How to Contribute](#how-to-contribute)
4. [Report a Bug](#report-a-bug)
5. [Propose a New Feature](#propose-a-new-feature)
6. [Submit a Pull Request](#submit-a-pull-request)
7. [Style Guide](#style-guide)
8. [Code Architecture](#code-architecture)


## 📜 Code of Conduct

By participating in this project, you agree to maintain courteous and professional behavior. Be respectful to other contributors.

## 🚀 How to Contribute

There are several ways to contribute:

### 1. 🐛 Report bugs
Found a bug? Create an Issue!

### 2. 💡 Propose improvements
Have an idea to improve the extension? Share it!

### 3. 📝 Improve documentation
Documentation can always be improved (README, code comments, etc.)

### 4. 💻 Write code (Priority: Modularization!)
Check the [Open Issues](https://github.com/anthogoz/genius-fast-transcriber/issues) or the [TODO.md](TODO.md) file.
**We are currently looking for help with the modularization project (Phase 2 & 3).** See [MODULARIZATION_STATUS.md](MODULARIZATION_STATUS.md) for details.

## 🐛 Report a Bug

Before creating an Issue for a bug:

1. **Check** that the bug hasn't already been reported
2. **Test** with the latest version of the extension
3. **Include** this information in your report:
   - Clear description of the problem
   - Steps to reproduce the bug
   - Expected behavior vs. observed behavior
   - Browser and version (Chrome, Edge, etc.)
   - Screenshots if relevant
   - Console error messages (F12)

### Bug Issue Template

```markdown
**Bug Description**
A clear description of the problem.

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g. Chrome 130]
- Extension Version: [e.g. 4.2.0]
- Genius Page: [URL of the page]
```

## 💡 Propose a New Feature

Before proposing a feature:

1. **Check** that it is not already in [TODO.md](TODO.md)
2. **Create an Issue** with the label `enhancement`
3. **Explain**:
   - The problem it solves
   - How it would improve the user experience
   - Usage examples
   - Screenshots or mockups if possible

## 🔄 Submit a Pull Request

1. **Fork** the repository
2. **Create a new branch** from `main`
3. **Make your changes**
4. **Test** your changes
5. **Submit a Pull Request** to the `main` branch


# 📦 Development Setup

## Prerequisites

- [Node.js](https://nodejs.org) (v18+)
- npm (v9+)
- Chrome or Chromium-based browser

## Getting Started

```bash
# Clone the repository
git clone https://github.com/anthogoz/Genius-Fast-Transcriber.git
cd genius-fast-transcriber

# Install dependencies
npm install

# Start development server with HMR
npm run dev
```

WXT will open a new Chrome window with the extension loaded. Changes to Vue components and styles hot-reload automatically.

### Useful Commands

| Command | Description |
|---|---|
| `npm run dev` | Dev server with hot module replacement (HMR) |
| `npm run build` | Production build to `.output/chrome-mv3/` |
| `npm run zip` | Package `.zip` for Chrome Web Store |
| `npm run lint` | Lint the code with Biome |
| `npm run lint:fix` | Fix linting errors with Biome |
| `npm run format` | Format the code with Biome |
| `npm run typecheck` | TypeScript type-checking via `vue-tsc` |

## Project Architecture

```
src/
├── entrypoints/
│   ├── content.ts        # Injected on *://*.genius.com/*-lyrics
│   └── popup/            # Extension popup (settings UI)
│       ├── index.html
│       ├── index.ts
│       └── App.vue
├── components/
│   ├── content/          # 15 components for the content script UI
│   └── popup/            # 3 components for the popup
├── composables/          # Reactive logic (useSettings, useEditor, useCorrections…)
├── utils/                # Pure functions (corrections, numberToWords, diff, artists…)
├── types/index.ts        # Shared TypeScript types
├── locales/
│   └── app/              # In-app translations (vue-i18n)
│   └── <code>.json       # extName, extDescription (wxt-dev/i18n for manifest)
│   └── index.ts          # i18n setup and locale registration
```

### Key Concepts

- **Entrypoints** follow [WXT conventions](https://wxt.dev/guide/essentials/entrypoints.html). The content script uses a `MutationObserver` to detect the Genius lyrics editor, then mounts a Vue app.
- **Composables** manage all reactive state. `useGftState` holds global state; `useSettings` wraps `localStorage` preferences; `useEditor` abstracts textarea vs. contenteditable interaction.
- **Utils** are pure functions with no side effects — easy to unit test.
- **Translations** live in `src/locales/app/*.json`. The user selects FR/EN/PL at runtime via the popup; `vue-i18n` handles locale switching.

## Coding Standards

### TypeScript
- Strict mode is enabled. All code must pass `npm run typecheck`.
- Use proper types for function parameters and return values.
- Prefer `const` over `let`. Avoid `any` unless strictly necessary.

### Vue Components
- Use `<script setup lang="ts">` for all components.
- Use `defineProps`, `defineEmits` and `defineModel` with TypeScript generics.
- Use `<style scoped>` for component styles.
- Use `useI18n()` from `vue-i18n` for all user-facing text.

### Naming
- Components: `PascalCase.vue` (e.g. `StructureSection.vue`)
- Composables: `useCamelCase.ts` (e.g. `useSettings.ts`)
- Utils: `camelCase.ts` (e.g. `numberToWords.ts`)
- Types: `PascalCase` for interfaces, `camelCase` for type aliases

### Comments
- Do not add comments that merely describe what the code does.
- Only comment non-obvious intent, trade-offs, or constraints.

### Commit Conventions

Use the following prefixes:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code formatting (no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

## How to Contribute

### Adding a New Structure Tag
1. Add the translation keys (`btn_<tag>`, `btn_<tag>_tooltip`) to all three locale files in `src/locales/app/`.
2. Add the button in `src/components/content/StructureSection.vue`.

### Adding a New Correction Rule
1. Add the rule to `CORRECTION_RULES` in `src/utils/corrections.ts`.
2. Add the corresponding progress key to the locale files.
3. Add the checkbox option in `src/components/content/CorrectionPreview.vue`.

### Adding a New Language
1. Create `src/locales/<code>.json` with `extName` and `extDescription`.
2. Create `src/locales/app/<code>.json` with all translation keys.
3. Add the locale to the `Locale` type in `src/types/index.ts`.
4. Register it in `src/locales/index.ts`.
5. Add a button in `src/components/popup/LanguageSelector.vue`.
