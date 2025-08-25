# Guide de la Transparence dans RetroOS

## Vue d'ensemble

RetroOS utilise maintenant un système de transparence avancé inspiré des techniques de daedalOS pour créer une interface moderne et élégante avec des fenêtres semi-transparentes.

## Techniques de transparence utilisées

### 1. **RGBA Colors**
- Utilisation de couleurs avec canal alpha pour la transparence
- Exemple : `rgba(34, 34, 34, 0.75)` pour les fenêtres
- Les valeurs d'opacité vont de 0 (transparent) à 1 (opaque)

### 2. **Backdrop Filter**
- Effet de flou derrière les éléments semi-transparents
- Propriété CSS : `backdrop-filter: blur(8px)`
- Support WebKit : `-webkit-backdrop-filter: blur(8px)`

### 3. **Variables CSS centralisées**
```css
:root {
    --window-bg-opacity: 0.75;
    --window-bg-focused: 0.85;
    --window-bg-unfocused: 0.6;
    --window-header-opacity: 0.8;
    --window-header-focused: 0.9;
    --window-header-unfocused: 0.7;
    --taskbar-opacity: 0.75;
    --menu-opacity: 0.9;
    --icon-opacity: 0.1;
    --border-opacity: 0.6;
    --glow-opacity: 0.4;
    
    --window-blur: 8px;
    --header-blur: 12px;
    --taskbar-blur: 15px;
    --menu-blur: 12px;
    --icon-blur: 3px;
    
    /* Nouvelles variables pour les dégradés sombres des en-têtes */
    --header-dark-start: rgba(20, 20, 20, 0.8);
    --header-dark-mid: rgba(40, 20, 20, 0.8);
    --header-dark-end: rgba(60, 20, 20, 0.8);
    --header-focused-start: rgba(25, 25, 25, 0.9);
    --header-focused-mid: rgba(50, 25, 25, 0.9);
    --header-focused-end: rgba(75, 25, 25, 0.9);
    --header-unfocused-start: rgba(15, 15, 15, 0.7);
    --header-unfocused-mid: rgba(35, 15, 15, 0.7);
    --header-unfocused-end: rgba(55, 15, 15, 0.7);
}
```

## Éléments avec transparence

### **Fenêtres principales**
```css
.window {
    background: rgba(34, 34, 34, 0.75);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
}

.window.focused {
    background: rgba(34, 34, 34, 0.85);
    box-shadow: 0 0 25px var(--shadow-color);
}

.window:not(.focused) {
    background: rgba(34, 34, 34, 0.6);
    box-shadow: 0 0 15px rgba(255, 68, 68, 0.2);
}
```

### **En-têtes de fenêtres - Comportement spécial**
Les en-têtes utilisent maintenant des **dégradés sombres et subtils** avec des touches de rouge pour un look plus élégant :

```css
.window-header {
    background: linear-gradient(135deg, 
        rgba(20, 20, 20, 0.8) 0%, 
        rgba(40, 20, 20, 0.8) 50%, 
        rgba(60, 20, 20, 0.8) 100%);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}

.window.focused .window-header {
    background: linear-gradient(135deg, 
        rgba(25, 25, 25, 0.9) 0%, 
        rgba(50, 25, 25, 0.9) 50%, 
        rgba(75, 25, 25, 0.9) 100%);
}

.window:not(.focused) .window-header {
    background: linear-gradient(135deg, 
        rgba(15, 15, 15, 0.7) 0%, 
        rgba(35, 15, 15, 0.7) 50%, 
        rgba(55, 15, 15, 0.7) 100%);
}
```

**Caractéristiques des nouveaux en-têtes :**
- **Dégradé sombre** : Du noir pur vers des tons très sombres avec des touches de rouge
- **Transparence variable** : 0.7 (non focus) à 0.9 (focus)
- **Accents rouges subtils** : Présents dans les bordures et les effets de lueur
- **Effet de flou** : `backdrop-filter: blur(12px)` toujours actif
- **Transition fluide** : Changement de dégradé en 0.3s
- **Couleur du texte** : `var(--text-primary)` pour une meilleure lisibilité

### **Barre des tâches**
```css
#taskbar {
    background: linear-gradient(to top, 
        rgba(26, 26, 26, 0.75) 0%, 
        rgba(34, 34, 34, 0.75) 100%);
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
}
```

### **Menu de démarrage**
```css
#start-menu {
    background: rgba(26, 26, 26, 0.9);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
}
```

### **Icônes du bureau**
```css
.desktop-icon {
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(3px);
    -webkit-backdrop-filter: blur(3px);
}
```

## Effets de transparence avancés

