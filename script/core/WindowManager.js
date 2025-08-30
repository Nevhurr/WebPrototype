export class WindowManager {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.draggedWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.isResizing = false;
        this.resizeHandle = null;
        this.initialSize = { width: 0, height: 0 };
        this.initialPosition = { x: 0, y: 0 };
        this.minWindowSize = { width: 300, height: 200 };
        this.maxWindowSize = { width: window.innerWidth - 100, height: window.innerHeight - 200 };
        
        // Desktop icon management
        this.draggedIcon = null;
        this.isDraggingIcon = false;
        this.iconDragOffset = { x: 0, y: 0 };
        this.originalIconPosition = { x: 0, y: 0 };
        this.snapToGrid = true;
        
        // Mouse event handling
        this.mouseDownPosition = { x: 0, y: 0 };
        this.mouseDownTime = 0;
        this.movementThreshold = 15;
        this.doubleClickDelay = 300;
        this.lastClickTime = 0;
        this.lastClickTarget = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupGlobalShortcuts();
        // Initialiser la grille après un délai pour s'assurer que le DOM est prêt
        setTimeout(() => {
            this.setupDesktopGrid();
        }, 100);
    }
    
    setupEventListeners() {
        document.addEventListener('mousedown', this.handleGlobalMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleGlobalMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleGlobalMouseUp.bind(this));
        document.addEventListener('keydown', this.handleGlobalKeyDown.bind(this));
        window.addEventListener('resize', this.handleWindowResize.bind(this));
    }
    
    setupGlobalShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
            
            if (e.key === 'Escape') {
                const startMenu = document.getElementById('start-menu');
                if (startMenu && !startMenu.classList.contains('hidden')) {
                    startMenu.classList.add('hidden');
                }
            }
            
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.openWindow('game');
                        break;
                    case '2':
                        e.preventDefault();
                        this.openWindow('about');
                        break;
                    case '3':
                        e.preventDefault();
                        this.openWindow('download');
                        break;
                }
            }
        });
    }
    
    handleGlobalMouseDown(e) {
        const target = e.target;
        
        // Window handling
        const windowElement = target.closest('.window');
        if (windowElement) {
            this.focusWindow(windowElement.dataset.app);
            
            if (target.closest('.window-header') && !target.closest('.window-controls')) {
                this.startDrag(e, windowElement);
                return;
            }
            
            const control = target.closest('.window-control');
            if (control) {
                const action = control.dataset.action;
                const appName = windowElement.dataset.app;
                
                switch (action) {
                    case 'minimize':
                        this.minimizeWindow(appName);
                        break;
                    case 'maximize':
                        this.maximizeWindow(appName);
                        break;
                    case 'close':
                        this.closeWindow(appName);
                        break;
                }
                return;
            }
            
            const resizeHandle = target.closest('.resize-handle');
            if (resizeHandle) {
                this.startResize(e, windowElement, resizeHandle.dataset.handle);
                return;
            }
        }
        
        // Desktop icon handling
        const desktopIcon = target.closest('.desktop-icon');
        if (desktopIcon) {
            this.handleDesktopIconMouseDown(e, desktopIcon);
            return;
        }
        
        // Start menu handling
        const startMenuItem = target.closest('.start-menu-item');
        if (startMenuItem && startMenuItem.id !== 'shutdown') {
            const appName = startMenuItem.dataset.app;
            this.openWindow(appName);
            this.closeStartMenu();
            return;
        }
        
        if (target.closest('#start-button')) {
            this.toggleStartMenu();
            return;
        }
        
        if (target.closest('#shutdown')) {
            this.shutdown();
            return;
        }
        
        if (!target.closest('#start-menu') && !target.closest('#start-button')) {
            this.closeStartMenu();
        }
    }
    
    handleGlobalMouseMove(e) {
        if (this.isDragging) {
            this.dragWindow(e);
        } else if (this.isResizing) {
            this.resizeWindow(e);
        } else if (this.draggedIcon) {
            this.handleDesktopIconMouseMove(e);
        }
    }
    
    handleGlobalMouseUp(e) {
        if (this.isDragging) {
            this.stopDrag();
        } else if (this.isResizing) {
            this.stopResize();
        } else if (this.draggedIcon) {
            this.handleDesktopIconMouseUp(e);
        }
    }
    
    handleGlobalKeyDown(e) {
        if (e.ctrlKey && e.key === 'w') {
            e.preventDefault();
            if (this.activeWindow) {
                this.closeWindow(this.activeWindow);
            }
        }
    }
    
    handleWindowResize() {
        this.maxWindowSize = {
            width: window.innerWidth - 100,
            height: window.innerHeight - 200
        };
        
        this.windows.forEach((windowData, appName) => {
            if (windowData.maximized) {
                this.maximizeWindow(appName);
            }
        });
        
        this.setupDesktopGrid();
    }
    
    startDrag(e, windowElement) {
        this.isDragging = true;
        this.draggedWindow = windowElement;
        
        const rect = windowElement.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        windowElement.classList.add('dragging');
        e.preventDefault();
    }
    
    dragWindow(e) {
        if (!this.isDragging || !this.draggedWindow) return;
        
        const newLeft = e.clientX - this.dragOffset.x;
        const newTop = e.clientY - this.dragOffset.y;
        
        const maxLeft = window.innerWidth - this.draggedWindow.offsetWidth;
        const maxTop = window.innerHeight - this.draggedWindow.offsetHeight;
        
        const clampedLeft = Math.max(0, Math.min(newLeft, maxLeft));
        const clampedTop = Math.max(0, Math.min(newTop, maxTop));
        
        this.draggedWindow.style.left = `${clampedLeft}px`;
        this.draggedWindow.style.top = `${clampedTop}px`;
        
        const appName = this.draggedWindow.dataset.app;
        const windowData = this.windows.get(appName);
        if (windowData) {
            windowData.position = { x: clampedLeft, y: clampedTop };
        }
    }
    
    stopDrag() {
        if (this.draggedWindow) {
            this.draggedWindow.classList.remove('dragging');
            this.draggedWindow = null;
        }
        this.isDragging = false;
    }
    
    startResize(e, windowElement, handle) {
        this.isResizing = true;
        this.resizeHandle = handle;
        this.draggedWindow = windowElement;
        
        const rect = windowElement.getBoundingClientRect();
        this.initialSize = {
            width: rect.width,
            height: rect.height
        };
        this.initialPosition = {
            x: rect.left,
            y: rect.top
        };
        
        e.preventDefault();
    }
    
    resizeWindow(e) {
        if (!this.isResizing || !this.draggedWindow) return;
        
        const handle = this.resizeHandle;
        const deltaX = e.clientX - this.initialPosition.x;
        const deltaY = e.clientY - this.initialPosition.y;
        
        let newWidth = this.initialSize.width;
        let newHeight = this.initialSize.height;
        let newLeft = this.initialPosition.x;
        let newTop = this.initialPosition.y;
        
        if (handle.includes('e')) {
            newWidth = Math.max(this.minWindowSize.width, deltaX);
        }
        if (handle.includes('w')) {
            const maxDelta = this.initialSize.width - this.minWindowSize.width;
            const clampedDelta = Math.min(deltaX, maxDelta);
            newWidth = this.initialSize.width - clampedDelta;
            newLeft = this.initialPosition.x + clampedDelta;
        }
        if (handle.includes('s')) {
            newHeight = Math.max(this.minWindowSize.height, deltaY);
        }
        if (handle.includes('n')) {
            const maxDelta = this.initialSize.height - this.minWindowSize.height;
            const clampedDelta = Math.min(deltaY, maxDelta);
            newHeight = this.initialSize.height - clampedDelta;
            newTop = this.initialPosition.y + clampedDelta;
        }
        
        // Limiter la taille maximale
        newWidth = Math.min(newWidth, this.maxWindowSize.width);
        newHeight = Math.min(newHeight, this.maxWindowSize.height);
        
        this.draggedWindow.style.width = `${newWidth}px`;
        this.draggedWindow.style.height = `${newHeight}px`;
        this.draggedWindow.style.left = `${newLeft}px`;
        this.draggedWindow.style.top = `${newTop}px`;
        
        const appName = this.draggedWindow.dataset.app;
        const windowData = this.windows.get(appName);
        if (windowData) {
            windowData.size = { width: newWidth, height: newHeight };
            windowData.position = { x: newLeft, y: newTop };
        }
    }
    
    stopResize() {
        this.isResizing = false;
        this.resizeHandle = null;
        this.draggedWindow = null;
    }
    
    openWindow(appName) {
        const windowElement = document.getElementById(`${appName}-window`);
        if (!windowElement) return;
        
        // Fermer le menu de démarrage si ouvert
        this.closeStartMenu();
        
        // Masquer les autres fenêtres
        this.windows.forEach((windowData, name) => {
            if (name !== appName) {
                const otherWindow = document.getElementById(`${name}-window`);
                if (otherWindow) {
                    otherWindow.classList.add('hidden');
                }
            }
        });
        
        // Afficher la fenêtre
        windowElement.classList.remove('hidden');
        
        // Positionner la fenêtre si pas déjà positionnée
        if (!this.windows.has(appName)) {
            const centerX = (window.innerWidth - windowElement.offsetWidth) / 2;
            const centerY = (window.innerHeight - windowElement.offsetHeight) / 2;
            
            windowElement.style.left = `${centerX}px`;
            windowElement.style.top = `${centerY}px`;
            
            this.windows.set(appName, {
                position: { x: centerX, y: centerY },
                size: { width: windowElement.offsetWidth, height: windowElement.offsetHeight },
                maximized: false
            });
        }
        
        this.focusWindow(appName);
        
        // Ajouter à la barre des tâches
        this.addToTaskbar(appName);
    }
    
    closeWindow(appName) {
        const windowElement = document.getElementById(`${appName}-window`);
        if (windowElement) {
            windowElement.classList.add('hidden');
        }
        
        this.windows.delete(appName);
        
        if (this.activeWindow === appName) {
            this.activeWindow = null;
        }
        
        // Retirer de la barre des tâches
        this.removeFromTaskbar(appName);
    }
    
    minimizeWindow(appName) {
        const windowElement = document.getElementById(`${appName}-window`);
        if (windowElement) {
            windowElement.classList.add('hidden');
        }
    }
    
    maximizeWindow(appName) {
        const windowElement = document.getElementById(`${appName}-window`);
        if (!windowElement) return;
        
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        if (windowData.maximized) {
            // Restaurer
            windowElement.style.left = `${windowData.position.x}px`;
            windowElement.style.top = `${windowData.position.y}px`;
            windowElement.style.width = `${windowData.size.width}px`;
            windowElement.style.height = `${windowData.size.height}px`;
            windowData.maximized = false;
        } else {
            // Maximiser
            windowElement.style.left = '0px';
            windowElement.style.top = '0px';
            windowElement.style.width = `${window.innerWidth}px`;
            windowElement.style.height = `${window.innerHeight - 40}px`;
            windowData.maximized = true;
        }
    }
    
    focusWindow(appName) {
        this.activeWindow = appName;
        
        // Mettre à jour le z-index des fenêtres
        this.windows.forEach((windowData, name) => {
            const windowElement = document.getElementById(`${name}-window`);
            if (windowElement) {
                if (name === appName) {
                    windowElement.style.zIndex = '10002';
                } else {
                    windowElement.style.zIndex = '10000';
                }
            }
        });
    }
    
    cycleWindows() {
        const windowNames = Array.from(this.windows.keys());
        if (windowNames.length === 0) return;
        
        const currentIndex = windowNames.indexOf(this.activeWindow);
        const nextIndex = (currentIndex + 1) % windowNames.length;
        const nextWindow = windowNames[nextIndex];
        
        this.focusWindow(nextWindow);
    }
    
    addToTaskbar(appName) {
        const runningApps = document.getElementById('running-apps');
        if (!runningApps) return;
        
        // Vérifier si l'app est déjà dans la barre des tâches
        const existingApp = runningApps.querySelector(`[data-app="${appName}"]`);
        if (existingApp) return;
        
        const appElement = document.createElement('div');
        appElement.className = 'running-app';
        appElement.dataset.app = appName;
        appElement.innerHTML = `
            <div class="app-icon">🎮</div>
            <div class="app-name">${this.getAppName(appName)}</div>
        `;
        
        appElement.addEventListener('click', () => {
            this.openWindow(appName);
        });
        
        runningApps.appendChild(appElement);
    }
    
    removeFromTaskbar(appName) {
        const runningApps = document.getElementById('running-apps');
        if (!runningApps) return;
        
        const appElement = runningApps.querySelector(`[data-app="${appName}"]`);
        if (appElement) {
            appElement.remove();
        }
    }
    
    getAppName(appName) {
        const appNames = {
            'game': 'Jeu Rétro',
            'about': 'À propos',
            'download': 'Télécharger'
        };
        return appNames[appName] || appName;
    }
    
    setupDesktopGrid() {
        const desktop = document.getElementById('desktop');
        if (!desktop) {
            console.error('Desktop element not found');
            return;
        }
        
        const gridSize = 80;
        const margin = 20;
        const columns = Math.floor((window.innerWidth - 100) / (gridSize + margin));
        const rows = Math.floor((window.innerHeight - 200) / (gridSize + margin));
        
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        console.log(`Found ${desktopIcons.length} desktop icons`);
        
        desktopIcons.forEach((icon, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            
            const x = 50 + col * (gridSize + margin);
            const y = 50 + row * (gridSize + margin);
            
            icon.style.left = `${x}px`;
            icon.style.top = `${y}px`;
            icon.style.position = 'absolute';
            icon.dataset.gridX = col;
            icon.dataset.gridY = row;
            
            console.log(`Positioned icon ${index} at (${x}, ${y})`);
        });
        
        desktop.style.position = 'relative';
        desktop.dataset.gridColumns = columns;
        desktop.dataset.gridRows = rows;
        desktop.dataset.gridSize = gridSize;
        desktop.dataset.gridMargin = margin;
        
        console.log(`Desktop grid: ${columns}x${rows}, size: ${gridSize}, margin: ${margin}`);
    }
    
    handleDesktopIconMouseDown(e, desktopIcon) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastClickTime < this.doubleClickDelay && 
            this.lastClickTarget === desktopIcon) {
            // Double clic détecté
            const appName = desktopIcon.dataset.app;
            if (appName) {
                this.openWindow(appName);
            }
            return;
        }
        
        this.lastClickTime = currentTime;
        this.lastClickTarget = desktopIcon;
        
        // Commencer le drag
        this.draggedIcon = desktopIcon;
        this.isDraggingIcon = false;
        
        const rect = desktopIcon.getBoundingClientRect();
        this.iconDragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        this.originalIconPosition = {
            x: rect.left,
            y: rect.top
        };
        
        // Délai pour distinguer clic et drag
        setTimeout(() => {
            if (this.draggedIcon && !this.isDraggingIcon) {
                this.startIconDrag();
            }
        }, 200);
    }
    
    startIconDrag() {
        if (this.isDraggingIcon || !this.draggedIcon) return;
        
        this.isDraggingIcon = true;
        this.draggedIcon.classList.add('dragging-icon');
        document.body.style.userSelect = 'none';
    }
    
    handleDesktopIconMouseMove(e) {
        if (!this.isDraggingIcon || !this.draggedIcon) return;
        
        const newLeft = e.clientX - this.iconDragOffset.x;
        const newTop = e.clientY - this.iconDragOffset.y;
        
        this.draggedIcon.style.left = `${newLeft}px`;
        this.draggedIcon.style.top = `${newTop}px`;
        
        if (this.snapToGrid) {
            this.showGridIndicator(e.clientX, e.clientY);
        }
    }
    
    handleDesktopIconMouseUp(e) {
        if (!this.draggedIcon || !this.isDraggingIcon) return;
        
        this.draggedIcon.classList.remove('dragging-icon');
        document.body.style.userSelect = '';
        
        if (this.snapToGrid) {
            this.snapIconToGrid();
        }
        
        this.draggedIcon = null;
        this.isDraggingIcon = false;
        this.hideGridIndicator();
    }
    
    snapIconToGrid() {
        if (!this.draggedIcon) return;
        
        const desktop = document.getElementById('desktop');
        if (!desktop) return;
        
        const gridSize = parseInt(desktop.dataset.gridSize) || 80;
        const margin = parseInt(desktop.dataset.gridMargin) || 20;
        const columns = parseInt(desktop.dataset.gridColumns) || 8;
        
        const rect = this.draggedIcon.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const gridX = Math.round((centerX - 50) / (gridSize + margin));
        const gridY = Math.round((centerY - 50) / (gridSize + margin));
        
        const clampedGridX = Math.max(0, Math.min(gridX, columns - 1));
        const clampedGridY = Math.max(0, Math.min(gridY, 10)); // Limite arbitraire
        
        const finalX = 50 + clampedGridX * (gridSize + margin);
        const finalY = 50 + clampedGridY * (gridSize + margin);
        
        this.draggedIcon.style.left = `${finalX}px`;
        this.draggedIcon.style.top = `${finalY}px`;
        
        this.draggedIcon.dataset.gridX = clampedGridX;
        this.draggedIcon.dataset.gridY = clampedGridY;
    }
    
    showGridIndicator(x, y) {
        // Implémentation optionnelle pour afficher une grille de guidage
    }
    
    hideGridIndicator() {
        // Implémentation optionnelle pour masquer la grille de guidage
    }
    
    toggleStartMenu() {
        const startMenu = document.getElementById('start-menu');
        const startButton = document.getElementById('start-button');
        
        if (startMenu && startButton) {
            // Obtenir la position du bouton Démarrer
            const buttonRect = startButton.getBoundingClientRect();
            
            // Positionner le menu par rapport au bouton
            startMenu.style.position = 'fixed';
            startMenu.style.left = `${buttonRect.left}px`;
            startMenu.style.bottom = '40px';
            startMenu.style.top = 'auto';
            
            // Vérifier si le menu dépasse à droite et ajuster si nécessaire
            const menuWidth = parseInt(getComputedStyle(startMenu).width);
            if (buttonRect.left + menuWidth > window.innerWidth) {
                startMenu.style.left = `${window.innerWidth - menuWidth - 10}px`;
            }
            
            const isHidden = startMenu.classList.contains('hidden');
            if (isHidden) {
                startMenu.classList.remove('hidden');
                startMenu.style.visibility = 'visible';
                startMenu.style.pointerEvents = 'auto';
                startMenu.style.zIndex = '10001';
            } else {
                startMenu.classList.add('hidden');
                startMenu.style.visibility = 'hidden';
                startMenu.style.pointerEvents = 'none';
                startMenu.style.zIndex = '-1';
            }
        }
    }
    
    closeStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.classList.add('hidden');
            startMenu.style.visibility = 'hidden';
            startMenu.style.pointerEvents = 'none';
            startMenu.style.zIndex = '-1';
        }
    }
    
    shutdown() {
        if (confirm('Voulez-vous vraiment arrêter RetroOS ?')) {
            this.windows.forEach((windowData, appName) => {
                this.closeWindow(appName);
            });
            
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
