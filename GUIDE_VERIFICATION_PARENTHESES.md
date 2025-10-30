# 🔍 Guide : Vérification des Parenthèses et Crochets

## 📖 Présentation

Cette nouvelle fonctionnalité de Genius Fast Transcriber v2.3.0 vous aide à **détecter et corriger** les parenthèses `( )` et crochets `[ ]` non appariés dans vos paroles avant de soumettre votre transcription sur Genius.

### 🎯 Problème résolu

Genius affiche parfois cette erreur frustrante :
> "Oops! It looks like you might have an uneven number of parentheses or square brackets. Check the lyrics to make sure that they match up."

Avec cette fonctionnalité, **vous trouvez instantanément** où se trouvent les erreurs !

---

## 🚀 Comment utiliser

### Étape 1 : Accéder à l'éditeur

1. Ouvrez une page d'édition de paroles sur Genius.com
2. Le panneau **Genius Fast Transcriber** apparaît automatiquement

### Étape 2 : Lancer la vérification

1. Cliquez sur le bouton **"🔍 Vérifier ( ) [ ]"** dans le panneau
2. L'extension analyse immédiatement tout le texte

### Étape 3 : Identifier les erreurs

Si des erreurs sont trouvées :
- Les caractères problématiques sont **surlignés en rouge** avec une animation pulsée
- Un message indique le nombre d'erreurs trouvées
- Survolez un caractère surligné pour voir une infobulle explicative

Si tout est correct :
- Un message de confirmation ✅ s'affiche
- Aucun surlignage n'apparaît

### Étape 4 : Corriger les erreurs

1. Localisez les caractères surlignés en rouge
2. Lisez l'infobulle pour comprendre le problème
3. Corrigez manuellement l'erreur :
   - Ajoutez la parenthèse/crochet manquant
   - Supprimez le caractère en trop
   - Remplacez par le bon type de caractère
4. Cliquez à nouveau sur **"🔍 Vérifier ( ) [ ]"** pour vérifier

---

## 🔍 Types d'erreurs détectées

### 1️⃣ Caractère ouvrant sans fermeture

**Exemple** :
```
[Couplet 1
Je chante une chanson (très belle
```

**Résultat** : Le `[` et le `(` seront surlignés en rouge

**Correction** :
```
[Couplet 1]
Je chante une chanson (très belle)
```

---

### 2️⃣ Caractère fermant sans ouverture

**Exemple** :
```
Je chante une chanson très belle)
Et c'est magnifique]
```

**Résultat** : Le `)` et le `]` seront surlignés en rouge

**Correction** :
```
Je chante une chanson (très belle)
Et c'est magnifique
```

---

### 3️⃣ Mauvaise paire de caractères

**Exemple** :
```
[Refrain)
(Couplet 1]
```

**Résultat** : Le `)` et le `]` seront surlignés en rouge (ils ne correspondent pas aux caractères ouvrants)

**Correction** :
```
[Refrain]
[Couplet 1]
```

---

## 💡 Conseils d'utilisation

### ✅ Bonnes pratiques

1. **Vérifiez régulièrement** : Lancez la vérification après avoir ajouté plusieurs sections
2. **Avant de soumettre** : Toujours vérifier avant de sauvegarder sur Genius
3. **Mode sombre** : Le surlignage fonctionne aussi en mode sombre !
4. **Tags Genius** : Faites particulièrement attention aux tags `[Couplet]`, `[Refrain]`, etc.

### ⚠️ Limitations

- La fonction détecte uniquement `( )` et `[ ]`, pas `{ }` ou `< >`
- Les parenthèses/crochets dans les commentaires HTML ne sont pas vérifiés
- Pour les éditeurs `textarea` (ancien format), le curseur se positionne sur la première erreur au lieu de surligner

---

## 🎨 Apparence visuelle

### En mode clair
- Surlignage : **fond rouge vif** (`#ff4444`)
- Animation : **pulsation douce**
- Texte : **blanc en gras**

### En mode sombre
- Surlignage : **fond rouge plus clair** (`#ff5555`)
- Animation : **pulsation adaptée**
- Texte : **blanc en gras**

---

## 🐛 Dépannage

### Le bouton ne s'affiche pas
- Vérifiez que vous êtes bien sur une page d'édition Genius
- Rechargez la page (F5)
- Vérifiez que l'extension est activée

### Les erreurs ne sont pas surlignées
- Assurez-vous d'utiliser l'éditeur moderne de Genius (div contenteditable)
- Si vous utilisez l'ancien éditeur (textarea), le curseur se positionne sur l'erreur au lieu de surligner

### Le surlignage ne disparaît pas après correction
- Cliquez à nouveau sur le bouton **"🔍 Vérifier ( ) [ ]"**
- Si le problème persiste, rechargez la page

---

## 📊 Exemples pratiques

### ✅ Texte correct
```
[Couplet 1]
Je suis un artiste (très talentueux)
Et j'écris des paroles [incroyables]

[Refrain]
(Oh oh oh)
C'est magnifique !
```

**Résultat** : ✅ Aucun problème trouvé !

---

### ❌ Texte avec erreurs
```
[Couplet 1
Je suis un artiste (très talentueux
Et j'écris des paroles [incroyables)

[Refrain]
(Oh oh oh
C'est magnifique !
```

**Résultat** : ⚠️ 5 erreurs trouvées :
1. `[` de "Couplet 1" → ouvrant sans fermeture
2. `(` de "très talentueux" → ouvrant sans fermeture
3. `)` de "incroyables)" → ne correspond pas au `[`
4. `(` de "Oh oh oh" → ouvrant sans fermeture

**Correction** :
```
[Couplet 1]
Je suis un artiste (très talentueux)
Et j'écris des paroles [incroyables]

[Refrain]
(Oh oh oh)
C'est magnifique !
```

---

## 🤝 Besoin d'aide ?

Si vous rencontrez un problème ou avez une question :
1. Consultez les [Issues GitHub](https://github.com/anthogoz/genius-fast-transcriber/issues)
2. Créez une nouvelle Issue si nécessaire
3. Contactez l'auteur : [@anthogoz](https://github.com/anthogoz)

---

**Fait avec ❤️ par Lnkhey pour la communauté Genius**


