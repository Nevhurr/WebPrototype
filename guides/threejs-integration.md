# Intégration Three.js dans RetroOS

## Vue d'ensemble

RetroOS intègre maintenant Three.js pour offrir un rendu 3D des fenêtres avec des effets de transparence et des animations fluides.

## Fonctionnalités ajoutées

### 1. Rendu 3D des fenêtres
- Chaque fenêtre ouverte génère automatiquement un mesh 3D
- Les fenêtres sont rendues avec transparence et effets de bordure
- Animation subtile de flottement pour un effet immersif

### 2. Transparence avancée
- **Barre des tâches** : Fond semi-transparent avec effet de flou (backdrop-filter)
- **Fenêtres** : Arrière-plan semi-transparent avec effet de flou
- **En-têtes de fenêtres** : Transparence avec effet de flou

### 3. Interface aux bords droits
- **Design épuré** : Tous les éléments utilisent des bords droits (border-radius: 0)
- **Style rétro** : Suppression des bords arrondis pour un look plus authentique
- **Cohérence visuelle** : Interface uniforme avec des angles nets

### 4. Gestion des fenêtres 3D
- Synchronisation automatique entre la position HTML et le mesh 3D
- Déplacement direct des fenêtres sans smoothing (transition: none pendant le drag)
- Gestion de la mémoire pour éviter les fuites

## Architecture technique

### Classe ThreeJSRenderer
```javascript
class ThreeJSRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.windows = new Map();
        // ...
    }
}
```

### Intégration avec RetroOS
- Initialisation automatique au démarrage du système
- Gestion des événements de redimensionnement
- Synchronisation avec le système de fenêtres existant

## Utilisation

### Ouverture d'une fenêtre
1. Double-clic sur une icône du bureau
2. La fenêtre s'ouvre avec son rendu 3D
3. Le mesh Three.js est créé automatiquement

### Déplacement d'une fenêtre
1. Cliquer et glisser sur la barre de titre
2. La position HTML et 3D sont synchronisées
3. Déplacement direct sans smoothing (transition désactivée pendant le drag)

### Fermeture d'une fenêtre
1. Cliquer sur le bouton de fermeture
2. Le mesh 3D est automatiquement supprimé
3. Nettoyage de la mémoire

## Configuration

### Variables CSS
```css
:root {
    --primary-color: #ff4444;
    --secondary-color: #ff6666;
    --accent-color: #ff8888;
    /* ... */
}
```

### Paramètres Three.js
- **Caméra** : Perspective 75° avec position Z = 5
- **Lumière** : Ambiance + directionnelle
- **Matériaux** : Lambert avec transparence
- **Rendu** : WebGL avec alpha et antialiasing

## Compatibilité

### Navigateurs supportés
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Fonctionnalités requises
- WebGL support
- backdrop-filter (optionnel, fallback CSS)
- ES6+ support

## Dépannage

### Problèmes courants
1. **Three.js ne se charge pas** : Vérifier la connexion internet pour le CDN
2. **Fenêtres 3D non visibles** : Vérifier la console pour les erreurs WebGL
3. **Performance lente** : Réduire la qualité des matériaux ou désactiver l'antialiasing

### Logs de débogage
```javascript
// Activer les logs détaillés
console.log('Three.js status:', this.threeJSRenderer.isInitialized);
console.log('Windows 3D:', this.threeJSRenderer.windows.size);
```

## Évolutions futures

### Fonctionnalités prévues
- Effets de particules sur les fenêtres
- Animations de transition 3D
- Thèmes visuels personnalisables
- Intégration avec les effets de ripple

### Optimisations
- Lazy loading des meshes
- Pool d'objets 3D
- Compression des géométries
- Support des shaders personnalisés

## Support technique

Pour toute question ou problème lié à l'intégration Three.js :
1. Vérifier la console du navigateur
2. Consulter les logs RetroOS
3. Tester avec un navigateur différent
4. Vérifier la compatibilité WebGL
