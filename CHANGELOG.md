# 📝 Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.3.3] - 2025-10-30

### 🎯 FIX MAJEUR
- **Plus d'effet "jumpscare" en cliquant sur les boutons !**
  - Fix : Le curseur ne saute plus à la fin du texte lors des corrections
  - Sauvegarde et restauration automatique de la position du curseur
  - Le panneau reste stable, plus de scroll brutal
  - Bonus : Ajout du surlignage pour les corrections de majuscules en début de ligne
  - Note : Le surlignage de ponctuation viendra dans une future version (algorithme de diff complexe)

## [2.3.2] - 2025-10-30

### 🐛 FIX CRITIQUE
- **Le surlignage ne déborde plus sur 90% du texte !**
  - Fix : Algorithme amélioré pour détecter précisément les caractères modifiés
  - Utilise maintenant la regex de recherche pour identifier les positions exactes
  - Le surlignage est maintenant chirurgical et ne met en évidence que les corrections réelles
  - Impact : Correction "oeu → œu" et autres fonctionnent parfaitement ! 🎯

## [2.3.1] - 2025-10-30

### 🐛 CORRECTION
- **Le surlignage des corrections est maintenant enfin visible !**
  - Fix : Les styles de Genius écrasaient le surlignage jaune des corrections
  - Utilisation de styles inline avec `!important` pour garantir la visibilité
  - Nouveau : Overlay visuel pour les textarea (ancien éditeur) - les corrections sont maintenant surlignées même dans les anciens éditeurs !
  - Injection automatique des animations CSS essentielles au chargement
  - Impact : TOUTES les corrections sont maintenant visuellement surlignées 🎉

## [2.3.0] - 2025-10-30

### 🔍 NOUVEAU
- **Vérification des parenthèses et crochets non appariés**
  - Bouton "🔍 Vérifier ( ) [ ]" dans le panneau d'outils
  - Détection intelligente des parenthèses `( )` et crochets `[ ]` non appariés
  - Surlignage en rouge avec animation pulsée pour identifier les erreurs
  - Messages détaillés au survol (ouvrant sans fermeture, fermant sans ouverture, mauvaise paire)
  - Compatible avec les deux types d'éditeurs Genius et le mode sombre
  - Résout l'erreur Genius : "Oops! It looks like you might have an uneven number of parentheses or square brackets"

## [2.2.0] - 2025-10-30

### 🔢 NOUVEAU
- **Conversion automatique de nombres en lettres françaises (0-999 milliards)**
  - Bouton "Nombre → Lettres" dans la barre d'outils flottante
  - Apparaît uniquement lorsqu'un nombre seul est sélectionné
  - Supporte jusqu'à 999 999 999 999 (999 milliards 999 millions 999 mille 999)
  - Gestion complète des milliers, millions et milliards avec pluriels corrects
  - Respect des règles de l'orthographe française (traits d'union, "et", pluriels, etc.)
  - Gestion correcte des nombres complexes (70-79, 80-89, 90-99)

## [2.0.0] - 2025-10-30

### 🎨 NOUVEAU
- Affichage du numéro de version en bas à droite du panneau

### 📦 Majeur
- Passage à la version 2.0 (refonte complète avec toutes les nouvelles fonctionnalités de la v1.6.0)

## [1.6.0] - 2025-10-29

### ⌨️ NOUVEAU
- **Raccourcis clavier complets**
  - `Ctrl+1-5` pour tags
  - `Ctrl+Shift+C` pour Tout Corriger
  - `Ctrl+Z/Y` pour Undo/Redo
  - `Ctrl+Shift+S` pour statistiques

### ↩️ NOUVEAU
- **Historique Undo/Redo** avec sauvegarde des 10 dernières modifications

### 🔍 NOUVEAU
- **Prévisualisation avant/après** pour le bouton "Tout Corriger" avec détails des corrections

### 📊 NOUVEAU
- **Affichage des statistiques en temps réel** (lignes, mots, sections, caractères)

### 🎓 NOUVEAU
- **Tutoriel guidé en 6 étapes** au premier lancement

### 🎨 NOUVEAU
- **Barre d'outils flottante** pour formatage rapide (gras/italique) lors de la sélection de texte

### ⏳ NOUVEAU
- **Barre de progression** pour les opérations longues

### 💡 NOUVEAU
- **Tooltips** activables/désactivables sur les boutons

### ⚙️ NOUVEAU
- **Bouton paramètres** pour accéder au tutoriel et aux options

### 🐛 Fix
- Amélioration de la gestion du curseur et de la sauvegarde automatique

### ⚡ Optimisation
- Debouncing des mises à jour de statistiques pour meilleures performances

## [1.5.1] - 2025-10-28

### 🐛 Fix
- Correction du compteur inexact du bouton "Tout Corriger"

### ✨ Amélioration
- Feedback détaillé par type de correction (ex: "3 apostrophes, 5 majuscules")

### ⚡ Optimisation
- Comptage simplifié et plus précis pour les corrections d'espacement

### 📊 UX
- Message de feedback affiché plus longtemps (4,5s au lieu de 3s)

## [1.5.0] - 2025-10-28

### ✅ Ajouté
- Mode sombre avec préférence sauvegardée
- Bouton "Tout Corriger" pour appliquer toutes les corrections
- Feedback visuel amélioré avec messages temporaires
- Support complet des éditeurs `textarea` et `div contenteditable`
- Détection robuste des artistes (meta tags, sections crédits, fallbacks)
- Correction intelligente de l'espacement entre lignes

## [1.0.0] - 2025-10-27

### ✅ Première version
- Détection automatique des artistes depuis la page Genius
- Ajout rapide de sections (Couplet, Refrain, Intro, Outro, Pont, Pré-refrain)
- Attribution aux artistes pour chaque section
- Gestionnaire de couplets avec navigation
- Corrections automatiques :
  - Apostrophes typographiques → standard
  - "y'" → "y "
  - Majuscules en début de ligne
  - Suppression ponctuation finale
  - Espacement intelligent
- Formatage gras et italique
- Compatible avec les deux types d'éditeurs Genius

---

**Format des versions :** [MAJEUR.MINEUR.CORRECTIF]
- **MAJEUR** : Changements incompatibles avec les versions précédentes
- **MINEUR** : Ajout de fonctionnalités rétrocompatibles
- **CORRECTIF** : Corrections de bugs rétrocompatibles
