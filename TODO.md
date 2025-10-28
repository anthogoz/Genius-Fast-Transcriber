# 📝 TODO & Roadmap

Ce fichier répertorie les fonctionnalités prévues, les améliorations et les bugs connus pour **Genius Fast Transcriber**.

> **Note** : Les contributeurs sont encouragés à choisir une tâche ci-dessous ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment commencer.

## 🎯 Priorités

### 🔴 Haute Priorité

#### 🐛 Bugs à Corriger

- [ ] **Problème de curseur après corrections** : Parfois, le curseur se retrouve à la fin du texte après une correction (à améliorer)
  - Fichier concerné : `content.js`, fonction `applyTextTransformToDivEditor()`
  - Difficulté : Moyenne
  
- [ ] **Détection incomplète de certains artistes** : Sur certaines pages, les featurings ne sont pas détectés
  - Fichier concerné : `content.js`, fonction `extractSongData()`
  - Difficulté : Moyenne
  
- [ ] **Panneau qui disparaît après certaines actions Genius** : Le panneau peut disparaître si Genius modifie massivement le DOM
  - Fichier concerné : `content.js`, fonction `startObserver()`
  - Difficulté : Difficile

#### ✨ Fonctionnalités Essentielles

- [x] ~~**Raccourcis clavier** : Ajouter des raccourcis clavier pour les actions fréquentes~~ **[COMPLÉTÉ v1.6.0]**
  - ✅ `Ctrl+1-5` pour tags structuraux
  - ✅ `Ctrl+Shift+C` pour "Tout Corriger"
  - ✅ `Ctrl+Z/Y` pour Undo/Redo
  - ✅ `Ctrl+Shift+S` pour statistiques
  
- [x] ~~**Undo/Redo local** : Historique des modifications pour revenir en arrière~~ **[COMPLÉTÉ v1.6.0]**
  - ✅ Historique des 10 dernières modifications
  - ✅ Boutons dédiés dans le panneau
  - ✅ Raccourcis Ctrl+Z/Y

### 🟡 Priorité Moyenne

#### 🎨 Améliorations de l'Interface

- [ ] **Panneau redimensionnable** : Permettre à l'utilisateur de redimensionner le panneau
  - Difficulté : Moyenne

- [ ] **Boutons personnalisables** : Interface pour choisir quels boutons afficher
  - Stocker les préférences dans `chrome.storage`
  - Difficulté : Moyenne-Difficile


- [ ] **Animations plus fluides** : Améliorer les transitions du panneau
  - Fichier concerné : `styles.css`
  - Difficulté : Facile

#### 🔧 Fonctionnalités Supplémentaires

- [x] ~~**Prévisualisation des corrections** : Mode "review" qui suggère au lieu d'appliquer automatiquement~~ **[COMPLÉTÉ v1.6.0]**
  - ✅ Modal avec aperçu avant/après
  - ✅ Détails des corrections par type
  - ✅ Validation avant application

- [ ] **Support des annotations Genius** : Préparer le texte pour faciliter l'ajout d'annotations
  - Difficulté : Difficile

- [x] ~~**Statistiques de transcription** : Afficher le nombre de mots, lignes, sections, etc.~~ **[COMPLÉTÉ v1.6.0]**
  - ✅ Compteur en temps réel : lignes, mots, sections, caractères
  - ✅ Activable/désactivable via `Ctrl+Shift+S`
  - ✅ Préférence sauvegardée


### 🟢 Priorité Basse / Nice to Have

#### 📚 Documentation

- [ ] **Tutoriel vidéo** : Créer un GIF animé ou une vidéo de démonstration
  - Difficulté : Facile (hors codage)

- [ ] **Traductions** : Traduire l'interface en anglais, espagnol, etc.
  - Fichiers à modifier : `content.js`, `README.md`
  - Difficulté : Facile

- [ ] **Page de documentation** : Site web dédié avec guide d'utilisation complet
  - Difficulté : Moyenne (hors codage)

#### 🚀 Optimisations

- [ ] **Refactorisation en modules** : Découper `content.js` (2787 lignes) en plusieurs fichiers
  - Créer des modules : `utils.js`, `corrections.js`, `ui.js`, `observers.js`, `keyboard.js`, `statistics.js`
  - Difficulté : Moyenne-Difficile (le fichier a beaucoup grandi)

