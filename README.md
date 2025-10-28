# 🎵 Genius Fast Transcriber (by Lnkhey)

Une extension Chrome/Edge qui transforme l'expérience de transcription sur **Genius.com** en ajoutant des outils intelligents et des raccourcis puissants.

![Version](https://img.shields.io/badge/version-1.5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Fonctionnalités

### 🎯 Tags Structuraux Intelligents
- **Ajout rapide de sections** : Couplet, Refrain, Intro, Outro, Pont, Pré-refrain
- **Détection automatique des artistes** : L'extension extrait automatiquement les noms des artistes depuis la page
- **Attribution aux artistes** : Associez facilement chaque section aux artistes correspondants (ex: `[Couplet 1 : Artiste 1 & Artiste 2]`)
- **Gestionnaire de couplets** : Navigation entre les couplets avec des boutons ← et →

### 🔧 Corrections Automatiques
- **Correction des apostrophes** : Remplace les apostrophes typographiques `'` par des apostrophes standard `'`
- **Correction "y'"** : Transforme automatiquement `y'` en `y ` (pour les paroles en français)
- **Majuscules automatiques** : Met en majuscule la première lettre de chaque ligne
- **Suppression de la ponctuation finale** : Retire les points et virgules en fin de ligne
- **Espacement intelligent** : Corrige les lignes vides (ajoute/supprime selon les besoins)
- **Bouton "Tout Corriger"** : Applique toutes les corrections en un seul clic

### 🎨 Formatage
- **Gras** et **Italique** : Formatage rapide du texte sélectionné
- **Mode sombre** : Interface agréable pour les yeux, avec préférence sauvegardée

### 📊 Feedback Visuel
- Messages de confirmation après chaque action
- Surlignage temporaire des corrections effectuées
- Compteur de corrections appliquées

## 🚀 Installation

### Depuis les sources (développement)

1. **Clonez le dépôt** :
```bash
git clone https://github.com/votre-username/genius-fast-transcriber.git
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

1. **Accédez à une page d'édition** sur Genius.com
2. **Le panneau d'outils apparaît** automatiquement au-dessus de l'éditeur
3. **Sélectionnez les artistes** (cases à cocher) pour attribuer les sections
4. **Cliquez sur les boutons** pour insérer des tags ou appliquer des corrections
5. **Utilisez "Tout Corriger"** pour nettoyer rapidement toutes les paroles

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
- **Dette technique** : Le fichier principal (`content.js`) fait 1139 lignes et mériterait d'être modularisé

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
├── content.js             # Script principal (1139 lignes)
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

Pour voir ce qui reste à faire, consultez [TODO.md](TODO.md) ou les [Issues GitHub](https://github.com/votre-username/genius-fast-transcriber/issues).

## 🐛 Bugs et Suggestions

Si vous rencontrez un bug ou avez une idée d'amélioration :
1. Vérifiez d'abord les [Issues existantes](https://github.com/votre-username/genius-fast-transcriber/issues)
2. Si le problème n'existe pas, [créez une nouvelle Issue](https://github.com/votre-username/genius-fast-transcriber/issues/new)

## 📝 Changelog

### Version 1.5.0 (Actuelle)
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

