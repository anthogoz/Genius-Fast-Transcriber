# Publishing to Chrome Web Store

Guide for packaging and submitting Genius Fast Transcriber to the Chrome Web Store.

## Build the Package

```bash
npm run zip
```

This produces a `.zip` file in the `.output/` directory, ready for upload.

## Pre-Publish Checklist

- [ ] Version bumped in `package.json`
- [ ] `CHANGELOG.md` updated with new version entry
- [ ] `npm run typecheck` passes (zero TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] Tested manually on a Genius lyrics page (both editor types)
- [ ] Tested popup (mode, theme, language switching)
- [ ] All three languages verified (FR, EN, PL)
- [ ] No console errors on Genius pages

## Upload to Chrome Web Store

1. Go to the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).
2. Select the extension or create a new one.
3. Upload the `.zip` from `.output/`.
4. Update the store listing if needed:
   - Description files are in `CHROME_STORE_DESCRIPTION.txt` (EN), `_FR.txt`, `_PL.txt`.
   - Screenshots should show the panel, popup, and Lyric Card feature.
5. Submit for review.

## GitHub Release

```bash
git tag v<version>
git push origin v<version>
```

Create a GitHub release from the tag and attach the `.zip` file.
