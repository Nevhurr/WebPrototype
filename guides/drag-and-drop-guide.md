# Guide du Glisser-Déposer des Icônes du Bureau

## Fonctionnalités Implémentées

### 1. **Double-clic requis pour ouvrir les applications**
- Les icônes du bureau nécessitent maintenant un **double-clic** pour s'ouvrir
- Un clic simple ne fait plus rien, permettant la sélection des icônes

### 2. **Grille intelligente du bureau**
- **Grille automatique** : Les icônes sont positionnées automatiquement sur une grille invisible
- **Taille de grille** : 80px par cellule avec 20px de marge entre les icônes
- **Calcul intelligent** : Le nombre de colonnes et lignes s'adapte automatiquement à la taille de l'écran

### 3. **Glisser-Déposer des icônes**
- **Clic et glissement** : Cliquez et maintenez sur une icône pour la déplacer
- **Snap à la grille** : Les icônes se positionnent automatiquement sur la grille la plus proche
- **Indicateur visuel** : Un rectangle en pointillés rouge indique la position de grille cible
- **Animation fluide** : Les icônes glissent doucement vers leur position finale

### 4. **Gestion des collisions**
- **Position libre** : Si la position cible est occupée, l'icône trouve automatiquement la position libre la plus proche
- **Recherche en spirale** : L'algorithme recherche en spirale pour trouver la meilleure position disponible
- **Extension automatique** : Si toutes les positions sont occupées, la grille s'étend automatiquement

## Comment Utiliser

### **Ouvrir une application :**
1. **Double-cliquez** sur l'icône du bureau
2. L'application s'ouvrira dans une fenêtre

### **Déplacer une icône :**
1. **Cliquez et maintenez** sur l'icône
2. **Glissez** l'icône vers la nouvelle position souhaitée
3. **Relâchez** le bouton de souris
4. L'icône se positionnera automatiquement sur la grille la plus proche

### **Réorganiser le bureau :**
- Déplacez les icônes dans l'ordre que vous préférez
- La grille s'adapte automatiquement à vos préférences
- Les positions sont sauvegardées et maintenues

## Détails Techniques

### **Blocage des interactions natives :**
- Les menus contextuels du clic droit sont désactivés
- Le drag & drop natif des images est bloqué
- Seul le système personnalisé de RetroOS est actif

### **Performance :**
- Animations fluides avec transitions CSS
- Gestion optimisée des événements de souris
- Pas d'impact sur les performances du système

### **Responsive :**
- La grille s'adapte automatiquement au redimensionnement de la fenêtre
- Les icônes se repositionnent intelligemment selon l'espace disponible

## Personnalisation

### **Modifier la taille de la grille :**
- Changez la variable `gridSize` dans `setupDesktopGrid()` (actuellement 80px)
- Ajustez la marge avec `margin` (actuellement 20px)

### **Désactiver le snap à la grille :**
- Modifiez `this.snapToGrid = false` dans le constructeur de `WindowManager`

### **Changer l'apparence de l'indicateur de grille :**
- Modifiez les styles CSS de `#grid-indicator` dans `styles.css`

## Dépannage

### **L'icône ne se déplace pas :**
- Vérifiez que vous cliquez bien sur l'icône (pas sur l'image à l'intérieur)
- Assurez-vous que le JavaScript est bien chargé

### **L'icône ne se positionne pas correctement :**
- Vérifiez que la grille est bien initialisée
- Regardez la console pour d'éventuelles erreurs

### **Performance lente :**
- Réduisez le nombre d'icônes sur le bureau
- Vérifiez que les animations CSS sont activées

## Prochaines Étapes

Le système est maintenant prêt pour :
- **Sauvegarde des positions** : Stocker les positions des icônes
- **Thèmes personnalisés** : Différents styles de grille
- **Gestion des dossiers** : Créer des dossiers pour organiser les icônes
- **Raccourcis clavier** : Déplacer les icônes avec le clavier
