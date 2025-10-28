# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à **Genius Fast Transcriber** ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

1. [Tester l'Extension](#tester-lextension)
2. [Code de Conduite](#code-de-conduite)
3. [Comment Contribuer](#comment-contribuer)
4. [Signaler un Bug](#signaler-un-bug)
5. [Proposer une Nouvelle Fonctionnalité](#proposer-une-nouvelle-fonctionnalité)
6. [Soumettre une Pull Request](#soumettre-une-pull-request)
7. [Guide de Style](#guide-de-style)
8. [Architecture du Code](#architecture-du-code)

## 🧪 Tester l'Extension

Avant de contribuer, nous vous recommandons de **tester l'extension** pour bien comprendre son fonctionnement !

### Installation depuis le Chrome Web Store

L'extension est **très facilement installable** sur tous les navigateurs Chromium (Chrome, Edge, Brave, Opera, etc.) :

**[📥 Installer Genius Fast Transcriber](https://chromewebstore.google.com/detail/genius-fast-transcriber-b/cbldlkiakadclpjfkkafpjomilmmgdjm?hl=fr)**

> ⭐ **Note 5/5** - Installation en 3 clics !

### Installation en mode développement (pour contribuer)

Si vous souhaitez tester vos modifications locales :

1. **Clonez** le dépôt :
   ```bash
   git clone https://github.com/anthogoz/genius-fast-transcriber.git
   cd genius-fast-transcriber
   ```

2. **Chargez l'extension** dans votre navigateur :
   - Chrome/Edge : Allez dans `chrome://extensions/`
   - Activez le "Mode développeur"
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier du projet

3. **Testez** sur [Genius.com](https://genius.com) en éditant des paroles

## 📜 Code de Conduite

En participant à ce projet, vous acceptez de respecter un comportement courtois et professionnel. Soyez respectueux envers les autres contributeurs.

## 🚀 Comment Contribuer

Il existe plusieurs façons de contribuer :

### 1. 🐛 Signaler des bugs
Vous avez trouvé un bug ? Créez une Issue !

### 2. 💡 Proposer des améliorations
Vous avez une idée pour améliorer l'extension ? Partagez-la !

### 3. 📝 Améliorer la documentation
La documentation peut toujours être améliorée (README, commentaires dans le code, etc.)

### 4. 💻 Écrire du code
Consultez les [Issues ouvertes](https://github.com/anthogoz/genius-fast-transcriber/issues) ou le fichier [TODO.md](TODO.md)

## 🐛 Signaler un Bug

Avant de créer une Issue pour un bug :

1. **Vérifiez** que le bug n'a pas déjà été signalé
2. **Testez** avec la dernière version de l'extension
3. **Incluez** ces informations dans votre rapport :
   - Description claire du problème
   - Étapes pour reproduire le bug
   - Comportement attendu vs. comportement observé
   - Navigateur et version (Chrome, Edge, etc.)
   - Captures d'écran si pertinent
   - Messages d'erreur de la console (F12)

### Template d'Issue pour Bug

```markdown
**Description du bug**
Une description claire du problème.

**Étapes pour reproduire**
1. Aller sur '...'
2. Cliquer sur '...'
3. Voir l'erreur

**Comportement attendu**
Ce qui devrait se passer.

**Captures d'écran**
Si applicable, ajoutez des captures d'écran.

**Environnement**
- Navigateur : [ex: Chrome 120]
- Version de l'extension : [ex: 1.5.0]
- Page Genius : [URL de la page]
```

## 💡 Proposer une Nouvelle Fonctionnalité

Avant de proposer une fonctionnalité :

1. **Vérifiez** qu'elle n'est pas déjà dans [TODO.md](TODO.md)
2. **Créez une Issue** avec le label `enhancement`
3. **Expliquez** :
   - Le problème que cela résout
   - Comment cela améliorerait l'expérience utilisateur
   - Des exemples d'utilisation
   - Des captures d'écran ou maquettes si possible

## 🔄 Soumettre une Pull Request

### Étape 1 : Préparer votre environnement

```bash
# Fork le projet sur GitHub, puis :
git clone https://github.com/anthogoz/genius-fast-transcriber.git
cd genius-fast-transcriber

# Créez une branche pour votre fonctionnalité
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### Étape 2 : Faire vos modifications

- Écrivez du code propre et commenté
- Suivez le [Guide de Style](#guide-de-style)
- Testez vos modifications sur Genius.com

### Étape 3 : Commiter vos changements

```bash
git add .
git commit -m "feat: ajout de [description courte]"
```

### Conventions de Commit

Utilisez les préfixes suivants :

- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation uniquement
- `style:` Formatage du code (pas de changement de logique)
- `refactor:` Refactorisation du code
- `test:` Ajout de tests
- `chore:` Tâches de maintenance

### Étape 4 : Pousser et créer la PR

```bash
git push origin feature/ma-nouvelle-fonctionnalite
```

Puis créez une Pull Request sur GitHub avec :
- Un titre clair
- Une description détaillée des changements
- Des références aux Issues liées (ex: `Closes #42`)
- Des captures d'écran si pertinent

## 🎨 Guide de Style

### JavaScript

- **Indentation** : Utilisez des espaces (le code existant utilise un mélange, mais privilégiez la cohérence)
- **Commentaires** : Commentez les fonctions complexes avec JSDoc
- **Nommage** :
  - Variables : `camelCase` (ex: `currentActiveEditor`)
  - Constantes : `UPPER_SNAKE_CASE` (ex: `SHORTCUTS_CONTAINER_ID`)
  - Fonctions : `camelCase` (ex: `extractSongData`)
- **Longueur des lignes** : Essayez de ne pas dépasser 120 caractères
- **Fonctions** : Une fonction = une responsabilité claire

### CSS

- Utilisez des classes préfixées par `gft-` pour éviter les conflits (ex: `gft-dark-mode`)
- Organisez les propriétés par ordre alphabétique
- Commentez les sections importantes

### Commentaires

```javascript
/**
 * Description de la fonction.
 * @param {type} paramName - Description du paramètre.
 * @returns {type} Description de ce qui est retourné.
 */
function maFonction(paramName) {
    // Implémentation
}
```

## 🏗️ Architecture du Code

### Fichiers Principaux

#### `content.js` (2787 lignes)

**Section 1 : Variables Globales (lignes 14-33)**
- État de l'extension (compteurs, éditeur actif, mode sombre, historique Undo/Redo)

**Section 2 : Constantes et Sélecteurs (lignes 34-64)**
- Sélecteurs CSS pour les éléments de Genius
- IDs des composants de l'extension
- Classes CSS utilitaires

**Section 3 : Utilitaires (lignes 66-570)**
- `decodeHtmlEntities()` : Décode les entités HTML
- `cleanArtistName()` : Nettoie les noms d'artistes
- `formatArtistList()` : Formate une liste d'artistes
- `extractArtistsFromMetaContent()` : Extrait artistes depuis meta tags
- `calculateStats()` : Calcule les statistiques (lignes, mots, sections, caractères)

**Section 4 : Statistiques en Temps Réel (lignes 571-651)**
- `updateStatsDisplay()` : Met à jour l'affichage des statistiques
- `toggleStatsDisplay()` : Affiche/masque les statistiques
- `createStatsDisplay()` : Crée l'élément d'affichage

**Section 5 : Historique Undo/Redo (lignes 653-938)**
- `saveToHistory()` : Sauvegarde l'état actuel
- `undoLastChange()` : Annule la dernière modification
- `redoLastChange()` : Refait la dernière modification annulée
- `updateHistoryButtons()` : Met à jour l'état des boutons

**Section 6 : Barre de Progression (lignes 940-1023)**
- `createProgressBar()` : Crée l'élément de la barre
- `showProgress()` : Affiche la progression
- `hideProgress()` : Cache la barre de progression

**Section 7 : Prévisualisation des Corrections (lignes 1025-1148)**
- `showCorrectionPreview()` : Affiche le modal avant/après avec détails

**Section 8 : Tutoriel et Tooltips (lignes 1150-1460)**
- `showTutorial()` : Affiche le tutoriel guidé en 6 étapes
- `renderTutorialStep()` : Affiche une étape spécifique
- `isFirstLaunch()` : Détecte le premier lancement
- `areTooltipsEnabled()` : Vérifie si les tooltips sont activés

**Section 9 : Raccourcis Clavier (lignes 1462-1548)**
- `KEYBOARD_SHORTCUTS` : Configuration des raccourcis
- `handleKeyboardShortcut()` : Gestion des événements clavier
- `insertTagViaShortcut()` : Insère un tag via raccourci

**Section 10 : Barre d'Outils Flottante (lignes 1650-1850)**
- `createFloatingFormattingToolbar()` : Crée la barre de formatage
- `handleSelectionChange()` : Détecte la sélection de texte
- `applyBoldToSelection()` / `applyItalicToSelection()` : Applique le formatage

**Section 11 : Extraction de Données (lignes 175-264)**
- `extractSongData()` : Fonction principale pour extraire titre et artistes

**Section 12 : Interface Utilisateur (lignes 300-450)**
- `createArtistSelectors()` : Crée les cases à cocher des artistes
- `showFeedbackMessage()` : Affiche les messages temporaires
- `applyDarkMode()` / `toggleDarkMode()` : Gestion du mode sombre

**Section 13 : Corrections de Texte (lignes 1900-2220)**
- `capitalizeFirstLetterOfEachLine()`
- `removeTrailingPunctuationFromLines()`
- `correctLineSpacing()` : Logique complexe pour l'espacement
- `applyAllTextCorrectionsAsync()` : Chaîne toutes les corrections avec barre de progression

**Section 14 : Éditeur Contenteditable (lignes 500-1000)**
- `replaceAndHighlightInDiv()` : Remplacement avec surlignage dans un div
- `applyTextTransformToDivEditor()` : Applique transformations dans un div

**Section 15 : Initialisation Principale (lignes 2227-2680)**
- `initLyricsEditorEnhancer()` : Fonction cœur qui crée le panneau
- Gestion de la configuration des boutons (objet `SHORTCUTS`)
- Factory de boutons avec événements
- Création du panneau de paramètres

**Section 16 : MutationObserver (lignes 2717-2787)**
- `startObserver()` : Surveille les changements DOM (SPA)
- Écouteurs d'événements globaux (clavier, sélection, scroll)

### Points d'Extension Courants

#### Ajouter un nouveau bouton de tag

Modifiez l'objet `SHORTCUTS.TAGS_STRUCTURAUX` (ligne ~778) :

```javascript
{label:'[Mon Tag]', getText:()=>addArtistToText('[Mon Tag]')}
```

#### Ajouter une nouvelle correction

1. Créez une fonction de correction (section 13, lignes 1900-2220)
2. Ajoutez-la à `SHORTCUTS.TEXT_CLEANUP` dans `initLyricsEditorEnhancer()`
3. Mettez à jour `applyAllTextCorrectionsAsync()` pour inclure la nouvelle correction

#### Ajouter un raccourci clavier

1. Ajoutez l'entrée dans l'objet `KEYBOARD_SHORTCUTS` (ligne ~1462)
2. Ajoutez le cas correspondant dans `handleKeyboardShortcut()` (ligne ~1551)
3. Créez la fonction d'action si nécessaire

#### Modifier la détection des artistes

Modifiez `extractSongData()` (ligne ~175) ou les `SELECTORS` (ligne ~42)

#### Ajouter une statistique

1. Modifiez `calculateStats()` (ligne ~571) pour calculer la nouvelle métrique
2. Mettez à jour `updateStatsDisplay()` (ligne ~590) pour l'afficher

## 🧪 Tests

Avant de soumettre votre PR, testez sur Genius.com :

1. **Page d'édition de paroles** : Vérifiez que le panneau apparaît
2. **Navigation SPA** : Changez de page sans recharger (l'extension doit suivre)
3. **Différents types d'éditeurs** :
   - Ancien éditeur (`textarea`)
   - Nouvel éditeur (`div contenteditable`)
4. **Différents types de pages** :
   - Chanson solo (un seul artiste)
   - Chanson avec featurings
   - Chanson avec plusieurs artistes principaux
5. **Mode sombre** : Vérifiez que la préférence est sauvegardée

### Checklist avant PR

- [ ] Le code fonctionne sur Genius.com
- [ ] Aucune erreur dans la console (F12)
- [ ] Le mode sombre fonctionne correctement sur tous les nouveaux éléments
- [ ] Les raccourcis clavier fonctionnent (si modifiés/ajoutés)
- [ ] L'historique Undo/Redo fonctionne correctement avec les nouvelles modifications
- [ ] Les statistiques s'actualisent correctement (si modifiées)
- [ ] Le tutoriel est à jour (si de nouvelles fonctionnalités sont ajoutées)
- [ ] Les commentaires JSDoc sont à jour
- [ ] Le code suit le guide de style
- [ ] La version dans `manifest.json` est correcte (si applicable)
- [ ] Le README.md et TODO.md sont à jour (si fonctionnalité majeure)

## 🔍 Processus de Review

1. Un mainteneur examinera votre PR
2. Des changements peuvent être demandés
3. Une fois approuvée, la PR sera mergée
4. Vos contributions seront mentionnées dans le changelog

## ❓ Questions

Si vous avez des questions :
- Ouvrez une Issue avec le label `question`
- Décrivez clairement ce que vous ne comprenez pas

## 🎉 Merci !

Merci de contribuer à **Genius Fast Transcriber** ! Chaque contribution, petite ou grande, fait une différence.

---

**Happy Coding! 🚀**

