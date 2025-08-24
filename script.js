// ========================================
// RETROOS - SYSTÈME D'EXPLOITATION RÉTRO
// ========================================

class ThreeJSRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.windows = new Map();
        this.raycaster = null;
        this.mouse = null;
        this.isInitialized = false;
        
        this.init();
    }
    
    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();
            this.setupRaycaster();
            this.animate();
            this.isInitialized = true;
            console.log('✅ Three.js initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de Three.js:', error);
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = null; // Transparent
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;
    }
    
    setupRenderer() {
        const canvas = document.getElementById('threejs-canvas');
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0);
    }
    
    setupLights() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Lumière directionnelle
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }
    
    createWindowMesh(windowElement, appName) {
        if (!this.isInitialized) return null;
        
        try {
            const rect = windowElement.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;
            
            // Créer la géométrie de la fenêtre
            const geometry = new THREE.PlaneGeometry(width / 100, height / 100);
            
            // Créer le matériau avec transparence
            const material = new THREE.MeshLambertMaterial({
                color: 0x222222,
                transparent: true,
                opacity: 0.9,
                side: THREE.DoubleSide
            });
            
            // Créer le mesh
            const mesh = new THREE.Mesh(geometry, material);
            
            // Positionner le mesh
            const x = (rect.left + width / 2 - window.innerWidth / 2) / 100;
            const y = -(rect.top + height / 2 - window.innerHeight / 2) / 100;
            mesh.position.set(x, y, 0);
            
            // Ajouter des bordures
            const borderGeometry = new THREE.EdgesGeometry(geometry);
            const borderMaterial = new THREE.LineBasicMaterial({ 
                color: 0xff4444,
                transparent: true,
                opacity: 0.8
            });
            const border = new THREE.LineSegments(borderGeometry, borderMaterial);
            mesh.add(border);
            
            // Stocker la référence
            this.windows.set(appName, {
                mesh: mesh,
                element: windowElement,
                originalPosition: { x: x, y: y }
            });
            
            this.scene.add(mesh);
            return mesh;
            
        } catch (error) {
            console.error('❌ Erreur lors de la création du mesh de fenêtre:', error);
            return null;
        }
    }
    
    updateWindowPosition(appName, x, y) {
        const windowData = this.windows.get(appName);
        if (windowData && windowData.mesh) {
            const normalizedX = (x + windowData.mesh.geometry.parameters.width * 50 - window.innerWidth / 2) / 100;
            const normalizedY = -(y + windowData.mesh.geometry.parameters.height * 50 - window.innerHeight / 2) / 100;
            
            windowData.mesh.position.set(normalizedX, normalizedY, 0);
        }
    }
    
    removeWindow(appName) {
        const windowData = this.windows.get(appName);
        if (windowData && windowData.mesh) {
            this.scene.remove(windowData.mesh);
            this.windows.delete(appName);
        }
    }
    
    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        // Animation des fenêtres
        this.windows.forEach((windowData, appName) => {
            if (windowData.mesh) {
                // Effet de flottement subtil
                windowData.mesh.rotation.z = Math.sin(Date.now() * 0.001) * 0.01;
            }
        });
        
        this.renderer.render(this.scene, this.camera);
    }
    
    onWindowResize() {
        if (!this.isInitialized) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

class RetroOS {
    constructor() {
        this.windows = new Map();
        this.activeWindow = null;
        this.startMenuOpen = false;
        this.clockInterval = null;
        this.draggedWindow = null;
        this.dragOffset = { x: 0, y: 0 };
        this.activeRipples = 0;
        this.maxRipples = 6; // Limite le nombre de ripples simultanés
        this.threeJSRenderer = null;
        
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
        
        console.log('🚀 Chargement de Three.js et du modèle FUMO...');
        
        // Charger Three.js et le modèle FUMO pendant l'écran de chargement
        this.loadThreeJSAndFumo(() => {
            // Callback appelé quand tout est chargé
            console.log('✅ Tout est chargé, affichage du bureau...');
            
            // Faire disparaître l'écran de chargement
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                
                // Animation séquentielle des éléments
                // 1. Wireframe du background
                setTimeout(() => {
                    wallpaper.classList.add('fade-in');
                }, 100);
                
                // 2. Reste des éléments RetroOS
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
                
                // Initialiser RetroOS après les animations
                setTimeout(() => {
                    this.initializeRetroOS();
                }, 1000);
                
            }, 500); // Délai pour la transition de l'écran de chargement
        });
    }
    
    loadThreeJSAndFumo(callback) {
        console.log('🔄 Vérification de Three.js...');
        
        // Vérifier d'abord si les scripts sont dans le DOM
        const threeScript = document.querySelector('script[src*="three"]');
        const gltfScript = document.querySelector('script[src*="GLTFLoader"]');
        
        console.log('🔍 Script Three.js trouvé:', !!threeScript);
        console.log('🔍 Script GLTFLoader trouvé:', !!gltfScript);
        
        if (threeScript) {
            console.log('📁 URL Three.js:', threeScript.src);
        }
        if (gltfScript) {
            console.log('📁 URL GLTFLoader:', gltfScript.src);
        }
        
        // Essayer de charger Three.js manuellement si nécessaire
        if (typeof THREE === 'undefined') {
            console.log('⚠️ THREE non défini, tentative de chargement manuel...');
            this.loadThreeJSManually(callback);
            return;
        }
        
        // Vérifier GLTFLoader
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.log('⚠️ GLTFLoader non défini, tentative de chargement manuel...');
            this.loadGLTFLoaderManually(callback);
            return;
        }
        
        console.log('✅ Three.js et GLTFLoader disponibles');
        this.preloadFumoModel(callback);
    }
    
    loadThreeJSManually(callback) {
        console.log('📥 Chargement manuel de Three.js...');
        
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r158/three.min.js';
        script.onload = () => {
            console.log('✅ Three.js chargé manuellement');
            this.loadGLTFLoaderManually(callback);
        };
        script.onerror = () => {
            console.error('❌ Échec du chargement manuel de Three.js');
            setTimeout(callback, 1000);
        };
        document.head.appendChild(script);
    }
    
    loadGLTFLoaderManually(callback) {
        if (typeof THREE === 'undefined') {
            console.log('⏳ Attente de Three.js...');
            setTimeout(() => this.loadGLTFLoaderManually(callback), 100);
            return;
        }
        
        console.log('📥 Chargement manuel de GLTFLoader...');
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/js/loaders/GLTFLoader.js';
        script.onload = () => {
            console.log('✅ GLTFLoader chargé manuellement');
            this.preloadFumoModel(callback);
        };
        script.onerror = () => {
            console.error('❌ Échec du chargement manuel de GLTFLoader');
            setTimeout(callback, 1000);
        };
        document.head.appendChild(script);
    }
    
    preloadFumoModel(callback) {
        console.log('📥 Préchargement du modèle FUMO...');
        
        const loader = new THREE.GLTFLoader();
        loader.load(
            '3D/project_koishi_komeiji_fumo/scene.gltf',
            (gltf) => {
                console.log('✅ Modèle FUMO préchargé avec succès');
                console.log('📊 Données du modèle:', gltf);
                
                // Stocker le modèle préchargé
                window.preloadedFumoModel = gltf;
                
                // Mettre à jour l'écran de chargement
                this.updateLoadingProgress(100);
                
                // Appeler le callback après un délai
                setTimeout(callback, 1000);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(2);
                console.log('📥 Préchargement FUMO:', percent + '%');
                
                // Mettre à jour l'écran de chargement
                this.updateLoadingProgress(percent);
            },
            (error) => {
                console.error('❌ Erreur lors du préchargement FUMO:', error);
                console.log('⚠️ Continuera avec le cube de fallback');
                
                // Continuer même en cas d'erreur
                setTimeout(callback, 1000);
            }
        );
    }
    
    updateLoadingProgress(percent) {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Créer ou mettre à jour la barre de progression
            let progressBar = loadingScreen.querySelector('.loading-progress');
            if (!progressBar) {
                progressBar = document.createElement('div');
                progressBar.className = 'loading-progress';
                progressBar.innerHTML = `
                    <div class="progress-text">Chargement: ${percent}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="loading-status">Chargement de Three.js et du modèle FUMO...</div>
                `;
                loadingScreen.appendChild(progressBar);
            } else {
                progressBar.innerHTML = `
                    <div class="progress-text">Chargement: ${percent}%</div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="loading-status">Chargement de Three.js et du modèle FUMO...</div>
                `;
            }
        }
    }
    
    initializeRetroOS() {
        this.setupEventListeners();
        this.setupCustomCursor();
        this.setupRippleEffect();
        this.updateClock();
        this.startClock();
        this.positionWindows();
        this.initializeThreeJS();
        
        // Test de la barre des tâches
        setTimeout(() => {
            this.testTaskbar();
        }, 2000);
        
        console.log('🚀 RetroOS initialisé');
    }
    
    initializeThreeJS() {
        try {
            this.threeJSRenderer = new ThreeJSRenderer();
            
            // Gérer le redimensionnement de la fenêtre
            window.addEventListener('resize', () => {
                if (this.threeJSRenderer) {
                    this.threeJSRenderer.onWindowResize();
                }
            });
            
            console.log('✅ Three.js intégré dans RetroOS');
        } catch (error) {
            console.error('❌ Erreur lors de l\'intégration de Three.js:', error);
        }
    }
    
    setupCustomCursor() {
        const cursor = document.getElementById('custom-cursor');
        if (!cursor) return;
        
        // Suivre le mouvement de la souris directement
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = (e.clientX - 1) + 'px';
            cursor.style.top = (e.clientY - 1) + 'px';
        });
        
        // Effet hover sur les éléments interactifs
        const interactiveElements = document.querySelectorAll('button, .desktop-icon, .start-menu-item, .running-app, .window-header, .window-control, .start-button');
        
        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.classList.add('hover');
            });
            
            element.addEventListener('mouseleave', () => {
                cursor.classList.remove('hover');
            });
        });
        
        // Masquer le curseur par défaut du navigateur
        document.body.style.cursor = 'none';
        
        // Masquer le curseur sur tous les éléments
        document.querySelectorAll('*').forEach(element => {
            element.style.cursor = 'none';
        });
    }
    
    setupEventListeners() {
        // Désactiver les clics droits sur tout le site
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            return false;
        });
        
        // Bouton de démarrage
        const startButton = document.getElementById('start-button');
        if (startButton) {
            startButton.addEventListener('click', () => {
                console.log('🚀 Bouton de démarrage cliqué !');
                this.toggleStartMenu();
            });
            console.log('✅ Événement attaché au bouton de démarrage');
        } else {
            console.error('❌ Bouton de démarrage non trouvé !');
        }
        
        // Test de débogage pour la barre des tâches
        const runningApps = document.getElementById('running-apps');
        if (runningApps) {
            runningApps.addEventListener('click', (e) => {
                console.log('🖱️ Clic détecté dans la zone running-apps:', e.target);
            });
        }
        
        // Icônes du bureau
        const desktopIcons = document.querySelectorAll('.desktop-icon');
        desktopIcons.forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const appName = e.currentTarget.dataset.app;
                this.openWindow(appName);
            });
        });
        
        // Menu de démarrage
        const startMenuItems = document.querySelectorAll('.start-menu-item');
        startMenuItems.forEach(item => {
            if (item.id !== 'shutdown') {
                item.addEventListener('click', (e) => {
                    const appName = e.currentTarget.dataset.app;
                    this.openWindow(appName);
                    this.closeStartMenu();
                });
            }
        });
        
        // Bouton arrêter
        const shutdownButton = document.getElementById('shutdown');
        shutdownButton.addEventListener('click', () => this.shutdown());
        
        // Fermer le menu de démarrage en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#start-button') && !e.target.closest('#start-menu')) {
                this.closeStartMenu();
            }
        });
        
        // Gestion des fenêtres
        this.setupWindowEventListeners();
        
        // Raccourcis clavier
        this.setupKeyboardShortcuts();
    }
    
    setupWindowEventListeners() {
        // Contrôles de fenêtre
        document.addEventListener('click', (e) => {
            const control = e.target.closest('.window-control');
            if (control) {
                const action = control.dataset.action;
                const window = control.closest('.window');
                const appName = window.dataset.app;
                
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
            }
        });
        
        // Déplacement des fenêtres
        document.addEventListener('mousedown', (e) => {
            const windowHeader = e.target.closest('.window-header');
            if (windowHeader && !e.target.closest('.window-controls')) {
                this.startWindowDrag(e);
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.draggedWindow) {
                this.dragWindow(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.stopWindowDrag();
        });
        
        // Focus des fenêtres
        document.addEventListener('mousedown', (e) => {
            const window = e.target.closest('.window');
            if (window) {
                this.focusWindow(window.dataset.app);
            }
        });
    }
    
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Échap pour fermer le menu de démarrage
            if (e.key === 'Escape') {
                this.closeStartMenu();
            }
            
            // Alt+Tab pour changer de fenêtre
            if (e.altKey && e.key === 'Tab') {
                e.preventDefault();
                this.cycleWindows();
            }
            
            // Raccourcis pour les applications
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
                    case '4':
                        e.preventDefault();
                        this.openWindow('fumo');
                        break;

                }
            }
        });
    }
    
    toggleStartMenu() {
        if (this.startMenuOpen) {
            this.closeStartMenu();
        } else {
            this.openStartMenu();
        }
    }
    
    openStartMenu() {
        const startMenu = document.getElementById('start-menu');
        startMenu.classList.remove('hidden');
        this.startMenuOpen = true;
    }
    
    closeStartMenu() {
        const startMenu = document.getElementById('start-menu');
        startMenu.classList.add('hidden');
        this.startMenuOpen = false;
    }
    
    openWindow(appName) {
        const windowId = `${appName}-window`;
        const window = document.getElementById(windowId);
        
        if (window) {
            // Si la fenêtre est déjà ouverte, la ramener au premier plan
            if (!window.classList.contains('hidden')) {
                this.focusWindow(appName);
                return;
            }
            
            // Ouvrir la fenêtre
            window.classList.remove('hidden');
            this.windows.set(appName, {
                element: window,
                minimized: false,
                maximized: false,
                zIndex: this.getNextZIndex()
            });
            
            // Positionner la fenêtre
            this.positionWindow(appName);
            
            // Créer le mesh Three.js si disponible
            if (this.threeJSRenderer && this.threeJSRenderer.isInitialized) {
                this.threeJSRenderer.createWindowMesh(window, appName);
            }
            
            // Mettre au premier plan
            this.focusWindow(appName);
            
            // Ajouter à la barre des tâches
            this.addToTaskbar(appName);
            
            // Déclencher l'événement d'ouverture pour FUMO
            if (appName === 'fumo') {
                document.dispatchEvent(new Event('fumo-window-opened'));
            }
            
            console.log(`📱 Fenêtre ${appName} ouverte`);
        }
    }
    
    closeWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            window.classList.add('hidden');
            this.windows.delete(appName);
            
            // Supprimer le mesh Three.js si disponible
            if (this.threeJSRenderer && this.threeJSRenderer.isInitialized) {
                this.threeJSRenderer.removeWindow(appName);
            }
            
            this.removeFromTaskbar(appName);
            
            // Si c'était la fenêtre active, en activer une autre
            if (this.activeWindow === appName) {
                this.activeWindow = null;
                const remainingWindows = Array.from(this.windows.keys());
                if (remainingWindows.length > 0) {
                    this.focusWindow(remainingWindows[0]);
                }
            }
            
            console.log(`❌ Fenêtre ${appName} fermée`);
        }
    }
    
    minimizeWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            window.classList.add('hidden');
            const windowData = this.windows.get(appName);
            if (windowData) {
                windowData.minimized = true;
            }
            console.log(`📱 Fenêtre ${appName} minimisée`);
        }
    }
    
    restoreWindow(appName) {
        console.log(`🔄 Tentative de restauration de la fenêtre ${appName}`);
        
        const window = document.getElementById(`${appName}-window`);
        const windowData = this.windows.get(appName);
        
        console.log(`🔍 Fenêtre trouvée:`, window);
        console.log(`🔍 Données de fenêtre:`, windowData);
        
        if (window && windowData) {
            // Restaurer la fenêtre si elle était minimisée
            if (windowData.minimized) {
                window.classList.remove('hidden');
                windowData.minimized = false;
                console.log(`📱 Fenêtre ${appName} restaurée (était minimisée)`);
            } else {
                console.log(`📱 Fenêtre ${appName} n'était pas minimisée`);
            }
            
            // Mettre la fenêtre au premier plan
            this.focusWindow(appName);
            console.log(`✅ Fenêtre ${appName} restaurée et focalisée`);
        } else {
            console.error(`❌ Impossible de restaurer la fenêtre ${appName}:`, {
                window: window,
                windowData: windowData
            });
        }
    }
    
    maximizeWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        const windowData = this.windows.get(appName);
        
        if (window && windowData) {
            if (windowData.maximized) {
                // Restaurer
                window.style.width = '';
                window.style.height = '';
                window.style.left = '';
                window.style.top = '';
                windowData.maximized = false;
                console.log(`📱 Fenêtre ${appName} restaurée`);
            } else {
                // Maximiser
                window.style.width = '90vw';
                window.style.height = '80vh';
                window.style.left = '5vw';
                window.style.top = '10vh';
                windowData.maximized = true;
                console.log(`📱 Fenêtre ${appName} maximisée`);
            }
        }
    }
    
    focusWindow(appName) {
        // Retirer le focus de toutes les fenêtres
        document.querySelectorAll('.window').forEach(w => {
            w.style.zIndex = '100';
        });
        
        // Mettre la fenêtre au premier plan
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            // S'assurer que la fenêtre est visible
            if (window.classList.contains('hidden')) {
                window.classList.remove('hidden');
                const windowData = this.windows.get(appName);
                if (windowData) {
                    windowData.minimized = false;
                }
            }
            
            window.style.zIndex = '1000';
            this.activeWindow = appName;
            
            // Mettre à jour la barre des tâches
            this.updateTaskbarFocus(appName);
        }
    }
    
    positionWindows() {
        const positions = {
            game: { left: '10%', top: '10%' },
            about: { left: '20%', top: '15%' },
            download: { left: '30%', top: '20%' }
        };
        
        Object.entries(positions).forEach(([appName, pos]) => {
            const window = document.getElementById(`${appName}-window`);
            if (window) {
                window.style.left = pos.left;
                window.style.top = pos.top;
            }
        });
    }
    
    positionWindow(appName) {
        const window = document.getElementById(`${appName}-window`);
        if (window) {
            // Position par défaut si pas encore positionnée
            if (!window.style.left || !window.style.top) {
                const positions = {
                    game: { left: '10%', top: '10%' },
                    about: { left: '20%', top: '15%' },
                    download: { left: '30%', top: '20%' }
                };
                
                const pos = positions[appName] || { left: '50%', top: '50%' };
                window.style.left = pos.left;
                window.style.top = pos.top;
            }
        }
    }
    
    startWindowDrag(e) {
        const window = e.target.closest('.window');
        if (window) {
            this.draggedWindow = window;
            const rect = window.getBoundingClientRect();
            this.dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            
            // Mettre la fenêtre au premier plan
            this.focusWindow(window.dataset.app);
        }
    }
    
    dragWindow(e) {
        if (this.draggedWindow) {
            const newLeft = e.clientX - this.dragOffset.x;
            const newTop = e.clientY - this.dragOffset.y;
            
            // Déplacement direct sans transition
            this.draggedWindow.style.transition = 'none';
            this.draggedWindow.style.left = `${newLeft}px`;
            this.draggedWindow.style.top = `${newTop}px`;
            
            // Mettre à jour la position du mesh Three.js
            const appName = this.draggedWindow.dataset.app;
            if (this.threeJSRenderer && this.threeJSRenderer.isInitialized) {
                this.threeJSRenderer.updateWindowPosition(appName, newLeft, newTop);
            }
        }
    }
    
    stopWindowDrag() {
        if (this.draggedWindow) {
            // Restaurer les transitions après le déplacement
            this.draggedWindow.style.transition = '';
            this.draggedWindow = null;
        }
    }
    
    addToTaskbar(appName) {
        const runningApps = document.getElementById('running-apps');
        const existingApp = runningApps.querySelector(`[data-app="${appName}"]`);
        
        if (!existingApp) {
            const appElement = document.createElement('div');
            appElement.className = 'running-app';
            appElement.dataset.app = appName;
            appElement.textContent = this.getAppDisplayName(appName);
            
            // Stocker la référence du gestionnaire d'événement
            appElement._clickHandler = () => {
                console.log(`🖱️ Clic sur l'app ${appName} dans la barre des tâches`);
                this.restoreWindow(appName);
            };
            appElement.addEventListener('click', appElement._clickHandler);
            
            // Ajouter des styles de débogage
            appElement.style.position = 'relative';
            appElement.style.zIndex = '1002';
            
            runningApps.appendChild(appElement);
            console.log(`✅ App ${appName} ajoutée à la barre des tâches`);
        } else {
            // Mettre à jour l'événement de clic pour les applications existantes
            if (existingApp._clickHandler) {
                existingApp.removeEventListener('click', existingApp._clickHandler);
            }
            existingApp._clickHandler = () => {
                console.log(`🖱️ Clic sur l'app ${appName} existante dans la barre des tâches`);
                this.restoreWindow(appName);
            };
            existingApp.addEventListener('click', existingApp._clickHandler);
            console.log(`✅ App ${appName} mise à jour dans la barre des tâches`);
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
        // Retirer le focus de toutes les applications
        document.querySelectorAll('.running-app').forEach(app => {
            app.classList.remove('active');
        });
        
        // Mettre le focus sur l'application active
        const activeApp = document.querySelector(`.running-app[data-app="${appName}"]`);
        if (activeApp) {
            activeApp.classList.add('active');
        }
    }
    
    getAppDisplayName(appName) {
        const names = {
            game: '🎮 Jeu Rétro',
            about: 'ℹ️ À propos',
            download: '📥 Télécharger',
            fumo: '🎭 FUMO'
        };
        return names[appName] || appName;
    }
    
    cycleWindows() {
        const windowNames = Array.from(this.windows.keys());
        if (windowNames.length > 1) {
            const currentIndex = windowNames.indexOf(this.activeWindow);
            const nextIndex = (currentIndex + 1) % windowNames.length;
            this.focusWindow(windowNames[nextIndex]);
        }
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
    
    shutdown() {
        if (confirm('Voulez-vous vraiment arrêter RetroOS ?')) {
            // Fermer toutes les fenêtres
            this.windows.forEach((windowData, appName) => {
                this.closeWindow(appName);
            });
            
            // Afficher un message de fermeture
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
            
            // Simuler un arrêt
            setTimeout(() => {
                shutdownMessage.remove();
                this.closeStartMenu();
            }, 3000);
        }
    }
    
    testTaskbar() {
        console.log('🧪 Test de la barre des tâches...');
        
        // Ouvrir une fenêtre de test
        this.openWindow('game');
        
        setTimeout(() => {
            // Minimiser la fenêtre
            this.minimizeWindow('game');
            console.log('🧪 Fenêtre minimisée, testez le clic dans la barre des tâches');
            
            // Vérifier l'état
            const windowData = this.windows.get('game');
            console.log('🧪 État de la fenêtre game:', windowData);
            
            const runningApp = document.querySelector('.running-app[data-app="game"]');
            console.log('🧪 App dans la barre des tâches:', runningApp);
            
            if (runningApp) {
                console.log('🧪 Gestionnaire d\'événement attaché:', runningApp._clickHandler);
            }
        }, 1000);
    }

    setupRippleEffect() {
        // Utiliser un événement global sur le document pour capturer tous les clics
        document.addEventListener('click', (e) => {
            const wallpaper = document.getElementById('wallpaper');
            
            if (!wallpaper) {
                console.log('❌ Wallpaper non trouvé');
                return;
            }
            
            console.log('🎯 Clic détecté sur:', e.target.tagName, e.target.className, e.target.id);
            
            // Créer l'effet de ripple sur le wireframe pour TOUS les clics
            console.log('🎯 Création du ripple sur le wireframe');
            this.createRipple(e, wallpaper);
        });
        
        // Version alternative avec mousedown pour une meilleure détection
        document.addEventListener('mousedown', (e) => {
            const wallpaper = document.getElementById('wallpaper');
            
            if (!wallpaper) return;
            
            console.log('🎯 Mousedown détecté - Création du ripple sur le wireframe');
            
            // Créer l'effet de ripple uniquement sur le wireframe
            this.createRipple(e, wallpaper);
        });
        
        console.log('✅ Effet de ripple configuré sur le wireframe - Tous les clics déclenchent l\'effet');
    }
    
    createRipple(event, target) {
        console.log('🎨 Création du ripple...');
        
        // Vérifier si on peut créer de nouveaux ripples
        if (this.activeRipples >= this.maxRipples) {
            console.log('⚠️ Limite de ripples atteinte, attendez...');
            return;
        }
        
        try {
            // Créer 1 à 2 ripples pour un effet plus subtil
            const rippleCount = Math.min(
                Math.floor(Math.random() * 2) + 1, // 1 à 2 ripples
                this.maxRipples - this.activeRipples // Respecter la limite
            );
            
            console.log(`🎨 Création de ${rippleCount} ripple(s)`);
            
            for (let i = 0; i < rippleCount; i++) {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                
                // Créer l'élément de déformation du wireframe
                const wireframeDistortion = document.createElement('div');
                wireframeDistortion.className = 'wireframe-distortion';
                
                // Calculer la position relative au wireframe
                const rect = target.getBoundingClientRect();
                // Réduire la taille des ripples pour un effet plus subtil
                const size = Math.min(rect.width, rect.height) * 0.3; // 30% de la plus petite dimension
                
                // Ajouter une légère variation de position pour les ripples multiples
                const offsetX = (Math.random() - 0.5) * 10; // Réduit de 20 à 10
                const offsetY = (Math.random() - 0.5) * 10;
                const x = event.clientX - rect.left + offsetX;
                const y = event.clientY - rect.top + offsetY;
                
                console.log(`🎨 Ripple ${i + 1}: position (${Math.round(x)}, ${Math.round(y)}), taille: ${Math.round(size)}px`);
                
                // Positionner le ripple
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.style.width = size + 'px';
                ripple.style.height = size + 'px';
                ripple.style.marginLeft = -size / 2 + 'px';
                ripple.style.marginTop = -size / 2 + 'px';
                
                // Positionner la déformation du wireframe (plus grande zone d'effet)
                const distortionSize = size * 3;
                wireframeDistortion.style.left = (x - distortionSize / 2) + 'px';
                wireframeDistortion.style.top = (y - distortionSize / 2) + 'px';
                wireframeDistortion.style.width = distortionSize + 'px';
                wireframeDistortion.style.height = distortionSize + 'px';
                
                // Ajouter au wireframe
                target.appendChild(wireframeDistortion);
                target.appendChild(ripple);
                this.activeRipples++;
                
                console.log(`🎨 Ripple ${i + 1} ajouté, total actif: ${this.activeRipples}`);
                
                // Nettoyer après l'animation
                setTimeout(() => {
                    if (ripple.parentNode) {
                        ripple.parentNode.removeChild(ripple);
                    }
                    if (wireframeDistortion.parentNode) {
                        wireframeDistortion.parentNode.removeChild(wireframeDistortion);
                    }
                    this.activeRipples--;
                    console.log(`🎨 Ripple ${i + 1} nettoyé, total actif: ${this.activeRipples}`);
                }, 600 + (i * 50)); // Délai progressif réduit
            }
        } catch (error) {
            console.error('❌ Erreur lors de la création du ripple:', error);
        }
    }
}

// Classe FumoRenderer pour l'animation 3D
class FumoRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.fumoModel = null;
        this.animationId = null;
        this.isPaused = false;
        this.isInitialized = false;
        
        // Three.js est déjà vérifié avant la création de cette classe
        this.init();
    }
    
    init() {
        try {
            // Vérifier que Three.js est disponible
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js n\'est pas encore chargé');
            }
            
            console.log('🚀 Initialisation de FumoRenderer...');
            console.log('🔍 Version Three.js:', THREE.REVISION);
            
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();
            this.loadFumoModel();
            this.animate();
            this.isInitialized = true;
            console.log('✅ FumoRenderer initialisé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de FumoRenderer:', error);
            console.error('❌ Stack trace:', error.stack);
        }
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    setupLights() {
        // Lumière ambiante
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Lumière directionnelle principale
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // Lumière d'accent
        const pointLight = new THREE.PointLight(0xff4444, 0.5, 10);
        pointLight.position.set(0, 2, 2);
        this.scene.add(pointLight);
    }
    
    loadFumoModel() {
        // Vérifier si le modèle a été préchargé
        if (window.preloadedFumoModel) {
            console.log('✅ Utilisation du modèle préchargé');
            this.usePreloadedModel();
        } else {
            console.log('⚠️ Modèle non préchargé, création du cube temporaire');
            this.createFallbackCube();
        }
    }
    
    createFallbackCube() {
        // Créer un cube temporaire en attendant le modèle
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshLambertMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        
        this.fumoModel = new THREE.Mesh(geometry, material);
        this.fumoModel.castShadow = true;
        this.fumoModel.receiveShadow = true;
        
        // Position initiale (haut de l'écran)
        this.fumoModel.position.set(0, 8, 0);
        
        this.scene.add(this.fumoModel);
        
        console.log('🎲 Cube temporaire créé');
    }
    
    usePreloadedModel() {
        const gltf = window.preloadedFumoModel;
        
        if (this.fumoModel) {
            this.scene.remove(this.fumoModel);
        }
        
        this.fumoModel = gltf.scene.clone();
        
        // Ajuster l'échelle et la position selon les dimensions du modèle
        const modelHeight = 25;
        const targetHeight = 3;
        const scale = targetHeight / modelHeight;
        
        this.fumoModel.scale.set(scale, scale, scale);
        this.fumoModel.position.set(0, 8, 0);
        
        // Configurer les ombres et matériaux pour tous les meshes
        this.fumoModel.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                if (child.material) {
                    child.material.side = THREE.DoubleSide;
                    child.material.transparent = true;
                    child.material.opacity = 0.9;
                }
            }
        });
        
        this.scene.add(this.fumoModel);
        console.log('✅ Modèle préchargé utilisé avec succès');
    }
    
    loadGLTFModel() {
        console.log('🔄 Début du chargement GLTF...');
        
        // Vérifier que THREE.GLTFLoader existe
        if (typeof THREE.GLTFLoader === 'undefined') {
            console.error('❌ THREE.GLTFLoader non disponible');
            console.log('🔍 THREE.js version:', THREE.REVISION);
            console.log('🔍 Objets disponibles:', Object.keys(THREE));
            return;
        }
        
        const loader = new THREE.GLTFLoader();
        console.log('✅ GLTFLoader créé avec succès');
        
        const modelPath = '3D/project_koishi_komeiji_fumo/scene.gltf';
        console.log('📁 Chemin du modèle:', modelPath);
        
        loader.load(
            modelPath,
            (gltf) => {
                console.log('🎉 Modèle GLTF chargé avec succès!');
                console.log('📊 Données du modèle:', gltf);
                console.log('🏗️ Scène:', gltf.scene);
                console.log('🔧 Animations:', gltf.animations);
                
                if (this.fumoModel) {
                    this.scene.remove(this.fumoModel);
                    console.log('🗑️ Ancien modèle supprimé');
                }
                
                this.fumoModel = gltf.scene;
                
                // Ajuster l'échelle et la position selon les dimensions du modèle
                // Le modèle a une hauteur d'environ 25 unités (179.97 - 155.10)
                const modelHeight = 25;
                const targetHeight = 3; // Hauteur cible dans la scène
                const scale = targetHeight / modelHeight;
                
                this.fumoModel.scale.set(scale, scale, scale);
                this.fumoModel.position.set(0, 8, 0);
                
                // Centrer le modèle horizontalement
                this.fumoModel.position.x = 0;
                this.fumoModel.position.z = 0;
                
                console.log('📏 Dimensions du modèle:', modelHeight, 'unités');
                console.log('🔧 Échelle appliquée:', scale);
                console.log('📍 Position finale:', this.fumoModel.position);
                
                // Configurer les ombres et matériaux pour tous les meshes
                this.fumoModel.traverse((child) => {
                    console.log('🔍 Traversement enfant:', child.type, child.name);
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        console.log('✅ Mesh configuré:', child.name);
                        
                        // Améliorer le rendu des matériaux
                        if (child.material) {
                            child.material.side = THREE.DoubleSide;
                            child.material.transparent = true;
                            child.material.opacity = 0.9;
                            console.log('✅ Matériau configuré pour:', child.name);
                        }
                    }
                });
                
                this.scene.add(this.fumoModel);
                console.log('✅ Modèle FUMO ajouté à la scène');
                console.log('🎯 Nombre d\'objets dans la scène:', this.scene.children.length);
            },
            (progress) => {
                const percent = (progress.loaded / progress.total * 100).toFixed(2);
                console.log('📥 Chargement du modèle:', percent + '%');
                console.log('📊 Progression:', progress.loaded, '/', progress.total, 'bytes');
            },
            (error) => {
                console.error('❌ Erreur lors du chargement du modèle:', error);
                console.error('❌ Détails de l\'erreur:', error.message);
                console.error('❌ Stack trace:', error.stack);
                console.log('⚠️ Utilisation du cube de fallback');
            }
        );
    }
    
    animate() {
        if (this.isPaused) {
            this.animationId = requestAnimationFrame(() => this.animate());
            return;
        }
        
        if (this.fumoModel) {
            // Rotation continue plus douce
            this.fumoModel.rotation.y += 0.015;
            this.fumoModel.rotation.x += 0.008;
            
            // Chute lente et fluide
            this.fumoModel.position.y -= 0.025;
            
            // Ajouter un léger balancement horizontal
            this.fumoModel.position.x = Math.sin(Date.now() * 0.001) * 0.5;
            
            // Vérifier si le modèle est sorti de l'écran
            if (this.fumoModel.position.y < -8) {
                // Remettre en haut avec une position aléatoire
                this.fumoModel.position.y = 8;
                this.fumoModel.position.x = (Math.random() - 0.5) * 2;
                this.fumoModel.rotation.z = (Math.random() - 0.5) * 0.2;
            }
        }
        
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
        this.animate();
    }
    
    restart() {
        if (this.fumoModel) {
            this.fumoModel.position.set(0, 8, 0);
            this.fumoModel.rotation.set(0, 0, 0);
        }
    }
    
    resize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        }
    }
    
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.retroOS = new RetroOS();
});

