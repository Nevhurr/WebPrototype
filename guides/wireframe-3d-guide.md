# Guide d'utilisation du Wireframe 3D

## Vue d'ensemble

Le wireframe du background a été transformé en objet 3D modifiable utilisant Three.js. Il remplace le wireframe CSS statique par une grille 3D interactive que vous pouvez manipuler en temps réel.

## Activation/Désactivation

- **Bouton Wireframe 3D** : Cliquez sur le bouton "Wireframe 3D" dans la barre des tâches pour basculer entre le mode 3D et CSS
- **Clic sur le canvas** : Cliquez directement sur le canvas Three.js pour activer/désactiver l'interaction

## Contrôles disponibles

### Déplacement
- **Flèches directionnelles** : Déplacer le wireframe dans le plan X/Y
- **Page Up/Down** : Déplacer le wireframe en profondeur (axe Z)

### Rotation
- **R/r** : Rotation autour de l'axe Y (gauche/droite)
- **T/t** : Rotation autour de l'axe X (haut/bas)
- **Y/y** : Rotation autour de l'axe Z (torsion)

### Échelle
- **+** ou **=** : Agrandir le wireframe
- **-** : Réduire le wireframe

### Déformation
- **D** : Augmenter la déformation sinusoïdale
- **d** : Diminuer la déformation

### Reset
- **Espace** : Remettre le wireframe à sa position et rotation d'origine

## Fonctionnalités avancées

### Points de contrôle
Le wireframe dispose de points de contrôle sphériques aux intersections de la grille qui peuvent être utilisés pour des manipulations plus précises.

### Animations automatiques
- **Pulsation** : Le wireframe pulse légèrement quand il est en mode 3D
- **Rotation continue** : Si une rotation est appliquée, elle continue automatiquement

### Effets visuels
- **Lignes colorées** : Les bordures de la grille sont en rouge, les lignes internes en gris
- **Transparence** : Le wireframe est semi-transparent pour ne pas masquer l'interface
- **Éclairage** : Lumière ponctuelle rouge pour mettre en valeur la structure 3D

## Intégration avec l'interface

Le wireframe 3D s'intègre parfaitement avec le reste de RetroOS :
- Les fenêtres d'applications sont rendues en 3D au-dessus du wireframe
- L'effet de ripple est conservé et fonctionne avec les deux modes
- Le curseur personnalisé reste visible et fonctionnel

## Dépannage

### Le wireframe ne s'affiche pas
1. Vérifiez que Three.js est chargé correctement
2. Regardez la console pour d'éventuelles erreurs
3. Assurez-vous que le canvas Three.js est visible

### Les contrôles ne répondent pas
1. Vérifiez que le mode 3D est activé (bouton actif)
2. Assurez-vous que le canvas a le focus
3. Vérifiez que vous n'êtes pas dans une fenêtre d'application

### Performance lente
1. Réduisez la complexité de la grille dans le code
2. Désactivez les animations automatiques si nécessaire
3. Vérifiez que votre navigateur supporte WebGL

## Personnalisation

Le wireframe peut être personnalisé en modifiant les paramètres dans `script.js` :
- `gridSize` : Taille de la grille
- `gridDivisions` : Nombre de divisions
- Couleurs des lignes et points de contrôle
- Intensité des effets de déformation

## Compatibilité

- **Navigateurs supportés** : Chrome, Firefox, Safari, Edge (versions récentes)
- **WebGL requis** : Vérifiez la compatibilité sur [caniuse.com](https://caniuse.com/webgl)
- **Performance** : Optimisé pour les appareils avec accélération matérielle
