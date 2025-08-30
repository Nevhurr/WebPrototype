export class Desktop {
    constructor() {
        this.draggedIcon = null;
        this.isDraggingIcon = false;
        this.iconDragOffset = { x: 0, y: 0 };
        this.originalIconPosition = { x: 0, y: 0 };
        this.snapToGrid = true;
        this.init();
    }

    init() {
        setTimeout(() => {
            this.setupDesktopGrid();
        }, 100);
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
}
