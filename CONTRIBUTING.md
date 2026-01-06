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

## 🧪 Test the Extension

Before contributing, we recommend you **test the extension** to fully understand how it works!

### Installation from Chrome Web Store

The extension is **very easily installable** on all Chromium browsers (Chrome, Edge, Brave, Opera, etc.):

**[📥 Install Genius Fast Transcriber](https://chromewebstore.google.com/detail/genius-fast-transcriber-b/cbldlkiakadclpjfkkafpjomilmmgdjm?hl=en)**

> ⭐ **Rating 5/5** - Installed in 3 clicks!

### Development Mode Installation (for contributing)

If you want to test your local changes:

1. **Clone** the repository:
   ```bash
   git clone https://github.com/anthogoz/genius-fast-transcriber.git
   cd genius-fast-transcriber
   ```

2. **Load the extension** in your browser:
   - Chrome/Edge: Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the project folder

3. **Test** on [Genius.com](https://genius.com) by editing lyrics

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

### 4. 💻 Write code
Check the [Open Issues](https://github.com/anthogoz/genius-fast-transcriber/issues) or the [TODO.md](TODO.md) file.

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
- Browser: [e.g. Chrome 120]
- Extension Version: [e.g. 1.5.0]
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

### Step 1: Prepare your environment

```bash
# Fork the project on GitHub, then:
git clone https://github.com/anthogoz/genius-fast-transcriber.git
cd genius-fast-transcriber

# Create a branch for your feature
git checkout -b feature/my-new-feature
```

### Step 2: Make your changes

- Write clean and commented code
- Follow the [Style Guide](#style-guide)
- Test your changes on Genius.com

### Step 3: Commit your changes

```bash
git add .
git commit -m "feat: add [short description]"
```

### Commit Conventions

Use the following prefixes:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation only
- `style:` Code formatting (no logic change)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

### Step 4: Push and create the PR

```bash
git push origin feature/my-new-feature
```

Then create a Pull Request on GitHub with:
- A clear title
- A detailed description of changes
- References to linked Issues (e.g., `Closes #42`)
- Screenshots if relevant

## 🎨 Style Guide

### JavaScript

- **Indentation**: Use spaces (existing code uses a mix, but favor consistency)
- **Comments**: Comment complex functions with JSDoc
- **Naming**:
  - Variables: `camelCase` (e.g., `currentActiveEditor`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `SHORTCUTS_CONTAINER_ID`)
  - Functions: `camelCase` (e.g., `extractSongData`)
- **Line Length**: Try not to exceed 120 characters
- **Functions**: One function = one clear responsibility

### CSS

- Use classes prefixed with `gft-` to avoid conflicts (e.g., `gft-dark-mode`)
- Organize properties alphabetically
- Comment important sections

### Comments

```javascript
/**
 * Description of the function.
 * @param {type} paramName - Description of the parameter.
 * @returns {type} Description of what is returned.
 */
function myFunction(paramName) {
    // Implementation
}
```

## 🏗️ Code Architecture

### Main Files

#### `content.js` (3792 lines - v2.5)

**Section 1: Global Variables (lines 26-44)**
- Extension state (counters, active editor, dark mode, Undo/Redo history)

**Section 2: Constants and Selectors (lines 46-76)**
- CSS selectors for Genius elements
- Extension component IDs
- Utility CSS classes

**Section 3: Basic Utilities (lines 78-145)**
- `decodeHtmlEntities()`: Decodes HTML entities
- `cleanArtistName()`: Cleans artist names
- `escapeRegExp()`: Escapes special characters for regex
- `formatArtistList()`: Formats a list of artists

**Section 4: Number Conversion (lines 147-282) ✨ NEW v2.2.0**
- `numberToFrenchWords()`: Converts a number (0-999 billion) to French words
  - Full management of French spelling (hyphens, "et", plurals)
  - Supports up to 999 999 999 999 (thousands, millions, billions)
  - Special cases: 70-79, 80-89, 90-99
  - Correct plurals: "millions", "milliards" (but "mille" invariable)
- `isValidNumber()`: Checks if a string is a valid number

**Section 5: Data Extraction (lines 247-760)**
- `extractArtistsFromMetaContent()`: Extracts artists from meta tags
- `extractSongData()`: Main function to extract title and artists
- `calculateStats()`: Calculates statistics (lines, words, sections, characters)

**Section 6: Real-time Statistics (lines 571-651)**
- `updateStatsDisplay()`: Updates the statistics display
- `toggleStatsDisplay()`: Shows/hides statistics
- `createStatsDisplay()`: Creates the display element

**Section 7: Undo/Redo History (lines 653-938)**
- `saveToHistory()`: Saves current state
- `undoLastChange()`: Undoes last change
- `redoLastChange()`: Redoes last undone change
- `updateHistoryButtons()`: Updates button state

**Section 8: Progress Bar (lines 940-1023)**
- `createProgressBar()`: Creates the bar element
- `showProgress()`: Shows progress
- `hideProgress()`: Hides progress bar

**Section 9: Correction Preview (lines 1025-1148)**
- `showCorrectionPreview()`: Shows before/after modal with details

**Section 10: Tutorial and Tooltips (lines 1150-1460)**
- `showTutorial()`: Shows guided 6-step tutorial
- `renderTutorialStep()`: Renders a specific step
- `isFirstLaunch()`: Detects first launch
- `areTooltipsEnabled()`: Checks if tooltips are enabled

```javascript
{label:'[My Tag]', getText:()=>addArtistToText('[My Tag]')}
```

#### Adding a button to the floating toolbar (v2.2.0)

To add a new formatting button in `createFloatingFormattingToolbar()`:

```javascript
// Create the button
const myButton = document.createElement('button');
myButton.textContent = 'My Action';
myButton.classList.add('gft-floating-format-button', 'my-button-class');
myButton.title = 'Action Description';
myButton.type = 'button';
myButton.style.display = 'none'; // Hidden by default if conditional

// Add event listener
myButton.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    myActionFunction();
});

// Add tooltip
addTooltip(myButton, 'Full Description');

// Add button to toolbar
toolbar.appendChild(myButton);
```

Then modify `showFloatingToolbar()` to show/hide the button based on conditions:
```javascript
const myButton = floatingFormattingToolbar.querySelector('.my-button-class');
if (myButton) {
    if (myCondition(selectedText)) {
        myButton.style.display = 'inline-block';
    } else {
        myButton.style.display = 'none';
    }
}
```

#### Adding a new correction

1. Create a correction function (section 13, lines 1900-2220)
2. Add it to `SHORTCUTS.TEXT_CLEANUP` in `initLyricsEditorEnhancer()`
3. Update `applyAllTextCorrectionsAsync()` to include the new correction

#### Adding a keyboard shortcut

1. Add entry to `KEYBOARD_SHORTCUTS` object (line ~1462)
2. Add corresponding case in `handleKeyboardShortcut()` (line ~1551)
3. Create action function if necessary

#### Modifying artist detection

Modify `extractSongData()` (line ~175) or `SELECTORS` (line ~42)

#### Adding a statistic

1. Modify `calculateStats()` (line ~571) to calculate the new metric
2. Update `updateStatsDisplay()` (line ~590) to display it

#### Extending number conversion (v2.2.0)

The `numberToFrenchWords()` function currently supports numbers from 0 to 999 billion. To extend further:

1. **Add trillions**: For numbers > 999 999 999 999
   ```javascript
   if (num >= 1000000000000) {
       const trillions = Math.floor(num / 1000000000000);
       const rest = num % 1000000000000;
       // Note: in French, "billion" = 1 000 000 000 000 (trillion in US English)
   }
   ```

2. **Decimal numbers**: Add management for decimal numbers
   ```javascript
   if (str.includes('.') || str.includes(',')) {
       const [integer, decimal] = str.split(/[.,]/);
       return `${convertInteger(integer)} point ${convertDecimal(decimal)}`;
   }
   ```

3. **Negative numbers**: Add "minus" prefix
   ```javascript
   if (num < 0) {
       return "minus " + numberToFrenchWords(Math.abs(num));
   }
   ```

4. **Spelling options**: Parameter for traditional vs reformed spelling

## 🧪 Tests

Before submitting your PR, test on Genius.com:

1. **Lyrics Editor Page**: Verify the panel appears
2. **SPA Navigation**: Change page without reloading (extension should follow)
3. **Different Editor Types**:
   - Old editor (`textarea`)
   - New editor (`div contenteditable`)
4. **Different Page Types**:
   - Solo song (single artist)
   - Song with features
   - Song with multiple main artists
5. **Dark Mode**: Verify preference is saved
6. **Number Conversion (v2.2.0)**:
   - Select a number alone: "Number → Words" button should appear
   - Select text with a number: button should NOT appear
   - Test various numbers:
     - Small: 0, 21, 42, 71, 80, 81, 91
     - Hundreds: 100, 200, 999
     - Thousands: 1000, 1234, 999999
     - Millions: 1000000, 42000000, 999999999
     - Billions: 1000000000, 123456789012, 999999999999
   - Verify spelling
7. **Lyric Card (v2.5)**:
   - **Edit Mode**: Select lyrics -> "Create Lyric Card" button -> Generated Image
   - **Read Mode**: Select lyrics on song page -> Button appears -> Generated Image
   - **Robustness**: Test on pages with problematic covers
   - **Design**: Verify Genius logo, fonts, and contrast
8. **Mobile Warning Overlay (v2.7)**:
   - **Resize Window**: Resize browser width < 1024px -> Overlay appears
   - **Content**: Verify message "Optimized for PC"
   - **Restore**: Resize back -> Overlay disappears

### Checklist before PR

- [ ] Code works on Genius.com
- [ ] No errors in console (F12)
- [ ] Dark mode works correctly on all new elements
- [ ] Keyboard shortcuts work (if modified/added)
- [ ] Undo/Redo history works correctly with new changes
- [ ] Stats update correctly (if modified)
- [ ] Tutorial is up to date (if new features added)
- [ ] JSDoc comments are up to date
- [ ] Code follows style guide
- [ ] Versions are consistent:
  - [ ] `manifest.json` (line 4)
  - [ ] `content.js` header (line 1)
  - [ ] `content.js` @version JSDoc (line 22)
  - [ ] `content.js` console.log (line 25)
  - [ ] `content.js` panel footer (line 3675)
  - [ ] `README.md` badge (line 5)
  - [ ] `CONTRIBUTING.md` section title (line 201)
- [ ] README.md and TODO.md are up to date (if major feature)
- [ ] Changelog in README.md is up to date with new features

## 🔍 Review Process

1. A maintainer will review your PR
2. Changes may be requested
3. Once approved, the PR will be merged
4. Your contributions will be mentioned in the changelog

## ❓ Questions

If you have questions:
- Open an Issue with label `question`
- Clearly describe what you don't understand

## 🎉 Thank you!

Thank you for contributing to **Genius Fast Transcriber**! Every contribution, small or large, makes a difference.

---

**Happy Coding! 🚀**
