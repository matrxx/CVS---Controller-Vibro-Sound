/**
 * UIController - Contrôleur de l'interface utilisateur
 * Responsable des interactions entre l'UI et la logique métier
 */
class UIController {
    constructor(components) {
        this.gamepadManager = components.gamepadManager;
        this.vibrationEngine = components.vibrationEngine;
        this.sequencer = components.sequencer;
        this.patternManager = components.patternManager;
        
        this.elements = {};
        this.currentSteps = 16;
    }
    
    /**
     * Initialiser l'interface utilisateur
     */
    initialize() {
        console.log('🎨 Initialisation de l\'interface utilisateur...');
        
        try {
            this.cacheElements();
            this.setupEventListeners();
            this.createPatternGrid();
            this.loadPresetButtons();
            this.updateUI();
            
            console.log('✅ Interface utilisateur initialisée avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de l\'initialisation de l\'UI:', error);
        }
    }
    
    /**
     * Mettre en cache les éléments DOM
     */
    cacheElements() {
        this.elements = {
            // Transport
            playBtn: document.getElementById('playBtn'),
            stopBtn: document.getElementById('stopBtn'),
            clearBtn: document.getElementById('clearBtn'),
            
            // Tempo
            bpmSlider: document.getElementById('bpmSlider'),
            bpmDisplay: document.getElementById('bpmDisplay'),
            
            // Intensité
            weakIntensity: document.getElementById('weakIntensity'),
            strongIntensity: document.getElementById('strongIntensity'),
            weakValue: document.getElementById('weakValue'),
            strongValue: document.getElementById('strongValue'),
            
            // Tests
            testWeakBtn: document.getElementById('testWeakBtn'),
            testStrongBtn: document.getElementById('testStrongBtn'),
            testBothBtn: document.getElementById('testBothBtn'),
            
            // Pattern
            presetButtons: document.getElementById('presetButtons'),
            savePatternBtn: document.getElementById('savePatternBtn'),
            loadPatternBtn: document.getElementById('loadPatternBtn'),
            patternFileInput: document.getElementById('patternFileInput'),
            
            // Séquenceur
            noteGrid: document.getElementById('noteGrid'),
            stepsSelect: document.getElementById('stepsSelect'),
            stepIndicator: document.getElementById('stepIndicator'),
            
            // Status
            gamepadStatus: document.getElementById('gamepadStatus'),
            
            // Info
            patternInfo: document.getElementById('patternInfo'),
            playbackInfo: document.getElementById('playbackInfo')
        };
    }
    
