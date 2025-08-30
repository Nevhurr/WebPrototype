# Structure Modulaire RetroOS

## Vue d'ensemble

Le code JavaScript a été découplé en plusieurs modules distincts pour améliorer la maintenabilité, le débogage et réduire le contexte nécessaire pour chaque modification.

## Structure des dossiers

```
script/
├── core/                    # Modules principaux
│   ├── RetroOS.js          # Classe principale RetroOS
│   ├── WindowManager.js     # Gestion des fenêtres
│   └── BootSequence.js     # Séquence de démarrage
├── ui/                      # Interface utilisateur
│   ├── Cursor.js           # Curseur personnalisé
│   ├── StartMenu.js        # Menu de démarrage
│   └── Desktop.js          # Gestion du bureau
├── effects/                 # Effets visuels
│   └── RippleEffect.js     # Effets de ripple
├── utils/                   # Utilitaires
│   ├── Clock.js            # Horloge système
│   └── EventHandlers.js    # Gestionnaires d'événements
└── README.md               # Ce fichier
```

## Modules

### Core
- **RetroOS.js** : Classe principale qui orchestre tous les modules
- **WindowManager.js** : Gestion complète des fenêtres (ouverture, fermeture, redimensionnement, drag & drop)
- **BootSequence.js** : Séquence de démarrage avec messages NekoOS

### UI
- **Cursor.js** : Curseur personnalisé avec effets de hover
- **StartMenu.js** : Menu de démarrage avec positionnement dynamique
- **Desktop.js** : Gestion des icônes du bureau et grille

### Effects
- **RippleEffect.js** : Effets de ripple sur le fond d'écran

### Utils
- **Clock.js** : Horloge système avec mise à jour automatique
- **EventHandlers.js** : Gestionnaires d'événements globaux

## Avantages du découplage

1. **Débogage facilité** : Chaque module a une responsabilité claire
2. **Réduction du contexte** : Moins de code à analyser par requête
3. **Maintenabilité** : Plus facile de modifier une fonctionnalité spécifique
4. **Réutilisabilité** : Modules pouvant être réutilisés ailleurs
5. **Performance** : Chargement plus efficace avec les modules ES6

## Utilisation

Le fichier `script.js` principal importe et initialise tous les modules :

```javascript
import { RetroOS } from './script/core/RetroOS.js';

document.addEventListener('DOMContentLoaded', () => {
    const retroOS = new RetroOS();
});
```

## Modification de la vitesse de l'effet machine à écrire

Pour modifier la vitesse de l'effet machine à écrire, éditez le fichier `script/core/BootSequence.js` :

```javascript
typewriterEffect(element, text, speed = 15) {
    // speed = délai en millisecondes entre chaque caractère
    // 5 = très rapide, 15 = actuel, 50 = lent, 100 = très lent
}
```
