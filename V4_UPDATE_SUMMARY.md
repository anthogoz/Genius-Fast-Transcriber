# 🚀 Résumé des Nouveautés — Genius Fast Transcriber v4.0.0

La version 4.0.0 est une mise à jour majeure qui apporte non seulement une architecture moderne et modulaire, mais aussi une toute nouvelle fonctionnalité d'exportation professionnelle.

---

## 📤 1. Nouveau Système d'Exportation (.txt)
Vous pouvez désormais télécharger vos paroles directement depuis la page Genius !
- **Intégration native** : Un nouveau bouton "Export" apparaît dans la barre d'outils Genius (à côté de "Edit Lyrics").
- **Nettoyage Intelligent** : GFT filtre automatiquement :
    - Les en-têtes de contributeurs ("3 Contributors", etc.).
    - Les liens et annotations Genius.
    - Les balises HTML.
- **Formats flexibles** :
    - **Standard** : Respecte les tags [Section] et l'espacement.
    - **Sans Tags** : Retire tous les crochets de structure.
    - **Sans Espacement** : Retire les lignes vides.
    - **Raw** : Texte pur, sans tags ni lignes vides.
- **Scrapage automatique** : Si vous n'êtes pas dans l'éditeur, GFT extrait les paroles directement de la page.

---

## 🏗️ 2. Architecture Modulaire & Performance
Le code a été entièrement restructuré pour la pérennité du projet.
- **Modules ES6** : Séparation de la logique (Traductions, Corrections, Constantes, Utils).
- **Build Ultra-rapide** : Intégration de `esbuild` pour des builds en moins de 50ms.
- **Stabilité** : Meilleure isolation des fonctionnalités et réduction des bugs liés aux conflits de variables globales.

---

## 🌍 3. Internationalisation Améliorée
- **Export Multi-langue** : Le système d'exportation supporte nativement le Français, l'Anglais et le Polonais.
- **Synchronisation dynamique** : L'interface s'adapte instantanément à votre mode de transcription préféré.

---

## 🛠️ 4. Améliorations UI/UX
- **Design 100% Natif** : Les nouveaux boutons utilisent exactement les mêmes classes CSS que Genius pour une intégration invisible.
- **Menu Dropdown** : Nouveau menu fluide pour choisir le format d'export.
- **Gestionnaire de boutons personnalisés** : Amélioration de l'UX/UI pour une création et une gestion plus intuitive des commandes persos.
- **Option Tooltips** : Un nouveau réglage permet de désactiver les bulles d'aide (tooltips) au survol des boutons.
- **Stabilité Renforcée** : Correction d'erreurs liées à l'invalidation du contexte de l'extension.
- **Corrections de bugs** : Nombreux correctifs sur la gestion du Dark Mode et le placement des éléments.

---

**Genius Fast Transcriber v4.0.0 est prêt ! Bonnes transcriptions ! 🎤**
