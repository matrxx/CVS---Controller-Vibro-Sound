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
        this.cacheElements();
        this.setupEventListeners();
        this.createPatternGrid();
        this.loadPresetButtons();
        this.updateUI();
        
        console.log('🎨 Interface utilisateur initialisée');
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
        this.elements.playBtn.addEventListener('click', () => {
            this.sequencer.play();
        });
        
        this.elements.stopBtn.addEventListener('click', () => {
            this.sequencer.stop();
        });
        
        this.elements.clearBtn.addEventListener('click', () => {
            this.patternManager.clearPattern();
            this.updatePatternDisplay();
        });
        
        // Tempo
        this.elements.bpmSlider.addEventListener('input', (e) => {
            const bpm = parseInt(e.target.value);
            this.sequencer.setBPM(bpm);
            this.elements.bpmDisplay.textContent = `${bpm} BPM`;
        });
        
        // Intensité
        this.elements.weakIntensity.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.vibrationEngine.setGlobalIntensity(value, this.vibrationEngine.globalIntensity.strong);
            this.elements.weakValue.textContent = `${Math.round(value * 100)}%`;
        });
        
        this.elements.strongIntensity.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.vibrationEngine.setGlobalIntensity(this.vibrationEngine.globalIntensity.weak, value);
            this.elements.strongValue.textContent = `${Math.round(value * 100)}%`;
        });
        
        // Tests de vibration
        this.elements.testWeakBtn.addEventListener('click', () => {
            this.vibrationEngine.testVibration('weak');
        });
        
        this.elements.testStrongBtn.addEventListener('click', () => {
            this.vibrationEngine.testVibration('strong');
        });
        
        this.elements.testBothBtn.addEventListener('click', () => {
            this.vibrationEngine.testVibration('both');
        });
        
        // Gestion des patterns
        this.elements.savePatternBtn.addEventListener('click', () => {
            this.savePattern();
        });
        
        this.elements.loadPatternBtn.addEventListener('click', () => {
            this.elements.patternFileInput.click();
        });
        
        this.elements.patternFileInput.addEventListener('change', (e) => {
            this.loadPatternFromFile(e.target.files[0]);
        });
        
        // Nombre de pas
        this.elements.stepsSelect.addEventListener('change', (e) => {
            const steps = parseInt(e.target.value);
            this.changeSteps(steps);
        });
    }
    
    /**
     * Créer la grille du pattern
     */
    createPatternGrid() {
        const grid = this.elements.noteGrid;
        grid.innerHTML = '';
        
        // En-tête avec numéros de pas
        grid.appendChild(this.createElement('div', '', 'note-label'));
        for (let step = 0; step < this.currentSteps; step++) {
            const header = this.createElement('div', (step + 1).toString(), 'step-header');
            grid.appendChild(header);
        }
        
        // Lignes des instruments
        this.patternManager.instruments.forEach(instrument => {
            // Label de l'instrument
            const label = this.createElement('div', instrument, 'note-label');
            grid.appendChild(label);
            
            // Cases pour chaque pas
            for (let step = 0; step < this.currentSteps; step++) {
                const noteStep = this.createElement('div', '', 'note-step');
                noteStep.id = `${instrument}-${step}`;
                noteStep.onclick = () => this.toggleStep(instrument, step);
                grid.appendChild(noteStep);
            }
        });
        
        // Mettre à jour l'affichage du pattern
        this.updatePatternDisplay();
    }
    
    /**
     * Créer un élément DOM
     */
    createElement(tag, text, className) {
        const element = document.createElement(tag);
        element.textContent = text;
        element.className = className;
        return element;
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
     * Charger les boutons de presets
     */
    loadPresetButtons() {
        const container = this.elements.presetButtons;
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
        this.elements.patternInfo.textContent = `Pattern: ${stats.activeSteps}/${stats.totalSteps} pas actifs (${density}%)`;
    }
    
    /**
     * Mettre à jour toute l'interface
     */
    updateUI() {
        this.updatePatternDisplay();
        
        // Mettre à jour les valeurs des sliders
        const bpm = this.sequencer.getBPM();
        this.elements.bpmSlider.value = bpm;
        this.elements.bpmDisplay.textContent = `${bpm} BPM`;
        
        const intensity = this.vibrationEngine.globalIntensity;
        this.elements.weakIntensity.value = intensity.weak;
        this.elements.strongIntensity.value = intensity.strong;
        this.elements.weakValue.textContent = `${Math.round(intensity.weak * 100)}%`;
        this.elements.strongValue.textContent = `${Math.round(intensity.strong * 100)}%`;
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
            background: ${type === 'error' ? 'var(--danger-color)' : 'var(--success-color)'};
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
            control.disabled = !enabled;
        });
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        // Supprimer les event listeners si nécessaire
        this.elements = {};
    }
}