    /**
     * Configurer les event listeners
     */
    setupEventListeners() {
        // Transport
        if (this.elements.playBtn) {
            this.elements.playBtn.addEventListener('click', () => {
                this.sequencer.play();
            });
        }
        
        if (this.elements.stopBtn) {
            this.elements.stopBtn.addEventListener('click', () => {
                this.sequencer.stop();
            });
        }
        
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => {
                this.patternManager.clearPattern();
                this.updatePatternDisplay();
            });
        }
        
        // Tempo
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.addEventListener('input', (e) => {
                const bpm = parseInt(e.target.value);
                this.sequencer.setBPM(bpm);
                if (this.elements.bpmDisplay) {
                    this.elements.bpmDisplay.textContent = bpm.toString();
                }
            });
        }
        
        // Intensité
        if (this.elements.weakIntensity) {
            this.elements.weakIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.vibrationEngine.setGlobalIntensity(value, this.vibrationEngine.globalIntensity.strong);
                if (this.elements.weakValue) {
                    this.elements.weakValue.textContent = `${Math.round(value * 100)}%`;
                }
            });
        }
        
        if (this.elements.strongIntensity) {
            this.elements.strongIntensity.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.vibrationEngine.setGlobalIntensity(this.vibrationEngine.globalIntensity.weak, value);
                if (this.elements.strongValue) {
                    this.elements.strongValue.textContent = `${Math.round(value * 100)}%`;
                }
            });
        }
        
        // Tests de vibration
        if (this.elements.testWeakBtn) {
            this.elements.testWeakBtn.addEventListener('click', () => {
                this.vibrationEngine.testVibration('weak');
            });
        }
        
        if (this.elements.testStrongBtn) {
            this.elements.testStrongBtn.addEventListener('click', () => {
                this.vibrationEngine.testVibration('strong');
            });
        }
        
        if (this.elements.testBothBtn) {
            this.elements.testBothBtn.addEventListener('click', () => {
                this.vibrationEngine.testVibration('both');
            });
        }
        
        // Gestion des patterns
        if (this.elements.savePatternBtn) {
            this.elements.savePatternBtn.addEventListener('click', () => {
                this.savePattern();
            });
        }
        
        if (this.elements.loadPatternBtn) {
            this.elements.loadPatternBtn.addEventListener('click', () => {
                if (this.elements.patternFileInput) {
                    this.elements.patternFileInput.click();
                }
            });
        }
        
        if (this.elements.patternFileInput) {
            this.elements.patternFileInput.addEventListener('change', (e) => {
                this.loadPatternFromFile(e.target.files[0]);
            });
        }
        
        // Nombre de pas
        if (this.elements.stepsSelect) {
            this.elements.stepsSelect.addEventListener('change', (e) => {
                const steps = parseInt(e.target.value);
                this.changeSteps(steps);
            });
        }
    }
    
    /**
     * Créer la grille du pattern
     */
    createPatternGrid() {
        const grid = document.getElementById('noteGrid');
        if (!grid) {
            console.error('Élément noteGrid non trouvé dans le DOM');
            return;
        }
        
        grid.innerHTML = '';
        
        // Définir le nombre de colonnes CSS
        grid.style.setProperty('--grid-steps', this.currentSteps);
        
        // Header vide pour l'alignement
        const emptyHeader = document.createElement('div');
        emptyHeader.className = 'instrument-label';
        emptyHeader.textContent = '';
        grid.appendChild(emptyHeader);
        
        // En-têtes des pas avec numéros
        for (let step = 0; step < this.currentSteps; step++) {
            const stepHeader = document.createElement('div');
            stepHeader.className = 'step-number';
            stepHeader.textContent = (step + 1).toString();
            stepHeader.id = `step-header-${step}`;
            grid.appendChild(stepHeader);
        }
        
        // Lignes des instruments
        this.patternManager.instruments.forEach(instrument => {
            // Label de l'instrument
            const label = document.createElement('div');
            label.className = 'instrument-label';
            label.textContent = instrument;
            label.setAttribute('data-instrument', instrument);
            grid.appendChild(label);
            
            // Cases pour chaque pas
            for (let step = 0; step < this.currentSteps; step++) {
                const stepCell = document.createElement('div');
                stepCell.className = 'step-cell';
                stepCell.id = `${instrument}-${step}`;
                stepCell.setAttribute('data-instrument', instrument);
                stepCell.setAttribute('data-step', step);
                stepCell.onclick = () => this.toggleStep(instrument, step);
                stepCell.setAttribute('tabindex', '0');
                
                // Support clavier
                stepCell.addEventListener('keydown', (e) => {
                    if (e.code === 'Space' || e.code === 'Enter') {
                        e.preventDefault();
                        this.toggleStep(instrument, step);
                    }
                });
                
                grid.appendChild(stepCell);
            }
        });
        
        // Mettre à jour l'affichage du pattern
        this.updatePatternDisplay();
    }
    
    /**
     * Basculer un pas du pattern
     */
    toggleStep(instrument, step) {
        this.patternManager.toggleStep(instrument, step);
        this.updatePatternDisplay();
        this.sequencer.setPattern(this.patternManager.getCurrentPattern());
        
        // Prévisualiser le son
        this.vibrationEngine.playNote(instrument, { intensityMultiplier: 0.7 });
    }
    
    /**
     * Mettre à jour l'affichage du pattern
     */
    updatePatternDisplay() {
        const pattern = this.patternManager.getCurrentPattern();
        
        Object.keys(pattern).forEach(instrument => {
            pattern[instrument].forEach((active, step) => {
                const element = document.getElementById(`${instrument}-${step}`);
                if (element) {
                    element.classList.toggle('active', active);
                }
            });
        });
        
        this.updatePatternInfo();
    }
    
    /**
     * Mettre à jour l'indicateur de pas actuel
     */
    updateStepIndicator(currentStep) {
        // Mettre à jour la barre de progression
        const progressFill = document.getElementById('stepIndicator');
        if (progressFill) {
            const progress = ((currentStep + 1) / this.currentSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
        
        // Mettre à jour les headers de pas
        document.querySelectorAll('.step-number').forEach((header, index) => {
            header.classList.toggle('active', index === currentStep);
        });
        
        // Mettre à jour les cellules en cours de lecture
        this.updatePlayingCells(currentStep);
    }
    
    /**
     * Mettre à jour les cellules en cours de lecture
     */
    updatePlayingCells(currentStep) {
        // Effacer les indicateurs précédents
        document.querySelectorAll('.step-cell.playing').forEach(el => {
            el.classList.remove('playing');
        });
        
        // Ajouter l'indicateur au pas actuel
        const pattern = this.patternManager.getCurrentPattern();
        Object.keys(pattern).forEach(instrument => {
            if (pattern[instrument][currentStep]) {
                const element = document.getElementById(`${instrument}-${currentStep}`);
                if (element) {
                    element.classList.add('playing');
                }
            }
        });
    }
    
    /**
     * Charger les boutons de presets
     */
    loadPresetButtons() {
        const container = document.getElementById('presetButtons');
        if (!container) return;
        
        container.innerHTML = '';
        
        const presets = this.patternManager.getPresets();
        
        Object.keys(presets).forEach(presetName => {
            const button = document.createElement('button');
            button.textContent = presets[presetName].name || presetName;
            button.className = 'preset-btn';
            button.title = presets[presetName].description || '';
            button.onclick = () => this.loadPreset(presetName);
            container.appendChild(button);
        });
    }
    
    /**
     * Charger un preset
     */
    loadPreset(presetName) {
        this.patternManager.loadPreset(presetName);
        this.updatePatternDisplay();
        this.sequencer.setPattern(this.patternManager.getCurrentPattern());
        
        console.log(`Preset chargé: ${presetName}`);
    }
    
    /**
     * Changer le nombre de pas
     */
    changeSteps(steps) {
        this.currentSteps = steps;
        this.patternManager.resizePattern(steps);
        this.sequencer.setTotalSteps(steps);
        this.createPatternGrid();
        
        console.log(`Nombre de pas changé: ${steps}`);
    }
    
    /**
     * Sauvegarder le pattern
     */
    savePattern() {
        const data = this.patternManager.exportPattern();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `pattern_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('Pattern sauvegardé');
    }
    
    /**
     * Charger un pattern depuis un fichier
     */
    async loadPatternFromFile(file) {
        if (!file) return;
        
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (this.patternManager.importPattern(data)) {
                this.updatePatternDisplay();
                this.sequencer.setPattern(this.patternManager.getCurrentPattern());
                console.log('Pattern chargé depuis le fichier');
            } else {
                throw new Error('Format de fichier invalide');
            }
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            alert('Erreur lors du chargement du fichier: ' + error.message);
        }
    }
    
    /**
     * Mettre à jour les informations du pattern
     */
    updatePatternInfo() {
        const stats = this.patternManager.getPatternStats();
        const density = Math.round(stats.globalDensity * 100);
        
        const patternInfo = document.getElementById('patternInfo');
        if (patternInfo) {
            patternInfo.textContent = `${density}%`;
        }
    }
    
    /**
     * Mettre à jour toute l'interface
     */
    updateUI() {
        this.updatePatternDisplay();
        
        // Mettre à jour les valeurs des sliders
        const bpm = this.sequencer.getBPM();
        if (this.elements.bpmSlider) {
            this.elements.bpmSlider.value = bpm;
        }
        if (this.elements.bpmDisplay) {
            this.elements.bpmDisplay.textContent = bpm.toString();
        }
        
        const intensity = this.vibrationEngine.globalIntensity;
        if (this.elements.weakIntensity) {
            this.elements.weakIntensity.value = intensity.weak;
        }
        if (this.elements.strongIntensity) {
            this.elements.strongIntensity.value = intensity.strong;
        }
        if (this.elements.weakValue) {
            this.elements.weakValue.textContent = `${Math.round(intensity.weak * 100)}%`;
        }
        if (this.elements.strongValue) {
            this.elements.strongValue.textContent = `${Math.round(intensity.strong * 100)}%`;
        }
    }
    
    /**
     * Afficher une notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            background: ${type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    /**
     * Activer/désactiver les contrôles
     */
    setControlsEnabled(enabled) {
        const controls = [
            this.elements.playBtn,
            this.elements.testWeakBtn,
            this.elements.testStrongBtn,
            this.elements.testBothBtn
        ];
        
        controls.forEach(control => {
            if (control) {
                control.disabled = !enabled;
            }
        });
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.elements = {};
    }
}