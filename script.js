// ========================================
// RETROOS - SYSTÈME D'EXPLOITATION RÉTRO
// ========================================

class WindowManager {
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
                this.startResize(e, windowElement, resizeHandle);
                return;
            }
        }
        
        // Desktop icon handling
        const desktopIcon = target.closest('.desktop-icon');
        if (desktopIcon) {
            console.log('Desktop icon clicked:', desktopIcon.dataset.app);
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
    
    startResize(e, windowElement, resizeHandle) {
        this.isResizing = true;
        this.resizeHandle = resizeHandle;
        
        const rect = windowElement.getBoundingClientRect();
        this.initialSize = { width: rect.width, height: rect.height };
        this.initialPosition = { x: rect.left, y: rect.top };
        
        windowElement.classList.add('resizing');
        e.preventDefault();
    }
    
    resizeWindow(e) {
        if (!this.isResizing || !this.resizeHandle) return;
        
        const handle = this.resizeHandle.dataset.handle;
        const deltaX = e.clientX - this.initialPosition.x;
        const deltaY = e.clientY - this.initialPosition.y;
        
        let newWidth = this.initialSize.width;
        let newHeight = this.initialSize.height;
        let newLeft = this.initialPosition.x;
        let newTop = this.initialPosition.y;
        
        switch (handle) {
            case 'se':
                newWidth = Math.max(this.minWindowSize.width, 
                    Math.min(this.maxWindowSize.width, this.initialSize.width + deltaX));
                newHeight = Math.max(this.minWindowSize.height, 
                    Math.min(this.maxWindowSize.height, this.initialSize.height + deltaY));
                break;
            case 'sw':
                newWidth = Math.max(this.minWindowSize.width, 
                    Math.min(this.maxWindowSize.width, this.initialSize.width - deltaX));
                newHeight = Math.max(this.minWindowSize.height, 
                    Math.min(this.maxWindowSize.height, this.initialSize.height + deltaY));
                newLeft = this.initialPosition.x + (this.initialSize.width - newWidth);
                break;
            case 'ne':
                newWidth = Math.max(this.minWindowSize.width, 
                    Math.min(this.maxWindowSize.width, this.initialSize.width + deltaX));
                newHeight = Math.max(this.minWindowSize.height, 
                    Math.min(this.maxWindowSize.height, this.initialSize.height - deltaY));
                newTop = this.initialPosition.y + (this.initialSize.height - newHeight);
                break;
            case 'nw':
                newWidth = Math.max(this.minWindowSize.width, 
                    Math.min(this.maxWindowSize.width, this.initialSize.width - deltaX));
                newHeight = Math.max(this.minWindowSize.height, 
                    Math.min(this.maxWindowSize.height, this.initialSize.height - deltaY));
                newLeft = this.initialPosition.x + (this.initialSize.width - newWidth);
                newTop = this.initialPosition.y + (this.initialSize.height - newHeight);
                break;
        }
        
        const windowElement = this.resizeHandle.closest('.window');
        windowElement.style.width = `${newWidth}px`;
        windowElement.style.height = `${newHeight}px`;
        windowElement.style.left = `${newLeft}px`;
        windowElement.style.top = `${newTop}px`;
    }
    
    stopResize() {
        if (this.resizeHandle) {
            this.resizeHandle.closest('.window').classList.remove('resizing');
            this.resizeHandle = null;
        }
        this.isResizing = false;
    }
    
    openWindow(appName) {
        const windowId = `${appName}-window`;
        const windowElement = document.getElementById(windowId);
        
        if (!windowElement) {
            console.error(`Fenêtre ${appName} non trouvée`);
            return;
        }
        
        if (this.windows.has(appName)) {
            this.focusWindow(appName);
            return;
        }
        
        const windowData = {
            element: windowElement,
            minimized: false,
            maximized: false,
            position: this.getDefaultPosition(appName),
            size: this.getDefaultSize(appName),
            zIndex: this.getNextZIndex()
        };
        
        this.positionWindow(appName, windowData);
        
        windowElement.classList.remove('hidden');
        windowElement.style.display = 'block';
        windowElement.style.visibility = 'visible';
        windowElement.style.opacity = '1';
        windowElement.style.position = 'fixed';
        windowElement.style.zIndex = '10000';
        
        this.windows.set(appName, windowData);
        this.focusWindow(appName);
        this.addToTaskbar(appName);
    }
    
    closeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        windowData.element.classList.add('hidden');
        this.removeFromTaskbar(appName);
        this.windows.delete(appName);
        
        if (this.activeWindow === appName) {
            this.activeWindow = null;
            const remainingWindows = Array.from(this.windows.keys());
            if (remainingWindows.length > 0) {
                this.focusWindow(remainingWindows[0]);
            }
        }
    }
    
    minimizeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        windowData.element.classList.add('hidden');
        windowData.minimized = true;
        
        if (this.activeWindow === appName) {
            this.activeWindow = null;
            const remainingWindows = Array.from(this.windows.keys()).filter(name => 
                !this.windows.get(name).minimized
            );
            if (remainingWindows.length > 0) {
                this.focusWindow(remainingWindows[0]);
            }
        }
    }
    
    restoreWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData || !windowData.minimized) return;
        
        windowData.element.classList.remove('hidden');
        windowData.minimized = false;
        this.focusWindow(appName);
    }
    
    maximizeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        const windowElement = windowData.element;
        
        if (windowData.maximized) {
            windowElement.style.width = `${windowData.size.width}px`;
            windowElement.style.height = `${windowData.size.height}px`;
            windowElement.style.left = `${windowData.position.x}px`;
            windowElement.style.top = `${windowData.position.y}px`;
            windowData.maximized = false;
        } else {
            windowData.size = {
                width: windowElement.offsetWidth,
                height: windowElement.offsetHeight
            };
            windowData.position = {
                x: windowElement.offsetLeft,
                y: windowElement.offsetTop
            };
            
            if (appName === 'game') {
                // Pour le jeu, couvrir presque tout l'écran
                windowElement.style.width = '95vw';
                windowElement.style.height = '90vh';
                windowElement.style.left = '2.5vw';
                windowElement.style.top = '5vh';
            } else {
                // Pour les autres fenêtres, comportement normal
                windowElement.style.width = '90vw';
                windowElement.style.height = '80vh';
                windowElement.style.left = '5vw';
                windowElement.style.top = '10vh';
            }
            windowData.maximized = true;
        }
    }
    
    focusWindow(appName) {
        const windowData = this.windows.get(appName);
        if (!windowData) return;
        
        this.windows.forEach((data, name) => {
            data.element.style.zIndex = '10000';
        });
        
        windowData.element.style.zIndex = '10001';
        this.activeWindow = appName;
        
        this.updateTaskbarFocus(appName);
        
        if (windowData.minimized) {
            windowData.element.classList.remove('hidden');
            windowData.minimized = false;
        }
    }
    
    positionWindow(appName, windowData) {
        const { position, size } = windowData;
        const windowElement = windowData.element;
        
        windowElement.style.position = 'fixed';
        windowElement.style.left = `${position.x}px`;
        windowElement.style.top = `${position.y}px`;
        windowElement.style.width = `${size.width}px`;
        windowElement.style.height = `${size.height}px`;
        windowElement.style.display = 'block';
        windowElement.style.visibility = 'visible';
        windowElement.style.opacity = '1';
        windowElement.style.zIndex = '10000';
    }
    
    getDefaultPosition(appName) {
        const size = this.getDefaultSize(appName);
        
        if (appName === 'game') {
            // Pour le jeu, centrer parfaitement avec un petit offset
            const centerX = (window.innerWidth - size.width) / 2;
            const centerY = (window.innerHeight - size.height) / 2;
            return { x: centerX, y: centerY };
        } else {
            // Pour les autres fenêtres, comportement normal avec offset aléatoire
            const centerX = (window.innerWidth - size.width) / 2;
            const centerY = (window.innerHeight - size.height) / 2;
            
            const offsetX = (Math.random() - 0.5) * 100;
            const offsetY = (Math.random() - 0.5) * 100;
            
            const finalX = Math.max(50, Math.min(window.innerWidth - size.width - 50, centerX + offsetX));
            const finalY = Math.max(50, Math.min(window.innerHeight - size.height - 50, centerY + offsetY));
            
            return { x: finalX, y: finalY };
        }
    }
    
    getDefaultSize(appName) {
        const sizes = {
            game: { width: window.innerWidth - 100, height: window.innerHeight - 150 },
            about: { width: 500, height: 400 },
            download: { width: 550, height: 450 }
        };
        
        return sizes[appName] || { width: 500, height: 400 };
    }
    
    getNextZIndex() {
        let maxZ = 100;
        this.windows.forEach(windowData => {
            if (windowData.zIndex > maxZ) {
                maxZ = windowData.zIndex;
            }
        });
        return maxZ + 1;
    }
    
    addToTaskbar(appName) {
        const runningApps = document.getElementById('running-apps');
        const existingApp = runningApps.querySelector(`[data-app="${appName}"]`);
        
        if (!existingApp) {
            const appElement = document.createElement('div');
            appElement.className = 'running-app';
            appElement.dataset.app = appName;
            appElement.textContent = this.getAppDisplayName(appName);
            
            appElement.addEventListener('click', () => {
                this.restoreWindow(appName);
            });
            
            runningApps.appendChild(appElement);
        }
    }
    
    removeFromTaskbar(appName) {
        const runningApps = document.getElementById('running-apps');
        const appElement = runningApps.querySelector(`[data-app="${appName}"]`);
        if (appElement) {
            appElement.remove();
        }
    }
    
    updateTaskbarFocus(appName) {
        document.querySelectorAll('.running-app').forEach(app => {
            app.classList.remove('active');
        });
        
        const activeApp = document.querySelector(`.running-app[data-app="${appName}"]`);
        if (activeApp) {
            activeApp.classList.add('active');
        }
    }
    
    getAppDisplayName(appName) {
        const names = {
            game: '🎮 Jeu Rétro',
            about: 'ℹ️ À propos',
            download: '📥 Télécharger'
        };
        return names[appName] || appName;
    }
    
    // Desktop icon management
    handleDesktopIconMouseDown(e, desktopIcon) {
        const appName = desktopIcon.dataset.app;
        console.log(`MouseDown on desktop icon: ${appName}`);
        
        this.mouseDownPosition = { x: e.clientX, y: e.clientY };
        this.mouseDownTime = Date.now();
        this.draggedIcon = desktopIcon;
        
        const rect = desktopIcon.getBoundingClientRect();
        this.originalIconPosition = {
            x: parseInt(desktopIcon.style.left) || rect.left,
            y: parseInt(desktopIcon.style.top) || rect.top,
            gridX: parseInt(desktopIcon.dataset.gridX) || 0,
            gridY: parseInt(desktopIcon.dataset.gridY) || 0
        };
        
        this.iconDragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        console.log(`Icon position: (${this.originalIconPosition.x}, ${this.originalIconPosition.y})`);
    }
    
    handleDesktopIconMouseMove(e) {
        if (!this.draggedIcon) return;
        
        const deltaX = Math.abs(e.clientX - this.mouseDownPosition.x);
        const deltaY = Math.abs(e.clientY - this.mouseDownPosition.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > this.movementThreshold && !this.isDraggingIcon) {
            this.startIconDrag();
        }
        
        if (this.isDraggingIcon) {
            this.dragIcon(e);
        }
    }
    
    handleDesktopIconMouseUp(e) {
        if (!this.draggedIcon) return;
        
        const appName = this.draggedIcon.dataset.app;
        const currentTime = Date.now();
        const timeDiff = currentTime - this.mouseDownTime;
        
        const deltaX = Math.abs(e.clientX - this.mouseDownPosition.x);
        const deltaY = Math.abs(e.clientY - this.mouseDownPosition.y);
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (this.isDraggingIcon) {
            this.stopIconDrag();
        } else if (distance <= this.movementThreshold) {
            this.handleIconClick(this.draggedIcon, currentTime);
        }
        
        this.draggedIcon = null;
    }
    
    handleIconClick(desktopIcon, currentTime) {
        const appName = desktopIcon.dataset.app;
        
        if (this.lastClickTarget === desktopIcon && 
            (currentTime - this.lastClickTime) < this.doubleClickDelay) {
            
            this.openWindow(appName);
            this.lastClickTime = 0;
            this.lastClickTarget = null;
        } else {
            this.lastClickTime = currentTime;
            this.lastClickTarget = desktopIcon;
        }
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
    
    startIconDrag() {
        if (this.isDraggingIcon || !this.draggedIcon) return;
        
        this.isDraggingIcon = true;
        this.draggedIcon.classList.add('dragging-icon');
        document.body.style.userSelect = 'none';
    }
    
    dragIcon(e) {
        if (!this.isDraggingIcon || !this.draggedIcon) return;
        
        const newLeft = e.clientX - this.iconDragOffset.x;
        const newTop = e.clientY - this.iconDragOffset.y;
        
        this.draggedIcon.style.left = `${newLeft}px`;
        this.draggedIcon.style.top = `${newTop}px`;
        
        if (this.snapToGrid) {
            this.showGridIndicator(e.clientX, e.clientY);
        }
    }
    
    stopIconDrag() {
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
        const clampedGridY = Math.max(0, gridY);
        
        const isOccupied = Array.from(document.querySelectorAll('.desktop-icon')).some(icon => 
            icon !== this.draggedIcon && 
            parseInt(icon.dataset.gridX) === clampedGridX && 
            parseInt(icon.dataset.gridY) === clampedGridY
        );
        
        if (isOccupied) {
            const nearestPosition = this.findNearestFreePosition(clampedGridX, clampedGridY);
            this.finalizeIconPosition(nearestPosition.x, nearestPosition.y, nearestPosition.gridX, nearestPosition.gridY);
        } else {
            const finalX = 50 + clampedGridX * (gridSize + margin);
            const finalY = 50 + clampedGridY * (gridSize + margin);
            this.finalizeIconPosition(finalX, finalY, clampedGridX, clampedGridY);
        }
    }
    
    findNearestFreePosition(targetGridX, targetGridY) {
        const desktop = document.getElementById('desktop');
        if (!desktop) return { x: 50, y: 50, gridX: 0, gridY: 0 };
        
        const gridSize = parseInt(desktop.dataset.gridSize) || 80;
        const margin = parseInt(desktop.dataset.gridMargin) || 20;
        const columns = parseInt(desktop.dataset.gridColumns) || 8;
        
        let searchRadius = 1;
        const maxSearchRadius = Math.max(columns, 10);
        
        while (searchRadius <= maxSearchRadius) {
            for (let dy = -searchRadius; dy <= searchRadius; dy++) {
                for (let dx = -searchRadius; dx <= searchRadius; dx++) {
                    if (Math.abs(dx) === searchRadius || Math.abs(dy) === searchRadius) {
                        const testGridX = targetGridX + dx;
                        const testGridY = targetGridY + dy;
                        
                        if (testGridX >= 0 && testGridX < columns && testGridY >= 0) {
                            const isOccupied = Array.from(document.querySelectorAll('.desktop-icon')).some(icon => 
                                icon !== this.draggedIcon && 
                                parseInt(icon.dataset.gridX) === testGridX && 
                                parseInt(icon.dataset.gridY) === testGridY
                            );
                            
                            if (!isOccupied) {
                                const finalX = 50 + testGridX * (gridSize + margin);
                                const finalY = 50 + testGridY * (gridSize + margin);
                                return { x: finalX, y: finalY, gridX: testGridX, gridY: testGridY };
                            }
                        }
                    }
                }
            }
            searchRadius++;
        }
        
        const newGridY = targetGridY + 1;
        const finalX = 50;
        const finalY = 50 + newGridY * (gridSize + margin);
        return { x: finalX, y: finalY, gridX: 0, gridY: newGridY };
    }
    
    finalizeIconPosition(x, y, gridX, gridY) {
        if (!this.draggedIcon) return;
        
        this.draggedIcon.style.transition = 'all 0.2s ease-out';
        this.draggedIcon.style.left = `${x}px`;
        this.draggedIcon.style.top = `${y}px`;
        
        this.draggedIcon.dataset.gridX = gridX;
        this.draggedIcon.dataset.gridY = gridY;
        
        setTimeout(() => {
            if (this.draggedIcon) {
                this.draggedIcon.style.transition = '';
            }
        }, 200);
    }
    
    showGridIndicator(x, y) {
        let gridIndicator = document.getElementById('grid-indicator');
        if (!gridIndicator) {
            gridIndicator = document.createElement('div');
            gridIndicator.id = 'grid-indicator';
            gridIndicator.style.cssText = `
                position: fixed;
                width: 80px;
                height: 80px;
                border: 2px dashed var(--primary-color);
                background: rgba(255, 68, 68, 0.1);
                pointer-events: none;
                z-index: 9999;
                border-radius: 5px;
                transition: all 0.1s ease;
            `;
            document.body.appendChild(gridIndicator);
        }
        
        const desktop = document.getElementById('desktop');
        if (desktop) {
            const gridSize = parseInt(desktop.dataset.gridSize) || 80;
            const margin = parseInt(desktop.dataset.gridMargin) || 20;
            
            const gridX = Math.round((x - 50) / (gridSize + margin));
            const gridY = Math.round((y - 50) / (gridSize + margin));
            
            const indicatorX = 50 + gridX * (gridSize + margin);
            const indicatorY = 50 + gridY * (gridSize + margin);
            
            gridIndicator.style.left = `${indicatorX}px`;
            gridIndicator.style.top = `${indicatorY}px`;
            gridIndicator.style.display = 'block';
        }
    }
    
    hideGridIndicator() {
        const gridIndicator = document.getElementById('grid-indicator');
        if (gridIndicator) {
            gridIndicator.style.display = 'none';
        }
    }
    
    cycleWindows() {
        const windowNames = Array.from(this.windows.keys()).filter(name => 
            !this.windows.get(name).minimized
        );
        
        if (windowNames.length > 1) {
            const currentIndex = windowNames.indexOf(this.activeWindow);
            const nextIndex = (currentIndex + 1) % windowNames.length;
            this.focusWindow(windowNames[nextIndex]);
        }
    }
    
    toggleStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.classList.toggle('hidden');
        }
    }
    
    closeStartMenu() {
        const startMenu = document.getElementById('start-menu');
        if (startMenu) {
            startMenu.classList.add('hidden');
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

class RetroOS {
    constructor() {
        this.startMenuOpen = false;
        this.clockInterval = null;
        this.activeRipples = 0;
        this.maxRipples = 6;
        this.windowManager = null;
        
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
                }, 1000);
                
            }, 500);
            
        }, 2500);
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
            setTimeout(() => {
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
            }, 200);
        } catch (error) {
            console.error('Erreur lors de l\'initialisation du bureau:', error);
        }
    }
    
    setupCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = (e.clientX - 1) + 'px';
            cursor.style.top = (e.clientY - 1) + 'px';
        });
        
        const interactiveElements = document.querySelectorAll('button, .desktop-icon, .start-menu-item, .running-app, .window-header, .window-control, .start-button');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
        
        document.body.style.cursor = 'none';
        document.querySelectorAll('*').forEach(element => {
            element.style.cursor = 'none';
        });
    }
    
    setupEventListeners() {
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        document.addEventListener('dragstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        document.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        const dateString = now.toLocaleDateString('fr-FR', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        });
        
        const clockElement = document.getElementById('clock');
        const dateElement = document.getElementById('date');
        
        if (clockElement) clockElement.textContent = timeString;
        if (dateElement) dateElement.textContent = dateString;
    }
    
    startClock() {
        this.clockInterval = setInterval(() => {
            this.updateClock();
        }, 1000);
    }
    
    setupRippleEffect() {
        document.addEventListener('click', (e) => {
            const wallpaper = document.getElementById('wallpaper');
            if (!wallpaper) return;
            this.createRipple(e, wallpaper);
        });
        
        document.addEventListener('mousedown', (e) => {
            const wallpaper = document.getElementById('wallpaper');
            if (!wallpaper) return;
            this.createRipple(e, wallpaper);
        });
    }
    
    createRipple(event, target) {
        if (this.activeRipples >= this.maxRipples) return;
        
        try {
            const rippleCount = Math.min(
                Math.floor(Math.random() * 2) + 1,
                this.maxRipples - this.activeRipples
            );
            
            for (let i = 0; i < rippleCount; i++) {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                
                const wireframeDistortion = document.createElement('div');
                wireframeDistortion.className = 'wireframe-distortion';
                
                const rect = target.getBoundingClientRect();
                const size = Math.min(rect.width, rect.height) * 0.3;
                
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 10;
                const x = event.clientX - rect.left + offsetX;
                const y = event.clientY - rect.top + offsetY;
                
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
                ripple.style.marginLeft = -size / 2 + 'px';
                ripple.style.marginTop = -size / 2 + 'px';
                
                const distortionSize = size * 3;
                wireframeDistortion.style.left = (x - distortionSize / 2) + 'px';
                wireframeDistortion.style.top = (y - distortionSize / 2) + 'px';
                wireframeDistortion.style.width = distortionSize + 'px';
                wireframeDistortion.style.height = distortionSize + 'px';
                
                target.appendChild(wireframeDistortion);
                target.appendChild(ripple);
                this.activeRipples++;
                
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                    if (wireframeDistortion.parentNode) {
                        wireframeDistortion.parentNode.removeChild(wireframeDistortion);
                    }
                    this.activeRipples--;
                }, 600 + (i * 50));
            }
        } catch (error) {
            console.error('Erreur lors de la création du ripple:', error);
        }
    }
}

// Global event handlers
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
});

// Initialize RetroOS
document.addEventListener('DOMContentLoaded', () => {
    window.retroOS = new RetroOS();
});

// Game button handlers
document.addEventListener('DOMContentLoaded', function() {
    const playButton = document.querySelector('.play-button');
    const downloadButton = document.querySelector('.download-button');
    
    if (playButton) {
        playButton.addEventListener('click', function() {
            showRetroMessage('🎮 Lancement du jeu...');
        });
    }
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            showRetroMessage('📥 Téléchargement en cours...');
        });
    }
    
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showRetroMessage('📥 Téléchargement en cours...');
        });
    });
});

// Retro message display function
function showRetroMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.textContent = message;
    messageElement.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--bg-dark);
        color: var(--primary-color);
        border: 2px solid var(--primary-color);
        padding: 20px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 0 20px var(--shadow-color);
        border-radius: 5px;
    `;
    
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 2000);
}
