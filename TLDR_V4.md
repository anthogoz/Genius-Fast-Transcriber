# ⚡ TL;DR — Version 4.0.0

## ✅ Changements

- **Version :** 3.1.0 → **4.0.0**
- **Build amélioré :** ZIP nommé automatiquement

---

## 🚀 Créer le ZIP pour Chrome Web Store

### Option 1 : Double-clic
```
📁 Double-clique sur : build-chrome-store.bat
```

### Option 2 : Terminal
```bash
npm run package:chrome
```

**Résultat :** `Genius Fast Transcriber v4.0.0.zip`

---

## 📦 Fichier Créé

```
Genius Fast Transcriber v4.0.0.zip
├── manifest.json (v4.0.0)
├── content.js (compilé)
├── popup.html, popup.js
├── images/
├── styles.css
└── LICENSE
```

**Prêt à uploader sur :** https://chrome.google.com/webstore/devconsole

---

## 🔄 Changer de Version

1. Édite `manifest.json` : `"version": "4.0.1"`
2. Édite `package.json` : `"version": "4.0.1"`
3. Double-clic sur `build-chrome-store.bat`

✅ Nouveau ZIP : `Genius Fast Transcriber v4.0.1.zip`

---

**C'est tout ! 🎉**

Plus de détails dans : `BUILD_GUIDE.md` ou `V4_UPDATE_SUMMARY.md`
