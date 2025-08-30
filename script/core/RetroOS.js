import { BootSequence } from './BootSequence.js';
import { WindowManager } from './WindowManager.js';
import { Clock } from '../utils/Clock.js';
import { Cursor } from '../ui/Cursor.js';
import { RippleEffect } from '../effects/RippleEffect.js';
import { EventHandlers } from '../utils/EventHandlers.js';

export class RetroOS {
    constructor() {
        this.startMenuOpen = false;
        this.windowManager = null;
        this.bootSequence = null;
        this.clock = null;
        this.cursor = null;
        this.rippleEffect = null;
        this.eventHandlers = null;
        
        this.init();
    }
    
    init() {
        this.showLoadingScreen();
    }
    
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        const wallpaper = document.getElementById('wallpaper');
        const desktop = document.getElementById('desktop');
        const taskbar = document.getElementById('taskbar');
        const startMenu = document.getElementById('start-menu');
        const windowsContainer = document.getElementById('windows-container');
        
        // Démarrer l'animation de boot
        this.bootSequence = new BootSequence();
        this.bootSequence.start();
        
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                setTimeout(() => {
                    wallpaper.classList.add('fade-in');
                }, 100);
                
                setTimeout(() => {
                    desktop.classList.add('fade-in');
                }, 300);
                
                setTimeout(() => {
                    taskbar.classList.add('fade-in');
                }, 500);
                
                setTimeout(() => {
                    startMenu.classList.add('fade-in');
                }, 700);
                
                setTimeout(() => {
                    windowsContainer.classList.add('fade-in');
                }, 900);
                
                setTimeout(() => {
                    this.initializeRetroOS();
                }, 1500);
                
            }, 500);
            
        }, 5000); // Boot de 5 secondes
    }
    
    initializeRetroOS() {
        this.setupCustomCursor();
        this.setupRippleEffect();
        this.updateClock();
        this.startClock();
        this.initializeWindowManager();
        this.setupEventListeners();
        this.initializeDesktop();
        
        console.log('RetroOS initialisé');
    }
    
    initializeWindowManager() {
        try {
            this.windowManager = new WindowManager();
            console.log('WindowManager initialisé dans RetroOS');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du WindowManager:', error);
        }
    }
    
    initializeDesktop() {
        try {
            if (this.windowManager) {
                this.windowManager.setupDesktopGrid();
                console.log('Grille du bureau initialisée');
                
                // Vérification supplémentaire des icônes
                const desktopIcons = document.querySelectorAll('.desktop-icon');
                console.log(`Vérification: ${desktopIcons.length} icônes trouvées`);
                desktopIcons.forEach((icon, index) => {
                    const rect = icon.getBoundingClientRect();
                    console.log(`Icône ${index}: position (${rect.left}, ${rect.top}), taille (${rect.width}, ${rect.height})`);
                    console.log(`Icône ${index}: styles CSS - left: ${icon.style.left}, top: ${icon.style.top}, position: ${icon.style.position}`);
                });
            }
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du bureau:', error);
        }
    }
    
    setupCustomCursor() {
        try {
            this.cursor = new Cursor();
            console.log('Curseur personnalisé initialisé');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du curseur:', error);
        }
    }
    
    setupRippleEffect() {
        try {
            this.rippleEffect = new RippleEffect();
            console.log('Effet de ripple initialisé');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'effet de ripple:', error);
        }
    }
    
    updateClock() {
        try {
            this.clock = new Clock();
            this.clock.updateClock();
            console.log('Horloge initialisée');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation de l\'horloge:', error);
        }
    }
    
    startClock() {
        try {
            if (this.clock) {
                this.clock.startClock();
                console.log('Horloge démarrée');
            }
        } catch (error) {
            console.error('Erreur lors du démarrage de l\'horloge:', error);
        }
    }
    
    setupEventListeners() {
        try {
            this.eventHandlers = new EventHandlers();
            console.log('Gestionnaires d\'événements initialisés');
        } catch (error) {
            console.error('Erreur lors de l\'initialisation des gestionnaires d\'événements:', error);
        }
    }
}
