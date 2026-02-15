# Commit Message Suggestions

## For Initial Commit

```
🔧 Add modular build system with esbuild

- Set up esbuild for bundling
- Create modular src/ structure
- Extract 4 core modules (2,052 lines):
  * translations/ - All FR/EN/PL UI strings
  * modules/constants.js - Global state & config
  * modules/utils.js - Helper functions
  * modules/corrections.js - Text processing
- Add npm build scripts (build, watch)
- Configure .gitignore for node_modules
- Preserve original code in content.original.js

All functionality intact. No breaking changes.
Build verified: ✅ content.js (325 KB)

Closes #[issue-number] (if applicable)
```

## Alternative Short Version

```
feat: modular build system with esbuild

- Extracted 2,052 lines into 4 modules
- Added npm build/watch scripts  
- No functionality changes
```

## For Future Commits (Phase 2)

```
refactor: integrate module imports in src/content.js

- Import TRANSLATIONS from translations/index.js
- Use getTranslation() from modules/utils.js
- Remove duplicated translation code
- Tests passing ✅
```

---

## Git Workflow Suggestions

### Initial Setup
```bash
git add .
git commit -m "🔧 Add modular build system with esbuild"
git push
```

### Tagging Release
```bash
git tag -a v3.1.0-modular -m "Version 3.1.0 with modular build system"
git push --tags
```

---

## Files to Commit

### Must Include
- ✅ `package.json`, `package-lock.json`
- ✅ `esbuild.config.js`
- ✅ `.gitignore`
- ✅ `src/` directory (all modules)
- ✅ `scripts/` directory
- ✅ `MODULARIZATION_COMPLETE.md`
- ✅ `QUICKSTART.md`
- ✅ Updated `README.md`

### Optional (User Preference)
- `content.js` (compiled output — some prefer to commit, some don't)
- `content.original.js` (backup — up to you)

### Never Commit
- ❌ `node_modules/`
- ❌ `package-lock.json` (if team prefers, but usually yes)
- ❌ `.DS_Store` (macOS)
- ❌ `*.log` files

---

## .gitignore Check

Already configured:
```
node_modules/
package-lock.json
```

Consider adding:
```
*.log
.DS_Store
.vscode/ (if not shared)
content.js.map (if sourcemaps enabled)
```
