export class RippleEffect {
    constructor() {
        this.activeRipples = 0;
        this.maxRipples = 6;
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
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
                }, 600);
            }
        } catch (error) {
            console.error('Erreur lors de la création du ripple:', error);
        }
    }
}
