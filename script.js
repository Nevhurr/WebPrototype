// ========================================
// RETROOS - SYSTÈME D'EXPLOITATION RÉTRO
// ========================================

import { RetroOS } from './script/core/RetroOS.js';

// Initialiser RetroOS quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    try {
        const retroOS = new RetroOS();
        console.log('RetroOS démarré avec succès');
    } catch (error) {
        console.error('Erreur lors du démarrage de RetroOS:', error);
    }
});
