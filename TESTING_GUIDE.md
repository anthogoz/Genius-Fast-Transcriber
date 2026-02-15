# 🧪 Comment Tester l'Extension dans Chrome

## ✅ OUI, tu peux charger ce dossier directement !

**Réponse courte :** Oui, Chrome charge les extensions directement depuis un dossier !

---

## 🚀 Méthode Rapide (3 étapes)

### 1. Ouvre Chrome Extensions
```
chrome://extensions/
```
Ou : Menu ⋮ → Extensions → Gérer les extensions

### 2. Active le Mode Développeur
En haut à droite, active le switch **"Mode développeur"**

### 3. Charge l'Extension
Clique sur **"Charger l'extension non empaquetée"**
Sélectionne ce dossier :
```
D:\Lnkhey\Documents\Genius Fast Transcriber Project\Genius Fast Transcriber
```

✅ **C'est tout !** L'extension apparaît dans la liste.

---

## 📦 Ce que Chrome Va Lire

Chrome cherche automatiquement :
1. **`manifest.json`** ✅ (présent)
2. **`content.js`** ✅ (compilé, prêt)
3. **`popup.html`**, **`popup.js`** ✅
4. **`images/`** ✅ (icons)
5. **`styles.css`** ✅

**Tout est déjà là !** Pas besoin de build spécial.

---

## 🧪 Workflow de Test

### Développement Actif
```bash
# Terminal 1 : Watch mode (auto-rebuild)
npm run watch

# Laisse tourner, puis dans Chrome :
# À chaque save de src/content.js :
#   1. npm run watch rebuild automatiquement
#   2. Va sur chrome://extensions/
#   3. Clique le bouton ⟳ "Actualiser" sous ton extension
#   4. Recharge la page genius.com (F5)
#   5. Teste tes modifications
```

### Test Rapide (sans watch)
```bash
# 1. Modifie src/content.js
# 2. Build
npm run build

# 3. Dans Chrome
chrome://extensions/ → ⟳ Actualiser
genius.com → F5
```

---

## 🔄 Recharger l'Extension

**Quand recharger ?**
- Après avoir modifié `content.js`
- Après avoir modifié `manifest.json`
- Après avoir modifié `popup.js`
- Après avoir modifié les styles

**Comment ?**
1. Va sur `chrome://extensions/`
2. Trouve "Genius Fast Transcriber"
3. Clique le bouton **⟳** (rechargement)
4. Recharge la page Genius (F5)

**Raccourci :** Extension "Extension Reloader" existe pour auto-reload !

---

## 🐛 Debugging

### Console Extension
```
chrome://extensions/ 
→ Clic sur "Détails" de ton extension
→ "Inspecter les vues" → clic sur "popup.html"
```

### Console Page Genius
```
Sur genius.com :
F12 → Console
→ Cherche "Genius Fast Transcriber v4.0.0 🎵"
→ Tous les logs de l'extension ici
```

### Erreurs Courantes

#### "Extension non valide"
- ✅ Vérifie que `manifest.json` est à la racine
- ✅ Vérifie syntaxe JSON (pas de virgule finale)

#### "content.js introuvable"
- ✅ Lance `npm run build` d'abord
- ✅ Vérifie que `content.js` existe à la racine

#### "L'extension ne fait rien"
- ✅ Vérifie que tu es sur `genius.com/*-lyrics`
- ✅ Ouvre la console (F12) pour voir les erreurs
- ✅ Recharge l'extension (⟳) puis la page (F5)

#### "Modifications pas prises en compte"
- ✅ As-tu rebuild ? (`npm run build`)
- ✅ As-tu rechargé l'extension ? (⟳ chrome://extensions/)
- ✅ As-tu rechargé la page ? (F5)

---

## 📍 Tester sur Genius.com

### 1. Va sur une page lyrics
```
https://genius.com/ARTISTE-chanson-lyrics
```
Exemples :
- https://genius.com/Travis-scott-sicko-mode-lyrics
- https://genius.com/Billie-eilish-bad-guy-lyrics

### 2. Vérifie que ça charge
- Ouvre F12 → Console
- Tu dois voir : **"Genius Fast Transcriber v4.0.0 🎵"**

### 3. Teste les fonctionnalités
- Panel apparaît à droite ✅
- Boutons fonctionnent ✅
- Label version affiche "v4.0.0" ✅
- Corrections marchent ✅

---

## 🎨 Tester le Popup

1. Clique l'icône de l'extension (en haut à droite Chrome)
2. Le popup s'ouvre
3. Teste les settings :
   - Mode transcription
   - Langue
   - Options

---

## 🔧 Dev Tips

### Hot Reload Workflow (Recommandé)
```bash
# Terminal : Watch mode
npm run watch

# Éditeur : Modifie src/content.js
# → Auto-rebuild en ~60ms

# Chrome : 
# ⟳ Actualiser extension
# F5 Recharger page

# Répéter !
```

### Multi-tests
Ouvre plusieurs onglets Genius différents pour tester :
- Chanson courte vs longue
- Langue FR vs EN
- Avec/sans featured artists
- Avec/sans paroles existantes

---

## 📊 Checklist de Test Complet

Avant de publier une nouvelle version :

### Fonctionnalités Core
- [ ] Panel s'affiche correctement
- [ ] Boutons structure fonctionnent
- [ ] "Fix All" corrige bien
- [ ] Détection artistes fonctionne
- [ ] Custom buttons marchent
- [ ] Lyric Card se génère

### UI/UX
- [ ] Dark mode OK
- [ ] Animations fluides
- [ ] Tooltips affichés
- [ ] Version v4.0.0 visible
- [ ] Pas de dépassement layout

### Performance
- [ ] Charge rapide (<1s)
- [ ] Pas de lag en typing
- [ ] Pas de memory leak (tester 30min+)

### Erreurs
- [ ] Pas d'erreurs console
- [ ] Pas de warnings manifest
- [ ] Fonctionne sans connection (offline)

### Browsers
- [ ] Chrome ✅
- [ ] Edge (basé Chromium) ✅
- [ ] Brave ✅

---

## 🎯 Test Avant Publication Chrome Web Store

### Teste depuis le ZIP
1. Crée le ZIP :
   ```bash
   npm run package:chrome
   ```

2. Extrait le ZIP dans un dossier temporaire

3. Charge ce dossier extrait dans Chrome

4. Teste TOUT

5. Si OK → Upload sur Chrome Web Store !

**Important :** Le ZIP est ce que les users téléchargeront, donc teste-le !

---

## 💡 Extensions Utiles pour Dev

### Extension Reloader
Auto-reload extension à chaque changement
https://chrome.google.com/webstore/detail/extension-reloader/

### React DevTools / Vue DevTools
Si tu utilises un framework (futur)

---

## ✅ Résumé Ultra-Rapide

```bash
# 1. Build (si pas déjà fait)
npm run build

# 2. Chrome
chrome://extensions/
→ Mode développeur ON
→ Charger extension non empaquetée
→ Sélectionne ce dossier

# 3. Teste
→ Va sur genius.com/*-lyrics
→ Panel apparaît
→ Fonctionne !

# 4. Développement
npm run watch         # Terminal
Modifie src/          # Éditeur
⟳ + F5                # Chrome
```

---

**C'est tout ! Tu peux tester dès maintenant ! 🚀**

L'extension se charge directement depuis ce dossier, pas besoin de ZIP !
