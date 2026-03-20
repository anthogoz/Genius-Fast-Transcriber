# 🤖 Genius Fast Transcriber - Directives Gemini (AI Assistant)

Ce fichier contient les règles strictes et le contexte global du projet pour l'assistant IA (Gemini, Claude, Cursor, Windsurf, etc.). Toute génération de code ou modification doit se conformer à ces directives pour garantir la cohérence, la performance et la qualité de "Genius Fast Transcriber".

## 🎯 Raison d'être & Fonctionnalités Principales (Ce que fait l'extension)
"Genius Fast Transcriber" est une extension de navigateur qui s'injecte directement sur les pages d'édition de paroles de Genius.com (`*://*.genius.com/*-lyrics`). Son but est de fournir un panneau flottant d'outils avancés pour accélérer et standardiser le travail des contributeurs Genius.

Voici les fonctionnalités majeures à toujours avoir en tête :
- **Insertion Rapide de Structure** : Ajout dynamique de tags (ex: `[Couplet 1]`) avec auto-détection des artistes présents sur la page (pour les Featuring) et adaptation de la langue (FR, EN, PL).
- **Nettoyage Typographique (Fix All)** : Corrige en un clic la typographie (apostrophes courbes `’` vers rectilignes `'`, guillemets `« »` vers `"`, suppression des doubles espaces, formatage des `...` et sauts de ligne réglementaires selon le standard Genius).
- **Générateur de Lyric Cards** : Un outil graphique (`LyricCardModal.vue`) permettant de sélectionner du texte et de l'exporter en tant que carte image (ratio 1:1, 9:16, 16:9) pour les réseaux sociaux, en récupérant dynamiquement la cover de l'album ou la photo de l'artiste.
- **Outils de Saisie & Macros** : 
  - *Custom Button Manager* : Permet à l'utilisateur de créer ses propres boutons virtuels (insertions de texte simples ou remplacements Regex complexes) via l'interface.
  - *Convertisseur Nombres/Lettres* : Convertit dynamiquement "42" en "quarante-deux" (ou "forty-two" en anglais).
- **Sécurité des Données** :
  - *Historique (Undo/Redo)* : Gère un historique d'états (jusqu'à 10 pas) pour annuler/rétablir les modifications dans le champ texte.
  - *Brouillon (Draft)* : Auto-sauvegarde périodique du texte tapé en cache local pour éviter la perte de données après un crash navigateur ou un faux move.
- **Lecteur YouTube Intégré** : S'interface avec le lecteur YouTube inclus sur Genius pour permettre de faire Play/Pause ou Reculer/Avancer de 5s via des raccourcis claviers ou l'UI du panel, sans quitter le champ d'édition de texte.

## ⚙️ Comment elle fonctionne techniquement (Le Détail interne)
L'extension ne possède pas de page web autonome (standalone). Tout le coeur applicatif vit dans le **Content Script** (`src/entrypoints/content/`).
1. **Injection Vue 3** : Le content script observe l'arborescence DOM complexe de la page Genius.com, intercepte l'initialisation de la page, crée un ancrage sécurisé (Shadow DOM ou balise isolée gérée par WXT), et y "mount" (monte) l'application principale Vue 3 (le composant parent `GftPanel.vue`).
2. **Interaction Globale avec l'Éditeur Genius** :
   - Genius.com utilise un `<div contenteditable="true">` sur-mesure piloté par React.
   - Les modifications texte (ajouts macro, regex de nettoyage) sont opérées via des hooks (`useEditor.ts` / `useCorrections.ts`). 
   - **⚠️ Point Technique Critique** : Manipuler un `contenteditable` React de l'extérieur via JavaScript est périlleux. L'extension ne fait pas de simple `div.innerText = "..."`. Elle extrait l'état brut, applique les transformations, l'injecte, puis notifie React du changement en déclenchant manuellement des événements natifs de type `input`, `blur`, `focus` sur le DOM pour forcer Genius à prendre en compte le nouveau texte et l'inclure dans son propre état virtuel, évitant ainsi un écrasement au prochain rendu de page.