- [ ] **Performances** : Optimiser le MutationObserver pour limiter les rappels
  - Difficulté : Moyenne

- [ ] **Tests automatisés** : Ajouter des tests unitaires et d'intégration
  - Utiliser Jest ou Mocha
  - Difficulté : Difficile

#### 🌐 Compatibilité

- [ ] **Support de Firefox** : Adapter l'extension pour Firefox (Manifest V2/V3)
  - Difficulté : Moyenne

- [ ] **Support de Safari** : Adapter pour Safari (nécessite conversion)
  - Difficulté : Difficile

- [ ] **Mode Standalone** : Bookmarklet ou userscript pour ceux qui ne veulent pas d'extension
  - Difficulté : Moyenne

## 🔧 Tâches de Maintenance

- [ ] **Mettre à jour les dépendances** : Vérifier si Chrome/Edge ont de nouvelles API utiles
- [ ] **Audit de sécurité** : Vérifier les permissions et les bonnes pratiques
- [ ] **Nettoyage du code** : Supprimer le code mort ou commenté
- [ ] **Améliorer les commentaires** : S'assurer que tout est bien documenté
- [ ] **Tests de régression** : Vérifier que l'extension fonctionne après chaque mise à jour de Genius

## 📊 Statistiques du Projet

- **Lignes de code** : ~3000 (JavaScript + CSS)
- **Nombre de fonctions** : ~60
- **Nombre de boutons** : 20+
- **Corrections automatiques** : 5 types
- **Raccourcis clavier** : 9 raccourcis
- **Fonctionnalités majeures** : 15+

## 🎉 Fonctionnalités Complétées

Ces fonctionnalités ont été implémentées avec succès :

### Version 1.0 - 1.5.1
- ✅ Détection automatique des artistes (principaux + featurings)
- ✅ Attribution des sections aux artistes
- ✅ Gestionnaire de couplets avec navigation
- ✅ Corrections automatiques (apostrophes, majuscules, ponctuation, espacement)
- ✅ Bouton "Tout Corriger"
- ✅ Mode sombre avec préférence sauvegardée
- ✅ Feedback visuel après chaque action
- ✅ Support des éditeurs `textarea` et `div contenteditable`
- ✅ Gestion SPA avec MutationObserver
- ✅ Formatage gras et italique
- ✅ En-tête automatique avec titre et featurings
- ✅ **[v1.5.1]** Feedback détaillé du bouton "Tout Corriger" avec comptage précis par type de correction

### Version 2.0.0 (MAJEURE - ACTUELLE)
- ✅ **Affichage de version** : Numéro de version visible en bas à droite du panneau
- ✅ **Refonte complète** : Passage à la version 2.0 avec toutes les fonctionnalités de la v1.6.0

### Version 1.6.0
- ✅ **Raccourcis clavier complets** (`Ctrl+1-5`, `Ctrl+Shift+C`, `Ctrl+Z/Y`, `Ctrl+Shift+S`)
- ✅ **Historique Undo/Redo** (10 dernières modifications)
- ✅ **Prévisualisation des corrections** (modal avant/après avec détails)
- ✅ **Statistiques en temps réel** (lignes, mots, sections, caractères)
- ✅ **Tutoriel guidé** (6 étapes au premier lancement)
- ✅ **Barre d'outils flottante** (formatage lors de la sélection de texte)
- ✅ **Barre de progression** (pour les opérations longues)
- ✅ **Tooltips configurables** (activables/désactivables)
- ✅ **Bouton paramètres** (accès au tutoriel et options)

## 🤝 Comment Contribuer

1. **Choisissez une tâche** dans cette liste
2. **Créez une Issue** pour annoncer que vous travaillez dessus (évite les doublons)
3. **Lisez** [CONTRIBUTING.md](CONTRIBUTING.md) pour le processus complet
4. **Soumettez** une Pull Request quand c'est prêt !

---

**Légende** :
- 🔴 Haute priorité
- 🟡 Priorité moyenne  
- 🟢 Basse priorité
- 🐛 Bug
- ✨ Nouvelle fonctionnalité
- 🎨 Interface/UX
- 📚 Documentation
- 🔧 Maintenance
- 🚀 Optimisation

**Dernière mise à jour** : Octobre 2025 (Version 2.0.0)