// Gestion des boutons du jeu (conservé pour compatibilité)
document.addEventListener('DOMContentLoaded', function() {
    // Boutons du jeu
    const playButton = document.querySelector('.play-button');
    const downloadButton = document.querySelector('.download-button');
    
    if (playButton) {
        playButton.addEventListener('click', function() {
            showRetroMessage('🎮 Lancement du jeu...');
            console.log('🚀 Bouton Jouer cliqué !');
        });
    }
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            showRetroMessage('📥 Téléchargement en cours...');
            console.log('💾 Bouton Télécharger cliqué !');
        });
    }
    
    // Boutons de téléchargement
    const downloadBtns = document.querySelectorAll('.download-btn');
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showRetroMessage('📥 Téléchargement en cours...');
        });
    });
    
    // Gestion de l'application FUMO
    let fumoRenderer = null;
    
    // Initialiser FumoRenderer quand la fenêtre FUMO est ouverte
    document.addEventListener('fumo-window-opened', function() {
        if (!fumoRenderer) {
            console.log('🎭 Fenêtre FUMO ouverte, création du renderer...');
            // Attendre que Three.js soit complètement chargé
            if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
                fumoRenderer = new FumoRenderer('fumo-canvas');
            } else {
                console.log('⏳ Three.js pas encore prêt, attente...');
                const checkThreeJS = setInterval(() => {
                    if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
                        clearInterval(checkThreeJS);
                        console.log('✅ Three.js prêt, création du renderer...');
                        fumoRenderer = new FumoRenderer('fumo-canvas');
                    }
                }, 100);
            }
        }
    });
    
    // Gestion des boutons FUMO
    const restartFumoBtn = document.getElementById('restart-fumo');
    const pauseFumoBtn = document.getElementById('pause-fumo');
    
    if (restartFumoBtn) {
        restartFumoBtn.addEventListener('click', function() {
            if (fumoRenderer) {
                fumoRenderer.restart();
                showRetroMessage('🔄 Animation redémarrée');
            }
        });
    }
    
    if (pauseFumoBtn) {
        pauseFumoBtn.addEventListener('click', function() {
            if (fumoRenderer) {
                if (fumoRenderer.isPaused) {
                    fumoRenderer.resume();
                    pauseFumoBtn.textContent = '⏸️ Pause';
                    showRetroMessage('▶️ Animation reprise');
                } else {
                    fumoRenderer.pause();
                    pauseFumoBtn.textContent = '▶️ Reprendre';
                    showRetroMessage('⏸️ Animation en pause');
                }
            }
        });
    }
    
    // Redimensionner le canvas FUMO quand la fenêtre est redimensionnée
    window.addEventListener('resize', function() {
        if (fumoRenderer) {
            fumoRenderer.resize();
        }
    });
});

// Fonction pour afficher des messages rétro
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