3. **Scraping de Page et Métadonnées** : Pour certaines fonctionnalités (comme exporter un fichier texte sans balises HTML via `NativeExportButton`, ou l'auto-détection des artistes invités), l'extension utilise des méthodes d'analyse du HTML statique de Genius (`querySelector`, parsing Regex du texte) pour en extraire l'essence (cover, titre, album, featuring).
4. **Réactivité de l'État Local** : L'UI du panel est totalement réactive ("Y a-t-il un brouillon disponible ?", "Quelle langue d'UI est active ?"). Cette réactivité est isolée hors des composants Vue, et transite par une batterie de composables purs (`useSettings.ts`, `useGftState.ts`, `useDraft.ts`, `useUndoRedo.ts`) qui sauvegardent également leur état persistant localement grâce aux utilitaires de persistance de `wxt/storage`.

## 🏗️ Architecture & Stack Technologique
- **Framework de Base** : [WXT](https://wxt.dev) (Framework "Next-gen" pour extensions de navigateur).
- **Frontend** : Vue 3 avec l'API de Composition (`<script setup lang="ts">`).
- **Langage Principal** : TypeScript (mode strict).
- **Structure des Dossiers** :
  - `src/entrypoints/` : Points d'entrée de l'extension WXT (Content scripts, Background, Popup).
  - `src/components/` : Composants Vue (SFC). Séparés par contexte (`content/` injectés dans la page web, `popup/` dans la fenêtre de l'extension).
  - `src/composables/` : Logique réactive, gestion d'état ou hooks personnalisés (ex: `useSettings`, `useUndoRedo`).
  - `src/utils/` : Fonctions pures, utilitaires textuels, ou logique agnostique à Vue.
  - `src/locales/` : Fichiers de traduction JSON et configuration i18n.

## 🎨 UI, CSS & Accessibilité
- **Isolation des Styles** : Le Content Script étant directement injecté dans les pages Web de Genius.com, il est **crucial d'isoler le CSS** et d'éviter les fuites de styles. 
  - Toujours utiliser `<style scoped>` dans Vue.
  - Préfixer manuellement toutes les classes CSS avec `gft-` (ex: `.gft-panel`, `.gft-btn-primary`). Ne jamais cibler de balises HTML globales natives type `div` ou `button` sans classe spécifique.
- **Thématisation (Sombre / Clair)** : 
  - Supporter dynamiquement les thèmes via des variables CSS natives dans une classe racine ou body (ex: `.gft-dark-mode` conditionnel sur l'enveloppe du panneau).
  - Préférer la déclaration de CSS de base comme: `--gft-panel-bg: #262626;`.
- **Internationalisation (i18n)** : 
  - Aucune chaîne de texte "en dur" dans les composants.
  - Toujours importer `useI18n` depuis `vue-i18n` et utiliser `t('ma_clef_de_langue')`. (ex: `{{ t('btn_fix_all_short') }}`).

## 📜 Règles de Code & Formatage (Biome)
Le projet utilise **Biome** en remplacement d'ESLint/Prettier. Les instructions de l'outil doivent être suivies strictement :
- **Indentation** : 2 espaces.
- **Largeur de ligne** : 100 caractères maximum.
- **Quotes** : Simples (`'`) pour TS/JS, Doubles (`"`) pour le JSX/Vue Templates.
- **Points-virgules** : Obligatoires à la fin des expressions (`semicolons: "always"`).
- **Virgules de fin** : Toujours (`trailingComma: "all"`).
*Pour le formatage, préférer analyser `biome.jsonc`. Les modifications manuelles doivent reproduire ce format ou invoquer un appel au script NPM de formatage : `npm run lint:fix` / `npm run format`.*

## 🧩 TypeScript & Vue 3 Guidelines
- **Uniquement Composition API** : Bannir l'utilisation de l'Options API (`data`, `methods`, `computed` externes). 
- **Typage Strict** : Typer rigoureusement tous les retours de fonctions, valeurs nullables et `props` (ex: `defineProps<{ maVariable: string }>()`). Éviter absolument le `any`.
- **Réactivité** : Gérer l'état global et partagé à l'aide de Composables (`ref` et `reactive` stockés hors du scope des composants ou partagés intelligemment) plutôt que via un store complexe (pas de Pinia/Vuex à moins de refonte majeure).

## 🛠️ Bonnes pratiques des Extensions Navigateur
1. **Éphémérité du Content Script** : Les sites web modernes utilisent des frameworks réactifs (React, Nextjs). La page Genius peut complètement se recharger via le routeur SPA sans recharger l'extension. L'initialiseur doit observer proprement le DOM.
2. **Performances** : Ne pas abuser des écouteurs globaux ou des `MutationObserver` étendus. Si attachés, ils **doivent être supprimés** lors du démontage des composants (`onBeforeUnmount`).
3. **Historique des changements** : Pour tout bouton d'action modifiant l'éditeur de texte natif de Genius, intégrer cette logique via le composable propriétaire et s'assurer que la fonction `undo/redo` de l'éditeur ne soit pas cassée.

## 📋 Commandes Utiles
- `npm run dev` : Démarre le serveur et recharge la page sur Chrome avec HMR.
- `npm run dev:firefox` : Idem pour Firefox.
- `npm run build` : Compile la version de production.
- `npm run typecheck` : Vérifie les erreurs de typage TypeScript.

## 🤝 Comportement de l'assistant (Gemini)
1. **Pense avant de coder** : Si la modification est lourde, propose d'abord un plan d'action condensé au développeur.
2. **Ne brise pas l'existant** : Avant de supprimer une fonction apparemment "inutile", s'assurer par une recherche globale (rg/grep) qu'elle n'est pas invoquée conditionnellement ailleurs ou depuis un point d'entrée WXT distant.
3. **Commentaires clairs** : Laisser de brefs commentaires techniques si le segment résout un problème complexe d'API de DOM de Genius.com, de contournement d'événement React dans le champ d'édition (`contenteditable`), etc.
4. **Fichiers temporaires** : Ne jamais créer de fichiers poubelles, de logs de commandes ou d'exports de tests à la racine du projet. Utiliser toujours et uniquement le dossier `tmp/` pour garder l'arborescence propre.
