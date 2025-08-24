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
        
        // Wireframe 3D
        this.wireframe = null;
        this.wireframeGroup = null;
        this.wireframeControls = null;
        this.isWireframeInteractive = false;
        
        this.init();
    }
    
    init() {
        try {
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupLights();
            this.setupWireframe();
            this.setupRaycaster();
            this.setupControls();
            this.animate();
            this.isInitialized = true;
            
            // S'assurer que le wireframe CSS reste visible par défaut
            const wallpaper = document.getElementById('wallpaper');
            if (wallpaper) {
                wallpaper.style.opacity = '0.3';
            }
            
            // Initialiser en mode CSS (pas 3D)
            this.isWireframeInteractive = false;
            
            console.log('✅ Three.js initialisé avec succès');
            console.log('ℹ️ Wireframe CSS visible par défaut - Utilisez le bouton pour basculer vers le mode 3D');
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
        this.camera.position.set(0, 0, 8);
        this.camera.lookAt(0, 0, 0);
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
        
        // Lumière ponctuelle pour le wireframe
        const pointLight = new THREE.PointLight(0xff4444, 0.5, 100);
        pointLight.position.set(0, 0, 5);
        this.scene.add(pointLight);
    }
    
    setupWireframe() {
        // Créer un groupe pour le wireframe
        this.wireframeGroup = new THREE.Group();
        this.scene.add(this.wireframeGroup);
        
        // Créer la grille wireframe 3D
        this.createWireframeGrid();
        
        // Créer des points de contrôle interactifs
        this.createWireframeControls();
    }
    
    createWireframeGrid() {
        // Supprimer l'ancien wireframe s'il existe
        if (this.wireframe) {
            this.wireframeGroup.remove(this.wireframe);
        }
        
        // Créer une géométrie de grille
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xff4444, 0x333333);
        
        // Créer des lignes personnalisées pour plus de contrôle
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        // Lignes horizontales
        for (let i = 0; i <= gridDivisions; i++) {
            const y = (i / gridDivisions - 0.5) * gridSize;
            positions.push(-gridSize/2, y, 0, gridSize/2, y, 0);
            
            const color = i === 0 || i === gridDivisions ? 0xff4444 : 0x333333;
            colors.push(color, color, color, color, color, color);
        }
        
        // Lignes verticales
        for (let i = 0; i <= gridDivisions; i++) {
            const x = (i / gridDivisions - 0.5) * gridSize;
            positions.push(x, -gridSize/2, 0, x, gridSize/2, 0);
            
            const color = i === 0 || i === gridDivisions ? 0xff4444 : 0x333333;
            colors.push(color, color, color, color, color, color);
        }
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            linewidth: 1
        });
        
        // Ajouter des propriétés pour l'effet de ripple
        material.userData = {
            originalOpacity: 0.6,
            rippleIntensity: 0
        };
        
        this.wireframe = new THREE.LineSegments(geometry, material);
        this.wireframeGroup.add(this.wireframe);
        
        // Ajouter des points de contrôle aux intersections
        this.addControlPoints(gridSize, gridDivisions);
    }
    
    addControlPoints(gridSize, gridDivisions) {
        // Créer des sphères aux points d'intersection
        const sphereGeometry = new THREE.SphereGeometry(0.1, 8, 6);
        const sphereMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4444,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i <= gridDivisions; i++) {
            for (let j = 0; j <= gridDivisions; j++) {
                const x = (i / gridDivisions - 0.5) * gridSize;
                const y = (j / gridDivisions - 0.5) * gridSize;
                
                const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
                sphere.position.set(x, y, 0);
                sphere.userData = { type: 'controlPoint', gridX: i, gridY: j };
                
                this.wireframeGroup.add(sphere);
            }
        }
    }
    
    createWireframeControls() {
        // Créer des contrôles pour manipuler le wireframe
        this.wireframeControls = {
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 0, z: 0 },
            distortion: 0
        };
        
        // Ajouter des contrôles clavier
        this.setupKeyboardControls();
    }
    
    setupKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.isWireframeInteractive) return;
            
            const step = 0.1;
            const rotationStep = 0.05;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.wireframeControls.position.y += step;
                    break;
                case 'ArrowDown':
                    this.wireframeControls.position.y -= step;
                    break;
                case 'ArrowLeft':
                    this.wireframeControls.position.x -= step;
                    break;
                case 'ArrowRight':
                    this.wireframeControls.position.x += step;
                    break;
                case 'PageUp':
                    this.wireframeControls.position.z += step;
                    break;
                case 'PageDown':
                    this.wireframeControls.position.z -= step;
                    break;
                case 'r':
                    this.wireframeControls.rotation.y += rotationStep;
                    break;
                case 'R':
                    this.wireframeControls.rotation.y -= rotationStep;
                    break;
                case 't':
                    this.wireframeControls.rotation.x += rotationStep;
                    break;
                case 'T':
                    this.wireframeControls.rotation.x -= rotationStep;
                    break;
                case 'y':
                    this.wireframeControls.rotation.z += rotationStep;
                    break;
                case 'Y':
                    this.wireframeControls.rotation.z -= rotationStep;
                    break;
                case '+':
                case '=':
                    this.wireframeControls.scale.x += 0.1;
                    this.wireframeControls.scale.y += 0.1;
                    this.wireframeControls.scale.z += 0.1;
                    break;
                case '-':
                    this.wireframeControls.scale.x = Math.max(0.1, this.wireframeControls.scale.x - 0.1);
                    this.wireframeControls.scale.y = Math.max(0.1, this.wireframeControls.scale.y - 0.1);
                    this.wireframeControls.scale.z = Math.max(0.1, this.wireframeControls.scale.z - 0.1);
                    break;
                case 'd':
                    this.wireframeControls.distortion += 0.1;
                    break;
                case 'D':
                    this.wireframeControls.distortion = Math.max(0, this.wireframeControls.distortion - 0.1);
                    break;
                case ' ':
                    this.resetWireframe();
                    break;
            }
            
            this.updateWireframeTransform();
        });
    }
    
    updateWireframeTransform() {
        if (!this.wireframeGroup) return;
        
        // Appliquer les transformations
        this.wireframeGroup.position.set(
            this.wireframeControls.position.x,
            this.wireframeControls.position.y,
            this.wireframeControls.position.z
        );
        
        this.wireframeGroup.rotation.set(
            this.wireframeControls.rotation.x,
            this.wireframeControls.rotation.y,
            this.wireframeControls.rotation.z
        );
        
        this.wireframeGroup.scale.set(
            this.wireframeControls.scale.x,
            this.wireframeControls.scale.y,
            this.wireframeControls.scale.z
        );
        
        // Appliquer la déformation
        this.applyWireframeDistortion();
    }
    
    applyWireframeDistortion() {
        if (!this.wireframe || !this.wireframe.geometry) return;
        
        const distortion = this.wireframeControls.distortion;
        const positions = this.wireframe.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const z = positions[i + 2];
            
            // Appliquer une déformation sinusoïdale
            const distortionX = Math.sin(y * 0.5) * distortion;
            const distortionY = Math.cos(x * 0.5) * distortion;
            
            positions[i] = x + distortionX;
            positions[i + 1] = y + distortionY;
        }
        
        this.wireframe.geometry.attributes.position.needsUpdate = true;
    }
    
    resetWireframe() {
        this.wireframeControls = {
            rotation: { x: 0, y: 0, z: 0 },
            scale: { x: 1, y: 1, z: 1 },
            position: { x: 0, y: 0, z: 0 },
            distortion: 0
        };
        this.updateWireframeTransform();
    }
    
    toggleWireframeInteraction() {
        this.isWireframeInteractive = !this.isWireframeInteractive;
        
        if (this.isWireframeInteractive) {
            // Masquer le wireframe CSS
            const wallpaper = document.getElementById('wallpaper');
            if (wallpaper) {
                wallpaper.style.opacity = '0';
            }
            
            // Afficher les instructions
            this.showWireframeInstructions();
        } else {
            // Restaurer le wireframe CSS
            const wallpaper = document.getElementById('wallpaper');
            if (wallpaper) {
                wallpaper.style.opacity = '0.3';
            }
            
            // Masquer les instructions
            this.hideWireframeInstructions();
        }
        
        console.log(`Wireframe 3D ${this.isWireframeInteractive ? 'activé' : 'désactivé'}`);
    }
    
    showWireframeInstructions() {
        // Créer ou mettre à jour les instructions
        let instructions = document.getElementById('wireframe-instructions');
        if (!instructions) {
            instructions = document.createElement('div');
            instructions.id = 'wireframe-instructions';
            instructions.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                color: #ff4444;
                padding: 15px;
                border: 1px solid #ff4444;
                border-radius: 5px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                z-index: 10001;
                max-width: 250px;
            `;
            document.body.appendChild(instructions);
        }
        
        instructions.innerHTML = `
            <strong>Contrôles Wireframe 3D:</strong><br>
            • Flèches: Déplacer<br>
            • R/T/Y: Rotation<br>
            • +/-: Échelle<br>
            • D: Déformation<br>
            • Espace: Reset<br>
            • Clic: Activer/Désactiver
        `;
    }
    
    hideWireframeInstructions() {
        const instructions = document.getElementById('wireframe-instructions');
        if (instructions) {
            instructions.remove();
        }
    }
    
    setupRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        // Ajouter la gestion des clics sur le wireframe
        document.addEventListener('click', (e) => {
            if (e.target.id === 'threejs-canvas') {
                this.toggleWireframeInteraction();
            }
        });
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
        
        // Animation du wireframe 3D
        if (this.wireframeGroup && this.isWireframeInteractive) {
            // Animation de pulsation subtile
            const pulse = Math.sin(Date.now() * 0.002) * 0.05 + 1;
            this.wireframeGroup.scale.setScalar(pulse);
            
            // Animation de rotation continue si activée
            if (this.wireframeControls.rotation.y !== 0) {
                this.wireframeGroup.rotation.y += 0.01;
            }
        }
        
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
        
        // Masquer toutes les fenêtres au démarrage
        const allWindows = document.querySelectorAll('.window');
        allWindows.forEach(window => {
            window.classList.add('hidden');
        });
        
        // Précharger tous les éléments et ressources
        this.preloadAllResources().then(() => {
            console.log('✅ Toutes les ressources sont chargées');
            
            // Attendre un délai minimum pour l'expérience utilisateur
            setTimeout(() => {
                // Faire disparaître l'écran de chargement
                loadingScreen.classList.add('fade-out');
                
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                    
                    // Animation séquentielle des éléments
                    // 1. Wireframe du background (CSS par défaut, pas 3D automatiquement)
                    setTimeout(() => {
                        // Garder le wireframe CSS par défaut, l'utilisateur pourra basculer manuellement
                        const wallpaper = document.getElementById('wallpaper');
                        if (wallpaper) {
                            wallpaper.style.opacity = '0.3';
                        }
                        
                        // Mettre à jour le bouton pour indiquer le mode CSS
                        const wireframeToggle = document.getElementById('wireframe-toggle');
                        if (wireframeToggle) {
                            wireframeToggle.classList.remove('active');
                            wireframeToggle.querySelector('span').textContent = 'Wireframe CSS';
                        }
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
                
            }, 1000); // Délai minimum de chargement
            
        }).catch(error => {
            console.error('❌ Erreur lors du préchargement:', error);
            // En cas d'erreur, continuer quand même
            this.continueAfterLoading();
        });
    }
    
    preloadAllResources() {
        return new Promise((resolve, reject) => {
            const resources = [
                // Images
                'images/icons/gameiconHD.png',
                'images/icons/gameicon.png',
                'images/00107-1051047528.png',
                'images/header.png',
                'images/header2.png',
                // Fichiers du jeu
                'game/game.html',
                'game/game.js',
                'game/game.wasm',
                'game/game.pck',
                // Three.js (déjà chargé via CDN)
                // Autres ressources
                'styles.css',
                'script.js'
            ];
            
            let loadedCount = 0;
            const totalResources = resources.length;
            
            console.log(`🔄 Préchargement de ${totalResources} ressources...`);
            this.updateLoadingProgress(0, 'Initialisation...');
            
            const checkResource = (url) => {
                return new Promise((resolveResource) => {
                    if (url.endsWith('.css') || url.endsWith('.js')) {
                        // Les fichiers CSS et JS sont déjà chargés
                        loadedCount++;
                        this.updateLoadingProgress(loadedCount, totalResources, `Chargement de ${url}`);
                        resolveResource();
                        return;
                    }
                    
                    if (url.endsWith('.wasm') || url.endsWith('.pck')) {
                        // Les fichiers binaires sont plus lents à charger
                        setTimeout(() => {
                            loadedCount++;
                            this.updateLoadingProgress(loadedCount, totalResources, `Chargement de ${url}`);
                            resolveResource();
                        }, 500);
                        return;
                    }
                    
                    const img = new Image();
                    img.onload = () => {
                        loadedCount++;
                        this.updateLoadingProgress(loadedCount, totalResources, `Image chargée: ${url}`);
                        console.log(`✅ Ressource chargée: ${url}`);
                        resolveResource();
                    };
                    img.onerror = () => {
                        loadedCount++;
                        this.updateLoadingProgress(loadedCount, totalResources, `Ressource non trouvée: ${url}`);
                        console.warn(`⚠️ Ressource non trouvée: ${url}`);
                        resolveResource(); // Continuer même en cas d'erreur
                    };
                    img.src = url;
                });
            };
            
            // Charger toutes les ressources en parallèle
            Promise.all(resources.map(checkResource)).then(() => {
                this.updateLoadingProgress(totalResources, totalResources, 'Chargement terminé !');
                console.log('✅ Préchargement terminé');
                resolve();
            });
        });
    }
    
    updateLoadingProgress(loaded, total, status) {
        const loadingFill = document.getElementById('loading-fill');
        const loadingPercentage = document.getElementById('loading-percentage');
        const loadingStatus = document.getElementById('loading-status');
        
        if (loadingFill && loadingPercentage && loadingStatus) {
            const percentage = Math.round((loaded / total) * 100);
            loadingFill.style.width = percentage + '%';
            loadingPercentage.textContent = percentage + '%';
            loadingStatus.textContent = status;
        }
    }
    
    continueAfterLoading() {
        const loadingScreen = document.getElementById('loading-screen');
        const wallpaper = document.getElementById('wallpaper');
        const desktop = document.getElementById('desktop');
        const taskbar = document.getElementById('taskbar');
        const startMenu = document.getElementById('start-menu');
        const windowsContainer = document.getElementById('windows-container');
        
        // Faire disparaître l'écran de chargement
        loadingScreen.classList.add('fade-out');
        
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            
            // Animation séquentielle des éléments
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
            
            // Initialiser RetroOS après les animations
            setTimeout(() => {
                this.initializeRetroOS();
            }, 1000);
            
        }, 500);
    }
    
    initializeRetroOS() {
        this.setupEventListeners();
        this.setupCustomCursor();
        this.setupRippleEffect();
        this.updateClock();
        this.startClock();
        this.positionWindows();
        
        // Initialiser Three.js en dernier pour s'assurer que tout est prêt
        setTimeout(() => {
            this.initializeThreeJS();
        }, 500);
        
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
            
            // S'assurer que le wireframe CSS est visible par défaut
            const wallpaper = document.getElementById('wallpaper');
            if (wallpaper) {
                wallpaper.style.opacity = '0.3';
            }
            
            console.log('✅ Three.js intégré dans RetroOS');
            console.log('ℹ️ Wireframe CSS activé par défaut - Utilisez le bouton pour basculer vers le mode 3D');
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
        
        // Bouton de basculement wireframe
        const wireframeToggle = document.getElementById('wireframe-toggle');
        if (wireframeToggle) {
            wireframeToggle.addEventListener('click', () => {
                console.log('◊ Bouton wireframe cliqué !');
                this.toggleWireframeMode();
            });
            console.log('✅ Événement attaché au bouton wireframe');
        } else {
            console.error('❌ Bouton wireframe non trouvé !');
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
    
    toggleWireframeMode() {
        const wallpaper = document.getElementById('wallpaper');
        const wireframeToggle = document.getElementById('wireframe-toggle');
        
        if (this.threeJSRenderer && this.threeJSRenderer.isInitialized) {
            this.threeJSRenderer.toggleWireframeInteraction();
            
            // Mettre à jour l'état du bouton et la visibilité
            if (this.threeJSRenderer.isWireframeInteractive) {
                // Mode 3D activé
                if (wireframeToggle) {
                    wireframeToggle.classList.add('active');
                    wireframeToggle.querySelector('span').textContent = 'Wireframe 3D';
                }
                if (wallpaper) {
                    wallpaper.style.opacity = '0'; // Masquer le wireframe CSS
                }
                console.log('◊ Mode Wireframe 3D activé');
            } else {
                // Mode CSS activé
                if (wireframeToggle) {
                    wireframeToggle.classList.remove('active');
                    wireframeToggle.querySelector('span').textContent = 'Wireframe CSS';
                }
                if (wallpaper) {
                    wallpaper.style.opacity = '0.3'; // Afficher le wireframe CSS
                }
                console.log('◊ Mode Wireframe CSS activé');
            }
        } else {
            // Three.js pas encore initialisé, basculer vers le mode CSS
            if (wireframeToggle) {
                wireframeToggle.classList.remove('active');
                wireframeToggle.querySelector('span').textContent = 'Wireframe CSS';
            }
            if (wallpaper) {
                wallpaper.style.opacity = '0.3';
            }
            console.log('⚠️ Three.js non initialisé, mode CSS forcé');
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
            download: '📥 Télécharger'
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
        
        // Ne plus ouvrir automatiquement la fenêtre du jeu
        // this.openWindow('game');
        
        // setTimeout(() => {
        //     // Minimiser la fenêtre
        //     this.minimizeWindow('game');
        //     console.log('🧪 Fenêtre minimisée, testez le clic dans la barre des tâches');
            
        //     // Vérifier l'état
        //     const windowData = this.windows.get('game');
        //     console.log('🧪 État de la fenêtre game:', windowData);
            
        //     const runningApp = document.querySelector('.running-app[data-app="game"]');
        //     console.log('🧪 App dans la barre des tâches:', runningApp);
            
        //     if (runningApp) {
        //     console.log('🧪 Gestionnaire d\'événement attaché:', runningApp._clickHandler);
        //     }
        // }, 1000);
        
        console.log('🧪 Test de la barre des tâches désactivé - Fenêtre du jeu masquée au démarrage');
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
                
                // Appliquer l'effet de déformation et de luminosité au wireframe 3D
                this.applyWireframeRippleEffect(x, y, size, i * 50);
                
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
    
    applyWireframeRippleEffect(x, y, size, delay) {
        // Vérifier si le renderer Three.js est disponible et actif
        if (!this.threeJSRenderer || !this.threeJSRenderer.isInitialized || 
            !this.threeJSRenderer.wireframe || !this.threeJSRenderer.wireframe.geometry) {
            console.log('⚠️ Three.js non disponible pour l\'effet de ripple');
            return;
        }
        
        try {
            // Convertir les coordonnées de l'écran en coordonnées du wireframe 3D
            const rect = document.getElementById('wallpaper');
            if (!rect) {
                console.log('⚠️ Élément wallpaper non trouvé');
                return;
            }
            
            const wallpaperRect = rect.getBoundingClientRect();
            
            // Normaliser les coordonnées par rapport au centre de l'écran
            const centerX = wallpaperRect.width / 2;
            const centerY = wallpaperRect.height / 2;
            
            // Convertir en coordonnées relatives au centre (-1 à 1)
            const normalizedX = (x - centerX) / centerX;
            const normalizedY = (y - centerY) / centerY;
            
            // Convertir en coordonnées du wireframe 3D (échelle 10x10)
            const wireframeX = normalizedX * 10;
            const wireframeY = -normalizedY * 10; // Inverser Y pour Three.js
            
            // Calculer le rayon de l'effet (plus grand pour être visible)
            const effectRadius = Math.max(size / 50, 0.5); // Minimum 0.5 unités
            
            console.log(`🌊 Application de l'effet ripple:`, {
                screenPos: `(${x}, ${y})`,
                normalized: `(${normalizedX.toFixed(2)}, ${normalizedY.toFixed(2)})`,
                wireframePos: `(${wireframeX.toFixed(2)}, ${wireframeY.toFixed(2)})`,
                radius: effectRadius.toFixed(2)
            });
            
            // Appliquer l'effet avec un délai pour synchroniser avec l'animation CSS
            setTimeout(() => {
                this.createWireframeShockwave(wireframeX, wireframeY, effectRadius, delay);
            }, delay);
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'application de l\'effet ripple au wireframe:', error);
        }
    }
    
    createWireframeShockwave(centerX, centerY, radius, delay) {
        if (!this.threeJSRenderer || !this.threeJSRenderer.wireframe) return;
        
        const wireframe = this.threeJSRenderer.wireframe;
        const geometry = wireframe.geometry;
        const material = wireframe.material;
        const positions = geometry.attributes.position.array;
        const colors = geometry.attributes.color.array;
        
        // Créer une copie des positions originales si elle n'existe pas
        if (!wireframe.userData.originalPositions) {
            wireframe.userData.originalPositions = new Float32Array(positions);
        }
        
        // Créer une copie des couleurs originales si elle n'existe pas
        if (!wireframe.userData.originalColors) {
            wireframe.userData.originalColors = new Float32Array(colors);
        }
        
        // Créer une animation d'onde de choc progressive avec effet liquide
        const startTime = Date.now();
        const animationDuration = 1200; // 1.2s pour l'animation complète
        
        // Créer des particules d'effet visuel
        this.createRippleParticles(centerX, centerY, radius);
        
        const animateShockwave = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // Calculer le rayon actuel de l'onde de choc (expansion progressive)
            const currentRadius = radius * 4 * progress;
            
            // Réinitialiser les positions et couleurs
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] = wireframe.userData.originalPositions[i];
                positions[i + 1] = wireframe.userData.originalPositions[i + 1];
                positions[i + 2] = wireframe.userData.originalPositions[i + 2];
                
                const colorIndex = i / 3 * 3;
                if (colors[colorIndex] !== undefined) {
                    colors[colorIndex] = wireframe.userData.originalColors[colorIndex];
                    colors[colorIndex + 1] = wireframe.userData.originalColors[colorIndex + 1];
                    colors[colorIndex + 2] = wireframe.userData.originalColors[colorIndex + 2];
                }
            }
            
            // Appliquer l'effet d'onde de choc liquide
            for (let i = 0; i < positions.length; i += 3) {
                const x = wireframe.userData.originalPositions[i];
                const y = wireframe.userData.originalPositions[i + 1];
                const z = wireframe.userData.originalPositions[i + 2];
                
                // Calculer la distance du point au centre de l'onde de choc
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
                
                if (distance <= currentRadius) {
                    // Calculer l'intensité de l'effet (plus fort au centre, diminue avec la distance)
                    const intensity = Math.max(0, 1 - distance / currentRadius);
                    
                    // Effet de déformation liquide avec plusieurs ondes superposées
                    const waveSpeed = Date.now() * 0.015;
                    const wave1 = Math.sin(distance * 8 - waveSpeed) * intensity * 0.8;
                    const wave2 = Math.sin(distance * 12 - waveSpeed * 1.5) * intensity * 0.6;
                    const wave3 = Math.cos(distance * 6 - waveSpeed * 0.8) * intensity * 0.4;
                    
                    // Combiner les ondes pour un effet liquide
                    const totalWaveEffect = (wave1 + wave2 + wave3) / 3;
                    
                    // Déformation du wireframe (effet liquide prononcé)
                    positions[i] = x + totalWaveEffect * 0.4; // Déformation X
                    positions[i + 1] = y + totalWaveEffect * 0.4; // Déformation Y
                    positions[i + 2] = z + totalWaveEffect * 0.2; // Déformation Z
                    
                    // Augmentation de la luminosité avec effet de pulsation liquide
                    const colorIndex = i / 3 * 3;
                    if (colors[colorIndex] !== undefined) {
                        // Effet de luminosité pulsante plus prononcé
                        const brightnessPulse = Math.sin(waveSpeed * 3) * 0.3;
                        const brightnessMultiplier = 2.0 + brightnessPulse; // 1.7x à 2.3x
                        
                        // Appliquer l'augmentation de luminosité
                        colors[colorIndex] = Math.min(1, wireframe.userData.originalColors[colorIndex] * brightnessMultiplier);
                        colors[colorIndex + 1] = Math.min(1, wireframe.userData.originalColors[colorIndex + 1] * brightnessMultiplier);
                        colors[colorIndex + 2] = Math.min(1, wireframe.userData.originalColors[colorIndex + 2] * brightnessMultiplier);
                        
                        // Ajouter un effet de couleur rougeâtre pour l'onde de choc
                        if (intensity > 0.5) {
                            colors[colorIndex] = Math.min(1, colors[colorIndex] + intensity * 0.3);
                            colors[colorIndex + 1] = Math.max(0, colors[colorIndex + 1] - intensity * 0.2);
                            colors[colorIndex + 2] = Math.max(0, colors[colorIndex + 2] - intensity * 0.2);
                        }
                    }
                }
            }
            
            // Mettre à jour la géométrie
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.color.needsUpdate = true;
            
            // Continuer l'animation si elle n'est pas terminée
            if (progress < 1) {
                requestAnimationFrame(animateShockwave);
            } else {
                // Animation terminée, restaurer l'état original progressivement
                setTimeout(() => {
                    this.restoreWireframeOriginalState();
                }, 300);
            }
        };
        
        // Démarrer l'animation
        animateShockwave();
        
        // Effet sur le matériau (opacité et intensité)
        if (material.userData) {
            material.userData.rippleIntensity = 1;
            material.opacity = Math.min(1, material.userData.originalOpacity * 1.8);
        }
        
        console.log(`🌊 Onde de choc créée à (${centerX.toFixed(2)}, ${centerY.toFixed(2)}) avec rayon ${radius.toFixed(2)}`);
    }
    
    createRippleParticles(centerX, centerY, radius) {
        if (!this.threeJSRenderer || !this.threeJSRenderer.scene) return;
        
        try {
            // Créer un groupe de particules pour l'effet visuel
            const particleGroup = new THREE.Group();
            particleGroup.name = 'ripple-particles';
            
            // Créer plusieurs particules
            const particleCount = 8;
            for (let i = 0; i < particleCount; i++) {
                const particle = new THREE.Mesh(
                    new THREE.SphereGeometry(0.05, 8, 6),
                    new THREE.MeshBasicMaterial({
                        color: 0xff4444,
                        transparent: true,
                        opacity: 0.8
                    })
                );
                
                // Positionner les particules en cercle autour du centre
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = radius * (0.5 + Math.random() * 0.5);
                particle.position.set(
                    centerX + Math.cos(angle) * distance,
                    centerY + Math.sin(angle) * distance,
                    0.1
                );
                
                // Animation de la particule
                particle.userData = {
                    originalPosition: particle.position.clone(),
                    startTime: Date.now(),
                    duration: 1000 + Math.random() * 500
                };
                
                particleGroup.add(particle);
            }
            
            // Ajouter le groupe à la scène
            this.threeJSRenderer.scene.add(particleGroup);
            
            // Animer les particules
            const animateParticles = () => {
                let allFinished = true;
                
                particleGroup.children.forEach(particle => {
                    const elapsed = Date.now() - particle.userData.startTime;
                    const progress = Math.min(elapsed / particle.userData.duration, 1);
                    
                    if (progress < 1) {
                        allFinished = false;
                        
                        // Expansion et fade-out
                        const scale = 1 + progress * 3;
                        particle.scale.setScalar(scale);
                        particle.material.opacity = 0.8 * (1 - progress);
                        
                        // Mouvement vers l'extérieur
                        const direction = particle.position.clone().sub(new THREE.Vector3(centerX, centerY, 0)).normalize();
                        particle.position.copy(particle.userData.originalPosition).add(direction.multiplyScalar(progress * radius * 2));
                    }
                });
                
                if (!allFinished) {
                    requestAnimationFrame(animateParticles);
                } else {
                    // Nettoyer les particules
                    this.threeJSRenderer.scene.remove(particleGroup);
                }
            };
            
            animateParticles();
            
        } catch (error) {
            console.error('❌ Erreur lors de la création des particules:', error);
        }
    }
    
    restoreWireframeOriginalState() {
        if (!this.threeJSRenderer || !this.threeJSRenderer.wireframe) return;
        
        const wireframe = this.threeJSRenderer.wireframe;
        const geometry = wireframe.geometry;
        const material = wireframe.material;
        
        // Créer une animation de restauration fluide avec effet de rebond
        const startTime = Date.now();
        const restoreDuration = 800; // 800ms pour la restauration
        
        const animateRestore = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / restoreDuration, 1);
            
            // Fonction d'easing avec rebond
            const easeOutBounce = (t) => {
                if (t < 1 / 2.75) {
                    return 7.5625 * t * t;
                } else if (t < 2 / 2.75) {
                    return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
                } else if (t < 2.5 / 2.75) {
                    return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
                } else {
                    return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
                }
            };
            
            const easedProgress = easeOutBounce(progress);
            
            if (wireframe.userData.originalPositions && wireframe.userData.originalColors) {
                const positions = geometry.attributes.position.array;
                const colors = geometry.attributes.color.array;
                
                // Restaurer progressivement les positions avec effet de rebond
                for (let i = 0; i < positions.length; i += 3) {
                    const originalX = wireframe.userData.originalPositions[i];
                    const originalY = wireframe.userData.originalPositions[i + 1];
                    const originalZ = wireframe.userData.originalPositions[i + 2];
                    
                    const currentX = positions[i];
                    const currentY = positions[i + 1];
                    const currentZ = positions[i + 2];
                    
                    // Interpolation avec rebond
                    positions[i] = currentX + (originalX - currentX) * easedProgress;
                    positions[i + 1] = currentY + (originalY - currentY) * easedProgress;
                    positions[i + 2] = currentZ + (originalZ - currentZ) * easedProgress;
                    
                    // Restaurer progressivement les couleurs
                    const colorIndex = i / 3 * 3;
                    if (colors[colorIndex] !== undefined) {
                        const originalR = wireframe.userData.originalColors[colorIndex];
                        const originalG = wireframe.userData.originalColors[colorIndex + 1];
                        const originalB = wireframe.userData.originalColors[colorIndex + 2];
                        
                        const currentR = colors[colorIndex];
                        const currentG = colors[colorIndex + 1];
                        const currentB = colors[colorIndex + 2];
                        
                        colors[colorIndex] = currentR + (originalR - currentR) * easedProgress;
                        colors[colorIndex + 1] = currentG + (originalG - currentG) * easedProgress;
                        colors[colorIndex + 2] = currentB + (originalB - currentB) * easedProgress;
                    }
                }
                
                // Mettre à jour la géométrie
                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.color.needsUpdate = true;
            }
            
            // Restaurer progressivement les propriétés du matériau
            if (material.userData) {
                const originalOpacity = material.userData.originalOpacity;
                const currentOpacity = material.opacity;
                material.opacity = currentOpacity + (originalOpacity - currentOpacity) * easedProgress;
            }
            
            // Continuer l'animation si elle n'est pas terminée
            if (progress < 1) {
                requestAnimationFrame(animateRestore);
            } else {
                // Animation terminée, finaliser la restauration
                if (material.userData) {
                    material.userData.rippleIntensity = 0;
                    material.opacity = material.userData.originalOpacity;
                }
                console.log('🌊 Restauration du wireframe terminée');
            }
        };
        
        // Démarrer l'animation de restauration
        animateRestore();
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
