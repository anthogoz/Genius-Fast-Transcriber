# 🤝 Guide de Contribution

Merci de votre intérêt pour contribuer à **Genius Fast Transcriber** ! Ce document vous guidera à travers le processus de contribution.

## 📋 Table des Matières

1. [Code de Conduite](#code-de-conduite)
2. [Comment Contribuer](#comment-contribuer)
3. [Signaler un Bug](#signaler-un-bug)
4. [Proposer une Nouvelle Fonctionnalité](#proposer-une-nouvelle-fonctionnalité)
5. [Soumettre une Pull Request](#soumettre-une-pull-request)
6. [Guide de Style](#guide-de-style)
7. [Architecture du Code](#architecture-du-code)

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
Consultez les [Issues ouvertes](https://github.com/votre-username/genius-fast-transcriber/issues) ou le fichier [TODO.md](TODO.md)

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
git clone https://github.com/votre-username/genius-fast-transcriber.git
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

#### `content.js` (1139 lignes)

**Section 1 : Variables Globales (lignes 14-28)**
- État de l'extension (compteurs, éditeur actif, mode sombre)

**Section 2 : Utilitaires (lignes 66-169)**
- `decodeHtmlEntities()` : Décode les entités HTML
- `cleanArtistName()` : Nettoie les noms d'artistes
- `formatArtistList()` : Formate une liste d'artistes
- `extractArtistsFromMetaContent()` : Extrait artistes depuis meta tags

**Section 3 : Extraction de Données (lignes 175-264)**
- `extractSongData()` : Fonction principale pour extraire titre et artistes

**Section 4 : Interface Utilisateur (lignes 271-432)**
- `createArtistSelectors()` : Crée les cases à cocher des artistes
- `showFeedbackMessage()` : Affiche les messages temporaires
- `applyDarkMode()` / `toggleDarkMode()` : Gestion du mode sombre

**Section 5 : Corrections de Texte (lignes 436-767)**
- `capitalizeFirstLetterOfEachLine()`
- `removeTrailingPunctuationFromLines()`
- `correctLineSpacing()` : Logique complexe pour l'espacement
- `applyAllTextCorrectionsToString()` : Chaîne toutes les corrections

**Section 6 : Éditeur Contenteditable (lignes 322-718)**
- `replaceAndHighlightInDiv()` : Remplacement avec surlignage dans un div
- `applyTextTransformToDivEditor()` : Applique transformations dans un div

**Section 7 : Initialisation Principale (lignes 774-1093)**
- `initLyricsEditorEnhancer()` : Fonction cœur qui crée le panneau
- Gestion de la configuration des boutons (objet `SHORTCUTS`)
- Factory de boutons avec événements

**Section 8 : MutationObserver (lignes 1099-1121)**
- `startObserver()` : Surveille les changements DOM (SPA)

### Points d'Extension Courants

#### Ajouter un nouveau bouton de tag

Modifiez l'objet `SHORTCUTS.TAGS_STRUCTURAUX` (ligne ~778) :

```javascript
{label:'[Mon Tag]', getText:()=>addArtistToText('[Mon Tag]')}
```

#### Ajouter une nouvelle correction

1. Créez une fonction de correction (section 5)
2. Ajoutez-la à `SHORTCUTS.TEXT_CLEANUP` (ligne ~801)

#### Modifier la détection des artistes

Modifiez `extractSongData()` (ligne ~175) ou les `SELECTORS` (ligne ~42)

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
- [ ] Le mode sombre fonctionne correctement
- [ ] Les commentaires JSDoc sont à jour
- [ ] Le code suit le guide de style
- [ ] La version dans `manifest.json` est correcte (si applicable)

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