### **Pseudo-éléments pour la profondeur**
```css
.window::before,
.window::after {
    background: rgba(255, 68, 68, 0.1);
    opacity: 0.6;
    mix-blend-mode: overlay;
}
```

### **Bordures semi-transparentes**
```css
.window-header {
    border-bottom: 1px solid rgba(255, 68, 68, 0.3);
}
```

### **Ombres avec transparence**
```css
.window {
    box-shadow: 0 0 20px rgba(255, 68, 68, 0.3);
}

.window.focused {
    box-shadow: 0 0 25px var(--shadow-color);
}

.window:not(.focused) {
    box-shadow: 0 0 15px rgba(255, 68, 68, 0.2);
}
```

## Gestion des états de focus

### **Fenêtres focusées**
- **Corps** : Plus opaque (`rgba(34, 34, 34, 0.85)`)
- **En-tête** : Dégradé sombre plus visible avec des touches de rouge subtiles
- **Ombre** : Plus prononcée et colorée

### **Fenêtres non focusées**
- **Corps** : Plus transparent (`rgba(34, 34, 34, 0.6)`)
- **En-tête** : Dégradé sombre plus transparent avec des touches de rouge très discrètes
- **Ombre** : Plus discrète et moins colorée

### **Transitions fluides**
```css
.window {
    transition: all 0.3s ease;
}

.window-header {
    transition: background 0.3s ease;
}
```

### **Détail des dégradés sombres**
Les en-têtes utilisent maintenant des dégradés à 3 points pour plus de profondeur :

**État par défaut :**
- Début : `rgba(20, 20, 20, 0.8)` - Noir pur
- Milieu : `rgba(40, 20, 20, 0.8)` - Noir avec très légère touche de rouge
- Fin : `rgba(60, 20, 20, 0.8)` - Gris très sombre avec touche de rouge

**État focusé :**
- Début : `rgba(25, 25, 25, 0.9)` - Noir légèrement plus clair
- Milieu : `rgba(50, 25, 25, 0.9)` - Gris sombre avec touche de rouge
- Fin : `rgba(75, 25, 25, 0.9)` - Gris moyen avec touche de rouge

**État non focusé :**
- Début : `rgba(15, 15, 15, 0.7)` - Noir plus sombre
- Milieu : `rgba(35, 15, 15, 0.7)` - Noir avec touche de rouge très discrète
- Fin : `rgba(55, 15, 15, 0.7)` - Gris sombre avec touche de rouge discrète

## Transparence 3D avec Three.js

### **Matériaux transparents**
```javascript
const material = new THREE.MeshLambertMaterial({
    color: 0x222222,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
    alphaTest: 0.1
});
```

### **Bordures transparentes**
```javascript
const borderMaterial = new THREE.LineBasicMaterial({ 
    color: 0xff4444,
    transparent: true,
    opacity: 0.7,
    linewidth: 2
});
```

### **Effets de lueur**
```javascript
const glowMaterial = new THREE.MeshBasicMaterial({
    color: 0xff4444,
    transparent: true,
    opacity: 0.1,
    side: THREE.DoubleSide
});
```

## Gestion des états

### **Fenêtres en cours de déplacement**
```css
.window.dragging {
    background: rgba(34, 34, 34, 0.95);
    transition: none;
}
```

### **Fenêtres en cours de redimensionnement**
```css
.window.resizing {
    background: rgba(34, 34, 34, 0.95);
    transition: none;
}
```

### **Éléments au survol**
```css
.desktop-icon:hover {
    background: rgba(255, 68, 68, 0.2);
    backdrop-filter: blur(5px);
}
```

## Compatibilité et fallbacks

### **Support des navigateurs**
- `backdrop-filter` : Support moderne (Chrome 76+, Firefox 103+, Safari 9+)
- `-webkit-backdrop-filter` : Support WebKit/Safari
- Fallback automatique vers opacité simple si non supporté

### **Dégradation gracieuse**
- Si `backdrop-filter` n'est pas supporté, l'opacité RGBA fonctionne toujours
- Les effets de transparence restent visibles
- Seul l'effet de flou est perdu

## Personnalisation

### **Modifier l'opacité globale**
```css
:root {
    --window-bg-opacity: 0.9; /* Plus opaque */
    --window-bg-opacity: 0.7; /* Plus transparent */
}
```

### **Modifier l'intensité du flou**
```css
:root {
    --window-blur: 5px;  /* Flou plus subtil */
    --window-blur: 15px; /* Flou plus prononcé */
}
```

### **Ajuster la transparence des en-têtes**
```css
:root {
    --window-header-opacity: 0.8;     /* Plus visible */
    --window-header-unfocused: 0.7;   /* Plus transparent quand non focus */
    --window-header-focused: 0.9;     /* Plus visible quand focus */
}
```

