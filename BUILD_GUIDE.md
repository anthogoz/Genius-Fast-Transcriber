# 🚀 Guide de Build Chrome Web Store v4.0.0

## ✅ Méthode Ultra-Simple (Double-clic)

**Double-clique** sur : `build-chrome-store.bat`

C'est tout ! 🎉

Le ZIP sera créé automatiquement avec le nom :
```
Genius Fast Transcriber v4.0.0.zip
```

---

## 🔧 Méthode Alternative (Ligne de commande)

```bash
npm run package:chrome
```

---

## 📦 Ce qui est créé

**Nom du fichier :** `Genius Fast Transcriber v4.0.0.zip`  
(La version est lue automatiquement depuis `manifest.json`)

**Contenu du ZIP :**
- ✅ manifest.json (v4.0.0)
- ✅ content.js (compilé)
- ✅ popup.html, popup.js
- ✅ images/ (tous les icons et logos)
- ✅ styles.css
- ✅ LICENSE

**Exclus du ZIP (dev only) :**
- ❌ src/ (code source)
- ❌ node_modules/
- ❌ scripts/
- ❌ package.json
- ❌ Documentation (*.md)

---

## 🔄 Pour Changer de Version

1. **Édite** `manifest.json` :
   ```json
   "version": "4.1.0"
   ```

2. **Rebuild** :
   ```bash
   npm run package:chrome
   ```

3. **Nouveau ZIP créé** :
   ```
   Genius Fast Transcriber v4.1.0.zip
   ```

La version est **toujours synchronisée** avec le manifest.json !

---

## 📋 Workflow Complet

### Pour une nouvelle release :

1. **Modifie ton code** dans `src/`

2. **Build** :
   ```bash
   npm run build
   ```

3. **Test** l'extension dans Chrome

4. **Mets à jour la version** dans `manifest.json` ET `package.json`

5. **Crée le ZIP** :
   - Double-clic sur `build-chrome-store.bat`
   - OU `npm run package:chrome`

6. **Upload** sur Chrome Web Store :
   https://chrome.google.com/webstore/devconsole

---

## ⚡ Version Actuelle

**v4.0.0** — Modular Build System

### Changements depuis v3.1.0 :
- ✅ Build system modulaire avec esbuild
- ✅ Code organisé en 4 modules (2,052 lignes)
- ✅ Build automatique avec npm scripts
- ✅ ZIP nommé automatiquement avec version

---

## 🎯 Prochaine Version Suggérée

**v4.0.1** — Bug fixes  
**v4.1.0** — New features  
**v5.0.0** — Major changes

---

## 💡 Tips

### Le .bat ne fonctionne pas ?
Fais un clic droit → "Exécuter en tant qu'administrateur"

### Le ZIP existe déjà ?
Pas de problème ! Le script supprime automatiquement l'ancien ZIP avec la même version.

### Je veux garder plusieurs versions ?
Les ZIPs avec différentes versions coexistent :
- `Genius Fast Transcriber v4.0.0.zip`
- `Genius Fast Transcriber v4.1.0.zip`
- `Genius Fast Transcriber v5.0.0.zip`

---

**C'est prêt ! 🚀 Double-clique sur `build-chrome-store.bat` pour créer ton ZIP !**
