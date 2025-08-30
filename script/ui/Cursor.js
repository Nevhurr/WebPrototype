export class Cursor {
    constructor() {
        this.cursor = null;
        this.init();
    }

    init() {
        this.cursor = document.getElementById('custom-cursor');
        if (!this.cursor) return;
        
        this.setupMouseTracking();
        this.setupInteractiveElements();
        this.hideDefaultCursor();
    }

    setupMouseTracking() {
        document.addEventListener('mousemove', (e) => {
            if (this.cursor) {
                this.cursor.style.left = (e.clientX - 1) + 'px';
                this.cursor.style.top = (e.clientY - 1) + 'px';
            }
        });
    }

    setupInteractiveElements() {
        const interactiveElements = document.querySelectorAll('button, .desktop-icon, .start-menu-item, .running-app, .window-header, .window-control, .start-button');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                if (this.cursor) {
                    this.cursor.classList.add('hover');
                }
            });
            
            element.addEventListener('mouseleave', () => {
                if (this.cursor) {
                    this.cursor.classList.remove('hover');
                }
            });
        });
    }

    hideDefaultCursor() {
        document.body.style.cursor = 'none';
        document.querySelectorAll('*').forEach(element => {
            element.style.cursor = 'none';
        });
    }
}
