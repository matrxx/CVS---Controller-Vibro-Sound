/**
 * VibrationOverlay - Overlay de visualisation des vibrations en temps réel
 * Capture et affiche les vraies vibrations de la manette
 */
class VibrationOverlay {
    constructor(vibrationEngine) {
        this.vibrationEngine = vibrationEngine;
        this.isVisible = false;
        this.overlay = null;
        
        // Données de vibration en temps réel
        this.currentVibration = { weak: 0, strong: 0 };
        this.lastVibrationTime = 0;
        
        this.init();
    }

    /**
     * Initialiser l'overlay
     */
    init() {
        this.createOverlay();
        this.setupEventListeners();
        this.hookIntoVibrationEngine();
    }

    /**
     * Créer l'overlay HTML
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'vibrationOverlay';
        this.overlay.innerHTML = `
            <div class="overlay-content">
                <div class="overlay-header">
                    <h3>🎮 Vibration Monitor</h3>
                    <button class="overlay-close" id="closeOverlay">×</button>
                </div>
                
                <div class="overlay-body">
                    <div class="controller-visual">
                        <div class="controller-body">
                            <div class="motor-zone motor-left">
                                <div class="motor-core" id="overlayMotorLeft"></div>
                                <div class="motor-label">Weak Motor</div>
                                <div class="motor-value" id="overlayWeakValue">0%</div>
                            </div>
                            
                            <div class="controller-center">
                                <div class="controller-logo">🎮</div>
                                <div class="controller-status" id="controllerStatus">Ready</div>
                            </div>
                            
                            <div class="motor-zone motor-right">
                                <div class="motor-core" id="overlayMotorRight"></div>
                                <div class="motor-label">Strong Motor</div>
                                <div class="motor-value" id="overlayStrongValue">0%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="vibration-meters">
                        <div class="meter-container">
                            <label>Weak Motor</label>
                            <div class="meter-bar">
                                <div class="meter-fill weak-fill" id="overlayWeakMeter"></div>
                            </div>
                        </div>
                        <div class="meter-container">
                            <label>Strong Motor</label>
                            <div class="meter-bar">
                                <div class="meter-fill strong-fill" id="overlayStrongMeter"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="demo-controls">
                        <button class="demo-btn" onclick="vibrationOverlay.testVibration('weak')">Test Weak</button>
                        <button class="demo-btn" onclick="vibrationOverlay.testVibration('strong')">Test Strong</button>
                        <button class="demo-btn" onclick="vibrationOverlay.testVibration('both')">Test Both</button>
                    </div>
                    
                    <div class="info-text">
                        <p>🎮 Visualisation temps réel des vibrations</p>
                        <p>Les moteurs s'activent automatiquement pendant la lecture des patterns</p>
                    </div>
                </div>
            </div>
        `;
        
        // Styles CSS intégrés
        const style = document.createElement('style');
        style.textContent = `
            #vibrationOverlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(10px);
                z-index: 9999;
                display: none;
                align-items: center;
                justify-content: center;
                font-family: var(--font-primary);
                color: white;
            }
            
            #vibrationOverlay.visible {
                display: flex;
                animation: overlayFadeIn 0.3s ease-out;
            }
            
            @keyframes overlayFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .overlay-content {
                background: linear-gradient(135deg, rgba(26, 26, 26, 0.95), rgba(42, 42, 42, 0.95));
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 24px;
                min-width: 400px;
                max-width: 80vw;
                max-height: 80vh;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
            }
            
            .overlay-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 16px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .overlay-header h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: var(--accent-primary);
            }
            
            .overlay-close {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.2);
                color: white;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
            }
            
            .overlay-close:hover {
                background: rgba(255, 71, 87, 0.2);
                border-color: #ff4757;
                color: #ff4757;
            }
            
            .overlay-body {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }
            
            .controller-visual {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                padding: 20px;
            }
            
            .controller-body {
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                min-height: 120px;
            }
            
            .controller-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .controller-logo {
                font-size: 32px;
                opacity: 0.7;
            }
            
            .controller-status {
                font-size: 12px;
                color: var(--accent-primary);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .motor-zone {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .motor-core {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                border: 2px solid rgba(255, 255, 255, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: all 0.2s ease;
                background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent);
            }
            
            .motor-core::before {
                content: '';
                width: 20px;
                height: 20px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                opacity: 0;
                transition: all 0.2s ease;
            }
            
            .motor-core.active::before {
                opacity: 1;
                animation: motorPulse 0.3s ease-in-out;
            }
            
            .motor-core.active {
                transform: scale(1.1);
            }
            
            .motor-left .motor-core.active {
                border-color: #00ff88;
                box-shadow: 0 0 15px rgba(0, 255, 136, 0.4);
            }
            
            .motor-left .motor-core.active::before {
                background: #00ff88;
            }
            
            .motor-right .motor-core.active {
                border-color: #ff6b35;
                box-shadow: 0 0 15px rgba(255, 107, 53, 0.4);
            }
            
            .motor-right .motor-core.active::before {
                background: #ff6b35;
            }
            
            @keyframes motorPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            .motor-label {
                font-size: 10px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .motor-value {
                font-family: var(--font-mono);
                font-size: 11px;
                color: var(--accent-primary);
                font-weight: 600;
            }
            
            .vibration-meters {
                display: flex;
                justify-content: space-around;
                gap: 20px;
                background: rgba(255, 255, 255, 0.03);
                padding: 16px;
                border-radius: 8px;
            }
            
            .meter-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
                flex: 1;
            }
            
            .meter-container label {
                font-size: 10px;
                color: rgba(255, 255, 255, 0.6);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .meter-bar {
                width: 100%;
                height: 8px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
                overflow: hidden;
                position: relative;
            }
            
            .meter-fill {
                height: 100%;
                width: 0%;
                border-radius: 4px;
                transition: width 0.2s ease;
            }
            
            .weak-fill {
                background: linear-gradient(90deg, #00ff88, #26de81);
            }
            
            .strong-fill {
                background: linear-gradient(90deg, #ff6b35, #ff4757);
            }
            
            .demo-controls {
                display: flex;
                justify-content: center;
                gap: 12px;
                flex-wrap: wrap;
            }
            
            .demo-btn {
                padding: 8px 16px;
                background: linear-gradient(135deg, var(--accent-primary), #0099cc);
                border: none;
                border-radius: 6px;
                color: white;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 12px;
            }
            
            .demo-btn:hover {
                transform: translateY(-1px);
                box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
            }
            
            .info-text {
                text-align: center;
                color: rgba(255, 255, 255, 0.6);
                font-size: 12px;
                line-height: 1.4;
            }
            
            .info-text p {
                margin: 4px 0;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(this.overlay);
    }

    /**
     * Configurer les événements
     */
    setupEventListeners() {
        // Fermer l'overlay
        document.getElementById('closeOverlay').addEventListener('click', () => {
            this.hide();
        });
        
        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
        
        // Fermer en cliquant en dehors
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.hide();
            }
        });
    }

    /**
     * Hook sécurisé dans le VibrationEngine
     */
    hookIntoVibrationEngine() {
        // Intercepter la méthode playNote du VibrationEngine
        const originalPlayNote = this.vibrationEngine.playNote.bind(this.vibrationEngine);
        
        this.vibrationEngine.playNote = async (instrumentName, options = {}) => {
            const result = await originalPlayNote(instrumentName, options);
            
            // Capturer les données pour l'overlay
            if (result && this.isVisible) {
                const config = this.vibrationEngine.getInstrumentConfig(instrumentName);
                const weak = config.weak * this.vibrationEngine.globalIntensity.weak;
                const strong = config.strong * this.vibrationEngine.globalIntensity.strong;
                
                this.updateVisualization(weak, strong, config.duration);
            }
            
            return result;
        };
        
        // Intercepter la méthode playPattern
        const originalPlayPattern = this.vibrationEngine.playPattern.bind(this.vibrationEngine);
        
        this.vibrationEngine.playPattern = async (instruments, options = {}) => {
            const result = await originalPlayPattern(instruments, options);
            
            // Capturer les données pour l'overlay
            if (result && this.isVisible && instruments.length > 0) {
                const combinedConfig = this.vibrationEngine.combineInstruments(instruments);
                const weak = combinedConfig.weak * this.vibrationEngine.globalIntensity.weak;
                const strong = combinedConfig.strong * this.vibrationEngine.globalIntensity.strong;
                
                this.updateVisualization(weak, strong, combinedConfig.duration);
            }
            
            return result;
        };
        
        // Intercepter testVibration
        const originalTestVibration = this.vibrationEngine.testVibration.bind(this.vibrationEngine);
        
        this.vibrationEngine.testVibration = async (type = 'both', duration = 300) => {
            const result = await originalTestVibration(type, duration);
            
            if (result && this.isVisible) {
                let weak = 0, strong = 0;
                
                switch (type) {
                    case 'weak':
                        weak = this.vibrationEngine.globalIntensity.weak;
                        break;
                    case 'strong':
                        strong = this.vibrationEngine.globalIntensity.strong;
                        break;
                    case 'both':
                        weak = this.vibrationEngine.globalIntensity.weak;
                        strong = this.vibrationEngine.globalIntensity.strong;
                        break;
                }
                
                this.updateVisualization(weak, strong, duration);
            }
            
            return result;
        };
    }

    /**
     * Afficher l'overlay
     */
    show() {
        this.isVisible = true;
        this.overlay.classList.add('visible');
    }

    /**
     * Masquer l'overlay
     */
    hide() {
        this.isVisible = false;
        this.overlay.classList.remove('visible');
        this.resetVisualization();
    }

    /**
     * Basculer la visibilité
     */
    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }

    /**
     * Mettre à jour la visualisation
     */
    updateVisualization(weak, strong, duration = 300) {
        if (!this.isVisible) return;
        
        // Mettre à jour les données actuelles
        this.currentVibration = { weak, strong };
        this.lastVibrationTime = Date.now();
        
        // Mettre à jour les éléments visuels
        this.updateMotorVisuals(weak, strong, duration);
        this.updateMeters(weak, strong);
        this.updateStatus();
    }

    /**
     * Mettre à jour les visuels des moteurs
     */
    updateMotorVisuals(weak, strong, duration) {
        const motorLeft = document.getElementById('overlayMotorLeft');
        const motorRight = document.getElementById('overlayMotorRight');
        const weakValue = document.getElementById('overlayWeakValue');
        const strongValue = document.getElementById('overlayStrongValue');
        
        // Reset
        if (motorLeft) motorLeft.classList.remove('active');
        if (motorRight) motorRight.classList.remove('active');
        
        // Activer selon l'intensité
        if (weak > 0.05 && motorLeft) {
            motorLeft.classList.add('active');
            setTimeout(() => motorLeft.classList.remove('active'), duration);
        }
        
        if (strong > 0.05 && motorRight) {
            motorRight.classList.add('active');
            setTimeout(() => motorRight.classList.remove('active'), duration);
        }
        
        // Mettre à jour les valeurs
        if (weakValue) weakValue.textContent = `${Math.round(weak * 100)}%`;
        if (strongValue) strongValue.textContent = `${Math.round(strong * 100)}%`;
    }

    /**
     * Mettre à jour les mètres
     */
    updateMeters(weak, strong) {
        const weakMeter = document.getElementById('overlayWeakMeter');
        const strongMeter = document.getElementById('overlayStrongMeter');
        
        if (weakMeter) {
            weakMeter.style.width = `${weak * 100}%`;
            setTimeout(() => {
                weakMeter.style.width = '0%';
            }, 500);
        }
        
        if (strongMeter) {
            strongMeter.style.width = `${strong * 100}%`;
            setTimeout(() => {
                strongMeter.style.width = '0%';
            }, 500);
        }
    }

    /**
     * Mettre à jour le statut
     */
    updateStatus() {
        const status = document.getElementById('controllerStatus');
        if (status) {
            status.textContent = 'Vibrating';
            status.style.color = 'var(--accent-success)';
            
            setTimeout(() => {
                status.textContent = 'Ready';
                status.style.color = 'var(--accent-primary)';
            }, 300);
        }
    }

    /**
     * Test de vibration depuis l'overlay
     */
    testVibration(type) {
        if (this.vibrationEngine) {
            this.vibrationEngine.testVibration(type, 500);
        }
    }

    /**
     * Réinitialiser la visualisation
     */
    resetVisualization() {
        const motorLeft = document.getElementById('overlayMotorLeft');
        const motorRight = document.getElementById('overlayMotorRight');
        const weakValue = document.getElementById('overlayWeakValue');
        const strongValue = document.getElementById('overlayStrongValue');
        const weakMeter = document.getElementById('overlayWeakMeter');
        const strongMeter = document.getElementById('overlayStrongMeter');
        const status = document.getElementById('controllerStatus');
        
        if (motorLeft) motorLeft.classList.remove('active');
        if (motorRight) motorRight.classList.remove('active');
        if (weakValue) weakValue.textContent = '0%';
        if (strongValue) strongValue.textContent = '0%';
        if (weakMeter) weakMeter.style.width = '0%';
        if (strongMeter) strongMeter.style.width = '0%';
        if (status) {
            status.textContent = 'Ready';
            status.style.color = 'var(--accent-primary)';
        }
        
        this.currentVibration = { weak: 0, strong: 0 };
    }

    /**
     * Méthode pour capturer les vibrations (appelée depuis l'extérieur)
     */
    captureVibration(weak, strong) {
        this.updateVisualization(weak, strong, 300);
    }

    /**
     * Détruire l'overlay
     */
    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
    }
}