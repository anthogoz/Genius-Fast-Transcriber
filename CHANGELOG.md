# Changelog - Genius Fast Transcriber

## Version 2.3.3 (30 octobre 2025)

### 🎯 Correction majeure : Plus d'effet "jumpscare" !

**Problème résolu** : Quand on cliquait sur un bouton de correction, le curseur était téléporté tout à la fin du texte, provoquant un scroll brutal qui déplaçait le panneau et créait un effet "jumpscare" désagréable.

**Solutions implémentées** :
- 💾 **Sauvegarde de la position du curseur** : Avant chaque action, la position du curseur est sauvegardée
- 🎯 **Restauration après correction** : Après la correction, le curseur est remis exactement où il était
- 📍 **Plus de téléportation** : Le texte ne scroll plus brutalement et le panneau reste stable
- ✨ **Bonus** : Ajout du surlignage pour les corrections de majuscules en début de ligne

**Note** : Le surlignage pour la suppression de ponctuation en fin de ligne nécessite un algorithme de diff plus sophistiqué et sera ajouté dans une version future.

**Impact** : L'expérience utilisateur est maintenant **fluide et agréable** ! Plus de scroll surprise ! 🎉

---

## Version 2.3.2 (30 octobre 2025)

### 🐛 Correction critique : Surlignage trop large corrigé !

**Problème résolu** : Le surlignage pour la correction "oeu → œu" (et potentiellement d'autres) surlignait 90% du texte au lieu de seulement les caractères modifiés.

**Cause du problème** : L'algorithme de détection des modifications dans `createTextareaReplacementOverlay` utilisait une approche caractère par caractère naïve qui créait de nombreux faux positifs.

**Solution implémentée** :
- 🎯 Algorithme amélioré : Utilisation de la regex de recherche pour identifier **précisément** les positions modifiées
- 📍 Détection des matches dans le texte original puis calcul du décalage dans le texte nouveau
- ✅ Ne surligne plus que les caractères **réellement modifiés** par la correction
- 🔧 Passage de `searchPattern` en paramètre à `createTextareaReplacementOverlay`

**Impact** : Le surlignage est maintenant **chirurgical** et ne met en évidence que les corrections effectuées ! 🎯

---

## Version 2.3.1 (30 octobre 2025)

### 🐛 Correction importante : Surlignage des corrections enfin visible !

**Problème résolu** : Le surlignage jaune des corrections (pour "y' → y", "' → '", "oeu → œu", etc.) n'était pas visible car il était écrasé par les styles CSS de Genius.

**Solutions implémentées** :
- 🎨 Utilisation de styles inline avec `!important` pour forcer l'application des styles de surlignage
- 📝 Injection automatique de l'animation CSS au chargement de l'extension
- ✨ Nouveau : Overlay visuel pour les **textarea** (ancien éditeur)
  - Les corrections sont maintenant surlignées même dans les anciens éditeurs !
  - Overlay jaune semi-transparent qui apparaît pendant 2 secondes
  - Synchronisé avec le scroll du textarea
- 🔴 Overlay rouge pour les erreurs de parenthèses/crochets dans les textarea

**Impact** : Maintenant, **TOUTES** les corrections sont visuellement surlignées, que ce soit dans les éditeurs modernes (div) ou anciens (textarea) ! 🎉

---

## Version 2.3.0 (30 octobre 2025)

### ✨ Nouvelle fonctionnalité : Vérification des parenthèses et crochets

**Problème résolu** : Genius affiche l'erreur "Oops! It looks like you might have an uneven number of parentheses or square brackets" quand il y a un nombre impair de parenthèses ou de crochets.

**Solution implémentée** :
- 🔍 Nouveau bouton "🔍 Vérifier ( ) [ ]" dans le panneau d'outils
- Détection intelligente des parenthèses et crochets non appariés
- Surlignage en rouge avec animation pulsée pour identifier facilement les erreurs
- Messages d'information détaillés :
  - Nombre de caractères non appariés trouvés
  - Type d'erreur (ouvrant sans fermeture, fermant sans ouverture, mauvaise paire)
- Support complet pour les deux types d'éditeurs Genius (textarea et div contenteditable)
- Compatible avec le mode sombre de l'extension

**Comment utiliser** :
1. Ouvrez l'éditeur de paroles sur Genius
2. Cliquez sur le bouton "🔍 Vérifier ( ) [ ]" dans le panneau Genius Fast Transcriber
3. Les parenthèses/crochets non appariés seront surlignés en rouge avec une animation
4. Survolez un caractère surligné pour voir une infobulle expliquant le problème
5. Corrigez les erreurs et cliquez à nouveau sur le bouton pour vérifier

**Exemples de détection** :
- `(texte sans fermeture` → Le `(` sera surligné
- `texte sans ouverture)` → Le `)` sera surligné
- `[texte avec mauvaise fermeture)` → Le `)` sera surligné
- Détecte aussi les imbrications incorrectes

---

## Version 2.2.0

### Fonctionnalités principales
- Tags structuraux intelligents avec détection automatique des artistes
- Raccourcis clavier (Ctrl+1-5, Ctrl+Shift+C, Ctrl+Z/Y, Ctrl+Shift+S)
- Historique Undo/Redo (10 dernières modifications)
- Prévisualisation des corrections avec modal avant/après
- Statistiques en temps réel (lignes, mots, sections, caractères)
- Tutoriel guidé au premier lancement (6 étapes)
- Barre d'outils flottante pour formatage (gras/italique/nombres en lettres)
- Conversion de nombres en lettres françaises (0-999 milliards)
- Mode sombre avec préférence sauvegardée
- Corrections automatiques avec barre de progression


