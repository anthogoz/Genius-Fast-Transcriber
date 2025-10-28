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

- [ ] **Raccourcis clavier** : Ajouter des raccourcis clavier pour les actions fréquentes
  - Exemple : `Ctrl+1` pour `[Couplet]`, `Ctrl+2` pour `[Refrain]`, etc.
  - Fichier à modifier : `content.js`
  - Difficulté : Moyenne
  
- [ ] **Undo/Redo local** : Historique des modifications pour revenir en arrière
  - Utile après un "Tout Corriger" qui fait trop de changements
  - Difficulté : Difficile

- [ ] **Export/Import de templates** : Permettre de sauvegarder des templates personnalisés
  - Exemple : "Structure Rap", "Structure Couplet-Refrain", etc.
  - Difficulté : Moyenne

### 🟡 Priorité Moyenne

#### 🎨 Améliorations de l'Interface

- [ ] **Panneau redimensionnable** : Permettre à l'utilisateur de redimensionner le panneau
  - Difficulté : Moyenne

- [ ] **Boutons personnalisables** : Interface pour choisir quels boutons afficher
  - Stocker les préférences dans `chrome.storage`
  - Difficulté : Moyenne-Difficile

- [ ] **Thèmes personnalisés** : Ajouter d'autres thèmes de couleurs (pas seulement clair/sombre)
  - Difficulté : Facile

- [ ] **Animations plus fluides** : Améliorer les transitions du panneau
  - Fichier concerné : `styles.css`
  - Difficulté : Facile

#### 🔧 Fonctionnalités Supplémentaires

- [ ] **Détection automatique de la langue** : Adapter les corrections selon la langue détectée
  - Exemple : Pas de correction "y'" si la langue n'est pas le français
  - Difficulté : Moyenne

- [ ] **Suggestions de corrections** : Mode "review" qui suggère au lieu d'appliquer automatiquement
  - Difficulté : Moyenne-Difficile

- [ ] **Support des annotations Genius** : Préparer le texte pour faciliter l'ajout d'annotations
  - Difficulté : Difficile

- [ ] **Statistiques de transcription** : Afficher le nombre de mots, lignes, sections, etc.
  - Difficulté : Facile

- [ ] **Détection de doublons** : Avertir si une ligne est répétée (utile pour les refrains)
  - Difficulté : Moyenne

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

- [ ] **Refactorisation en modules** : Découper `content.js` (1139 lignes) en plusieurs fichiers
  - Créer des modules : `utils.js`, `corrections.js`, `ui.js`, `observers.js`
  - Difficulté : Moyenne

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

## 🆕 Idées de Nouvelles Fonctionnalités

Ces idées sont à discuter avant implémentation (créez une Issue pour en parler !) :

### Idée 1 : Mode Collaboratif
- Synchronisation en temps réel avec d'autres transcripteurs
- Nécessite un backend
- Difficulté : Très Difficile

### Idée 2 : Intégration IA
- Suggestions de corrections via API (OpenAI, Claude, etc.)
- Auto-détection de la structure de la chanson
- Difficulté : Difficile

### Idée 3 : Intégration Spotify/YouTube
- Importer les paroles depuis Spotify ou YouTube Music
- Synchronisation du timestamp
- Difficulté : Difficile

### Idée 4 : Prévisualisation en Temps Réel
- Vue côte à côte : brut vs. formaté
- Difficulté : Moyenne

### Idée 5 : Mode "Paroles Certifiées"
- Vérification automatique selon les règles de Genius
- Checklist des critères pour les paroles vérifiées
- Difficulté : Moyenne

### Idée 6 : Historique des Chansons Transcrites
- Garder une trace des chansons travaillées
- Statistiques personnelles (nombre de transcriptions, temps passé, etc.)
- Difficulté : Moyenne

### Idée 7 : Intégration Genius API
- Récupérer automatiquement des infos manquantes
- Push direct depuis l'extension
- Difficulté : Difficile

## 🔧 Tâches de Maintenance

- [ ] **Mettre à jour les dépendances** : Vérifier si Chrome/Edge ont de nouvelles API utiles
- [ ] **Audit de sécurité** : Vérifier les permissions et les bonnes pratiques
- [ ] **Nettoyage du code** : Supprimer le code mort ou commenté
- [ ] **Améliorer les commentaires** : S'assurer que tout est bien documenté
- [ ] **Tests de régression** : Vérifier que l'extension fonctionne après chaque mise à jour de Genius

## 📊 Statistiques du Projet

- **Lignes de code** : ~1300 (JavaScript + CSS)
- **Nombre de fonctions** : ~30
- **Nombre de boutons** : 15+
- **Corrections automatiques** : 5 types

## 🎉 Fonctionnalités Complétées

Ces fonctionnalités ont été implémentées avec succès :

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

**Dernière mise à jour** : Octobre 2025

