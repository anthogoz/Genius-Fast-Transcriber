# 🎵 Genius Fast Transcriber (by Lnkhey)

Une extension Chrome/Edge qui transforme l'expérience de transcription sur **Genius.com** en ajoutant des outils intelligents et des raccourcis puissants.

![Version](https://img.shields.io/badge/version-2.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Installation Facile

L'extension est **très facilement installable** sur tous les navigateurs Chromium (Chrome, Edge, Brave, Opera, etc.) directement depuis le Chrome Web Store :

**[📥 Installer Genius Fast Transcriber](https://chromewebstore.google.com/detail/genius-fast-transcriber-b/cbldlkiakadclpjfkkafpjomilmmgdjm?hl=fr)**

> ⭐ **Note 5/5** avec **18 utilisateurs** actifs !

### Installation en 3 clics :
1. 🔗 Cliquez sur le lien ci-dessus
2. ➕ Cliquez sur "Ajouter à Chrome/Edge"
3. ✅ Confirmez l'installation

L'extension sera immédiatement active sur toutes les pages d'édition de paroles de Genius.com !

## ✨ Fonctionnalités

### 🎯 Tags Structuraux Intelligents
- **Ajout rapide de sections** : Couplet, Refrain, Intro, Outro, Pont, Pré-refrain
- **Détection automatique des artistes** : L'extension extrait automatiquement les noms des artistes depuis la page
- **Attribution aux artistes** : Associez facilement chaque section aux artistes correspondants (ex: `[Couplet 1 : Artiste 1 & Artiste 2]`)
- **Gestionnaire de couplets** : Navigation entre les couplets avec des boutons ← et →

### ⌨️ Raccourcis Clavier
- **`Ctrl+1`** : Insérer `[Couplet]` avec artistes sélectionnés
- **`Ctrl+2`** : Insérer `[Refrain]` avec artistes sélectionnés
- **`Ctrl+3`** : Insérer `[Pont]` avec artistes sélectionnés
- **`Ctrl+4`** : Insérer `[Intro]` avec artistes sélectionnés
- **`Ctrl+5`** : Insérer `[Outro]` avec artistes sélectionnés
- **`Ctrl+Shift+C`** : Appliquer toutes les corrections (avec prévisualisation)
- **`Ctrl+Z`** : Annuler la dernière modification
- **`Ctrl+Y`** : Refaire la dernière modification annulée
- **`Ctrl+Shift+S`** : Afficher/masquer les statistiques en temps réel

### 🔧 Corrections Automatiques
- **Correction des apostrophes** : Remplace les apostrophes typographiques `'` par des apostrophes standard `'`
- **Correction "y'"** : Transforme automatiquement `y'` en `y ` (pour les paroles en français)
- **Majuscules automatiques** : Met en majuscule la première lettre de chaque ligne
- **Suppression de la ponctuation finale** : Retire les points et virgules en fin de ligne
- **Espacement intelligent** : Corrige les lignes vides (ajoute/supprime selon les besoins)
- **Bouton "Tout Corriger"** : Applique toutes les corrections avec **prévisualisation avant/après**
- **Barre de progression** : Affichage visuel pendant les corrections longues

### 🎨 Formatage
- **Gras** et **Italique** : Formatage rapide du texte sélectionné
- **Nombre → Lettres** : Conversion automatique des nombres en lettres (ex: "42" → "quarante-deux")
  - Apparaît uniquement lorsqu'un nombre est sélectionné
  - Supporte les nombres de 0 à 999 milliards (999 999 999 999)
  - Gestion complète : milliers, millions, milliards
  - Respecte les règles de l'orthographe française (traits d'union, "et", pluriels)
- **Barre d'outils flottante** : Apparaît automatiquement lors de la sélection de texte pour un formatage rapide
- **Mode sombre** : Interface agréable pour les yeux, avec préférence sauvegardée

### ↩️ Historique des Modifications
- **Annuler/Refaire** : Historique des 10 dernières modifications
- **Boutons dédiés** : Boutons `↩️ Annuler` et `↪️ Refaire` dans le panneau
- **Sauvegarde automatique** : Capture automatique des états avant chaque modification importante

### 📊 Statistiques en Temps Réel
- **Compteur intelligent** : Lignes, mots, sections (tags), caractères
- **Mise à jour dynamique** : S'actualise automatiquement pendant la saisie
- **Affichage discret** : Activable/désactivable via `Ctrl+Shift+S` ou le bouton dédié
- **Persistance** : Préférence d'affichage sauvegardée entre les sessions

### 🎓 Tutoriel Guidé
- **Premier lancement** : Tutoriel interactif en 6 étapes pour découvrir toutes les fonctionnalités
- **Réactivable** : Accessible à tout moment via le bouton ⚙️ (paramètres)
- **Tooltips** : Info-bulles sur les boutons (activables/désactivables dans les paramètres)

### 📊 Feedback Visuel
- Messages de confirmation après chaque action
- Surlignage temporaire des corrections effectuées
- Compteur détaillé de corrections appliquées par type
- Prévisualisation avant/après pour les corrections globales

## 🚀 Installation

### Depuis les sources (développement)

1. **Clonez le dépôt** :
```bash
git clone https://github.com/anthogoz/genius-fast-transcriber.git
cd genius-fast-transcriber
```

2. **Chargez l'extension dans Chrome/Edge** :
   - Ouvrez `chrome://extensions/` (ou `edge://extensions/`)
   - Activez le "Mode développeur" (coin supérieur droit)
   - Cliquez sur "Charger l'extension non empaquetée"
   - Sélectionnez le dossier du projet

3. **Utilisez l'extension** :
   - Rendez-vous sur [genius.com](https://genius.com)
   - Ouvrez une page d'édition de paroles
   - Le panneau d'outils apparaît automatiquement ! 🎉

## 📖 Utilisation

### Démarrage Rapide

1. **Accédez à une page d'édition** sur Genius.com
2. **Le panneau d'outils apparaît** automatiquement au-dessus de l'éditeur
3. **Au premier lancement**, un tutoriel guidé vous présente les fonctionnalités (6 étapes)
4. **Sélectionnez les artistes** (cases à cocher) pour attribuer les sections
5. **Utilisez les boutons ou les raccourcis clavier** pour insérer des tags
6. **Appliquez "Tout Corriger"** (bouton ou `Ctrl+Shift+C`) pour nettoyer les paroles avec prévisualisation

### Raccourcis Essentiels

| Raccourci | Action |
|-----------|--------|
| `Ctrl+1` | Insérer [Couplet] |
| `Ctrl+2` | Insérer [Refrain] |
| `Ctrl+Shift+C` | Tout Corriger (avec prévisualisation) |
| `Ctrl+Z` | Annuler |
| `Ctrl+Y` | Refaire |
| `Ctrl+Shift+S` | Afficher/masquer les statistiques |

### Fonctionnalités Avancées

- **Formatage rapide** : Sélectionnez du texte et utilisez la barre d'outils flottante pour le mettre en **gras** ou en *italique*
- **Conversion de nombres** : Sélectionnez un nombre (uniquement un nombre, sans autres mots) et le bouton "Nombre → Lettres" apparaîtra pour le convertir en lettres françaises
- **Statistiques** : Activez le compteur en temps réel pour suivre votre progression (lignes, mots, sections, caractères)
- **Historique** : Annulez jusqu'à 10 modifications avec `Ctrl+Z` ou les boutons dédiés
- **Prévisualisation** : Avant d'appliquer "Tout Corriger", visualisez un aperçu avant/après avec le détail des corrections

## 🛠️ Technologies Utilisées

- **JavaScript** (Vanilla JS)
- **Chrome Extension API** (Manifest V3)
- **MutationObserver** pour détecter les changements dynamiques sur Genius (SPA)
- **CSS** personnalisé avec mode sombre

## ⚠️ Avertissement - Développement Assisté par IA

Cette extension a été entièrement développée avec l'assistance de **Gemini** (vibe coding). Bien que fonctionnelle, cela implique certaines considérations :

### 🐛 Problèmes Potentiels

- **Bugs non détectés** : Le code n'a pas été audité de manière exhaustive par des développeurs humains expérimentés
- **Failles de sécurité possibles** : Aucun audit de sécurité professionnel n'a été effectué
- **Solutions "hacky"** : Certaines implémentations peuvent être plus complexes que nécessaire pour accomplir des tâches simples
- **Code non optimisé** : Certaines parties du code pourraient être refactorisées pour de meilleures performances
- **Gestion d'erreurs incomplète** : Tous les cas limites (edge cases) n'ont peut-être pas été anticipés
- **Dépendances aux sélecteurs CSS** : L'extension dépend fortement des sélecteurs CSS de Genius.com qui peuvent changer sans préavis
- **Dette technique** : Le fichier principal (`content.js`) fait 2787 lignes et mériterait d'être modularisé

### 🤝 Votre Aide est Précieuse !

C'est pourquoi **vos contributions sont d'autant plus importantes** :
- Audits de code et suggestions d'améliorations
- Corrections de bugs et failles de sécurité
- Refactorisation du code existant
- Ajout de tests automatisés
- Revues de code (code reviews)

**Utilisez cette extension en connaissance de cause** et n'hésitez pas à signaler tout comportement suspect ou problème de sécurité via les Issues GitHub.

## 📁 Structure du Projet

```
genius-fast-transcriber/
├── manifest.json          # Configuration de l'extension
├── content.js             # Script principal (2787 lignes)
├── styles.css             # Styles du panneau d'outils
├── images/                # Icônes de l'extension
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md              # Documentation
├── CONTRIBUTING.md        # Guide de contribution
└── TODO.md                # Tâches et améliorations prévues
```

## 🤝 Contribuer

Les contributions sont les bienvenues ! Consultez [CONTRIBUTING.md](CONTRIBUTING.md) pour savoir comment participer au projet.

Pour voir ce qui reste à faire, consultez [TODO.md](TODO.md) ou les [Issues GitHub](https://github.com/anthogoz/genius-fast-transcriber/issues).

## 🐛 Bugs et Suggestions

Si vous rencontrez un bug ou avez une idée d'amélioration :
1. Vérifiez d'abord les [Issues existantes](https://github.com/anthogoz/genius-fast-transcriber/issues)
2. Si le problème n'existe pas, [créez une nouvelle Issue](https://github.com/anthogoz/genius-fast-transcriber/issues/new)

## 📝 Changelog

### Version 2.2.0 (Actuelle)
- 🔢 **NOUVEAU** : Conversion automatique de nombres en lettres françaises (0-999 milliards)
  - Bouton "Nombre → Lettres" dans la barre d'outils flottante
  - Apparaît uniquement lorsqu'un nombre seul est sélectionné
  - Supporte jusqu'à 999 999 999 999 (999 milliards 999 millions 999 mille 999)
  - Gestion complète des milliers, millions et milliards avec pluriels corrects
  - Respect des règles de l'orthographe française (traits d'union, "et", pluriels, etc.)
  - Gestion correcte des nombres complexes (70-79, 80-89, 90-99)

### Version 2.0.0
- 🎨 **NOUVEAU** : Affichage du numéro de version en bas à droite du panneau
- 📦 **Majeur** : Passage à la version 2.0 (refonte complète avec toutes les nouvelles fonctionnalités de la v1.6.0)

### Version 1.6.0
- ⌨️ **NOUVEAU** : Raccourcis clavier complets (`Ctrl+1-5` pour tags, `Ctrl+Shift+C` pour Tout Corriger, `Ctrl+Z/Y` pour Undo/Redo, `Ctrl+Shift+S` pour statistiques)
- ↩️ **NOUVEAU** : Historique Undo/Redo avec sauvegarde des 10 dernières modifications
- 🔍 **NOUVEAU** : Prévisualisation avant/après pour le bouton "Tout Corriger" avec détails des corrections
- 📊 **NOUVEAU** : Affichage des statistiques en temps réel (lignes, mots, sections, caractères)
- 🎓 **NOUVEAU** : Tutoriel guidé en 6 étapes au premier lancement
- 🎨 **NOUVEAU** : Barre d'outils flottante pour formatage rapide (gras/italique) lors de la sélection de texte
- ⏳ **NOUVEAU** : Barre de progression pour les opérations longues
- 💡 **NOUVEAU** : Tooltips activables/désactivables sur les boutons
- ⚙️ **NOUVEAU** : Bouton paramètres pour accéder au tutoriel et aux options
- 🐛 **Fix** : Amélioration de la gestion du curseur et de la sauvegarde automatique
- ⚡ **Optimisation** : Debouncing des mises à jour de statistiques pour meilleures performances

### Version 1.5.1
- 🐛 **Fix** : Correction du compteur inexact du bouton "Tout Corriger"
- ✨ **Amélioration** : Feedback détaillé par type de correction (ex: "3 apostrophes, 5 majuscules")
- ⚡ **Optimisation** : Comptage simplifié et plus précis pour les corrections d'espacement
- 📊 **UX** : Message de feedback affiché plus longtemps (4,5s au lieu de 3s)

### Version 1.5.0
- ✅ Mode sombre avec préférence sauvegardée
- ✅ Bouton "Tout Corriger" pour appliquer toutes les corrections
- ✅ Feedback visuel amélioré avec messages temporaires
- ✅ Support complet des éditeurs `textarea` et `div contenteditable`
- ✅ Détection robuste des artistes (meta tags, sections crédits, fallbacks)
- ✅ Correction intelligente de l'espacement entre lignes

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

## 👨‍💻 Auteur

**Lnkhey**
- GitHub: [@anthogoz](https://github.com/anthogoz)

## 🙏 Remerciements

Merci à tous les contributeurs qui aident à améliorer cette extension !

---

**Fait avec ❤️ pour la communauté Genius**

