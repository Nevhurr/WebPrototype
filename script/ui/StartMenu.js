export class StartMenu {
    constructor() {
        this.startMenu = null;
        this.startButton = null;
        this.init();
    }

    init() {
        this.startMenu = document.getElementById('start-menu');
        this.startButton = document.getElementById('start-button');
    }

    toggleStartMenu() {
        if (!this.startMenu || !this.startButton) return;
        
        // Obtenir la position du bouton Démarrer
        const buttonRect = this.startButton.getBoundingClientRect();
        
        // Positionner le menu par rapport au bouton
        this.startMenu.style.position = 'fixed';
        this.startMenu.style.left = `${buttonRect.left}px`;
        this.startMenu.style.bottom = '40px';
        this.startMenu.style.top = 'auto';
        
        // Vérifier si le menu dépasse à droite et ajuster si nécessaire
        const menuWidth = parseInt(getComputedStyle(this.startMenu).width);
        if (buttonRect.left + menuWidth > window.innerWidth) {
            this.startMenu.style.left = `${window.innerWidth - menuWidth - 10}px`;
        }
        
        const isHidden = this.startMenu.classList.contains('hidden');
        if (isHidden) {
            this.startMenu.classList.remove('hidden');
            this.startMenu.style.visibility = 'visible';
            this.startMenu.style.pointerEvents = 'auto';
            this.startMenu.style.zIndex = '10001';
        } else {
            this.startMenu.classList.add('hidden');
            this.startMenu.style.visibility = 'hidden';
            this.startMenu.style.pointerEvents = 'none';
            this.startMenu.style.zIndex = '-1';
        }
    }

    closeStartMenu() {
        if (!this.startMenu) return;
        
        this.startMenu.classList.add('hidden');
        this.startMenu.style.visibility = 'hidden';
        this.startMenu.style.pointerEvents = 'none';
        this.startMenu.style.zIndex = '-1';
    }

    isStartMenuOpen() {
        return this.startMenu && !this.startMenu.classList.contains('hidden');
    }

    shutdown() {
        if (confirm('Voulez-vous vraiment arrêter RetroOS ?')) {
            const shutdownMessage = document.createElement('div');
            shutdownMessage.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: var(--bg-dark);
                color: var(--primary-color);
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                font-family: 'Courier New', monospace;
                font-size: 24px;
            `;
            shutdownMessage.innerHTML = `
                <div>🔄 Arrêt de RetroOS...</div>
                <div style="margin-top: 20px; font-size: 16px; color: var(--text-secondary);">
                    Merci d'avoir utilisé notre système rétro !
                </div>
            `;
            
            document.body.appendChild(shutdownMessage);
            
            setTimeout(() => {
                shutdownMessage.remove();
                this.closeStartMenu();
            }, 3000);
        }
    }
}