### **Personnaliser les dégradés sombres des en-têtes**
```css
:root {
    /* Dégradé par défaut */
    --header-dark-start: rgba(20, 20, 20, 0.8);
    --header-dark-mid: rgba(40, 20, 20, 0.8);
    --header-dark-end: rgba(60, 20, 20, 0.8);
    
    /* Dégradé focusé - plus clair et visible */
    --header-focused-start: rgba(25, 25, 25, 0.9);
    --header-focused-mid: rgba(50, 25, 25, 0.9);
    --header-focused-end: rgba(75, 25, 25, 0.9);
    
    /* Dégradé non focusé - plus sombre et discret */
    --header-unfocused-start: rgba(15, 15, 15, 0.7);
    --header-unfocused-mid: rgba(35, 15, 15, 0.7);
    --header-unfocused-end: rgba(55, 15, 15, 0.7);
}
```

### **Créer des dégradés personnalisés**
```css
/* Dégradé bleu sombre */
.custom-header-blue {
    background: linear-gradient(135deg, 
        rgba(20, 20, 40, 0.8) 0%, 
        rgba(40, 20, 60, 0.8) 50%, 
        rgba(60, 20, 80, 0.8) 100%);
}

/* Dégradé vert sombre */
.custom-header-green {
    background: linear-gradient(135deg, 
        rgba(20, 40, 20, 0.8) 0%, 
        rgba(40, 60, 20, 0.8) 50%, 
        rgba(60, 80, 20, 0.8) 100%);
}
```

### **Ajouter de nouveaux éléments transparents**
```css
.new-element {
    background: rgba(255, 68, 68, var(--glow-opacity));
    backdrop-filter: blur(var(--icon-blur));
    -webkit-backdrop-filter: blur(var(--icon-blur));
}
```

## Dépannage

### **Transparence ne fonctionne pas**
1. Vérifier que le navigateur supporte `backdrop-filter`
2. S'assurer que l'élément a un `z-index` approprié
3. Vérifier qu'il n'y a pas de conflit avec d'autres propriétés CSS

### **Performance dégradée**
1. Réduire l'intensité du flou (`backdrop-filter`)
2. Limiter le nombre d'éléments avec transparence
3. Utiliser `will-change: transform` pour les animations

### **Rendu incorrect**
1. Vérifier que `position` est correctement définie
2. S'assurer que `overflow` est approprié
3. Contrôler les `z-index` pour éviter les superpositions

## Bonnes pratiques

1. **Utiliser les variables CSS** pour maintenir la cohérence
2. **Tester sur différents navigateurs** pour la compatibilité
3. **Optimiser les performances** en limitant l'usage du flou
4. **Maintenir la lisibilité** en ajustant l'opacité selon le contenu
5. **Documenter les changements** pour faciliter la maintenance

## Exemples d'utilisation

### **Créer une nouvelle fenêtre transparente**
```css
.custom-window {
    background: rgba(0, 0, 0, var(--window-bg-opacity));
    backdrop-filter: blur(var(--window-blur));
    -webkit-backdrop-filter: blur(var(--window-blur));
    border: 1px solid rgba(255, 68, 68, var(--border-opacity));
}
```

### **Ajouter un effet de transparence au survol**
```css
.interactive-element:hover {
    background: rgba(255, 68, 68, 0.3);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
}
```

### **Créer un en-tête avec transparence constante**
```css
.custom-header {
    background: linear-gradient(135deg, 
        rgba(255, 68, 68, var(--window-header-opacity)) 0%, 
        rgba(255, 102, 102, var(--window-header-opacity)) 100%);
    backdrop-filter: blur(var(--header-blur));
    -webkit-backdrop-filter: blur(var(--header-blur));
}
```

## Comportement spécial des en-têtes

### **Principe de conception**
Les en-têtes des fenêtres dans RetroOS suivent un principe unique :
- **Couleur constante** : Rouge caractéristique maintenu en permanence
- **Transparence variable** : Ajustée selon l'état de focus
- **Effet de flou permanent** : `backdrop-filter` toujours actif

### **Avantages de cette approche**
1. **Cohérence visuelle** : Les en-têtes restent reconnaissables
2. **Hiérarchie claire** : Focus/non-focus facilement distinguable
3. **Esthétique moderne** : Transparence sans perte d'identité
4. **Performance optimisée** : Transitions fluides et naturelles

Ce guide couvre tous les aspects de la transparence dans RetroOS et devrait vous aider à comprendre et personnaliser le système selon vos besoins.
