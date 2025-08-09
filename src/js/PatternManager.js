/**
 * PatternManager - Gestionnaire de patterns musicaux
 * Responsable de la création, modification et sauvegarde des patterns
 */
class PatternManager {
    constructor() {
        this.currentPattern = {};
        this.presets = {};
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        
        this.instruments = [
            'Kick', 'Snare', 'Hi-Hat', 'Ride', 
            'Bass', 'Lead', 'Pad', 'FX'
        ];
        
        this.initializeEmptyPattern(16);
        this.loadDefaultPresets();
    }
    
    /**
     * Initialiser un pattern vide
     */
    initializeEmptyPattern(steps = 16) {
        this.currentPattern = {};
        this.instruments.forEach(instrument => {
            this.currentPattern[instrument] = Array(steps).fill(false);
        });
        
        this.saveToHistory();
    }
    
    /**
     * Charger les presets par défaut
     */
    loadDefaultPresets() {
        this.presets = {
            'kick': {
                name: 'Kick Pattern',
                description: 'Pattern de grosse caisse basique',
                pattern: this.createPatternFromString({
                    'Kick': '1000100010001000'
                })
            },
            'snare': {
                name: 'Snare Pattern',
                description: 'Pattern de caisse claire',
                pattern: this.createPatternFromString({
                    'Snare': '0000100000001000'
                })
            },
            'hihat': {
                name: 'Hi-Hat Pattern',
                description: 'Pattern de charleston',
                pattern: this.createPatternFromString({
                    'Hi-Hat': '1010101010101010'
                })
            },
            'bass': {
                name: 'Bass Pattern',
                description: 'Ligne de basse simple',
                pattern: this.createPatternFromString({
                    'Bass': '1000001000100000'
                })
            },
            'pulse': {
                name: 'Pulse Pattern',
                description: 'Pulsation continue',
                pattern: this.createPatternFromString({
                    'Lead': '1111111111111111'
                })
            },
            'random': {
                name: 'Random Pattern',
                description: 'Pattern aléatoire',
                pattern: this.generateRandomPattern()
            },
            'classic_rock': {
                name: 'Classic Rock',
                description: 'Pattern rock classique',
                pattern: this.createPatternFromString({
                    'Kick': '1000001000000000',
                    'Snare': '0000100000001000',
                    'Hi-Hat': '1010101010101010'
                })
            },
            'house': {
                name: 'House Beat',
                description: 'Pattern house 4/4',
                pattern: this.createPatternFromString({
                    'Kick': '1000100010001000',
                    'Hi-Hat': '0101010101010101'
                })
            }
        };
    }
    
    /**
     * Créer un pattern à partir d'une chaîne binaire
     */
    createPatternFromString(stringPattern) {
        const pattern = {};
        this.instruments.forEach(instrument => {
            pattern[instrument] = Array(16).fill(false);
        });
        
        Object.keys(stringPattern).forEach(instrument => {
            const str = stringPattern[instrument];
            pattern[instrument] = str.split('').map(char => char === '1');
        });
        
        return pattern;
    }
    
    /**
     * Générer un pattern aléatoire
     */
    generateRandomPattern(density = 0.3) {
        const pattern = {};
        this.instruments.forEach(instrument => {
            pattern[instrument] = Array(16).fill().map(() => Math.random() < density);
        });
        return pattern;
    }
    
    /**
     * Obtenir le pattern actuel
     */
    getCurrentPattern() {
        return { ...this.currentPattern };
    }
    
    /**
     * Définir le pattern actuel
     */
    setCurrentPattern(pattern) {
        this.currentPattern = this.validatePattern(pattern);
        this.saveToHistory();
    }
    
    /**
     * Valider un pattern
     */
    validatePattern(pattern) {
        const validatedPattern = {};
        
        this.instruments.forEach(instrument => {
            if (pattern[instrument] && Array.isArray(pattern[instrument])) {
                validatedPattern[instrument] = [...pattern[instrument]];
            } else {
                validatedPattern[instrument] = Array(16).fill(false);
            }
        });
        
        return validatedPattern;
    }
    
    /**
     * Basculer un pas pour un instrument
     */
    toggleStep(instrument, step) {
        if (!this.currentPattern[instrument] || step < 0 || step >= this.currentPattern[instrument].length) {
            return false;
        }
        
        this.currentPattern[instrument][step] = !this.currentPattern[instrument][step];
        this.saveToHistory();
        return true;
    }
    
    /**
     * Définir un pas pour un instrument
     */
    setStep(instrument, step, value) {
        if (!this.currentPattern[instrument] || step < 0 || step >= this.currentPattern[instrument].length) {
            return false;
        }
        
        this.currentPattern[instrument][step] = Boolean(value);
        this.saveToHistory();
        return true;
    }
    
    /**
     * Effacer tout le pattern
     */
    clearPattern() {
        this.instruments.forEach(instrument => {
            this.currentPattern[instrument] = this.currentPattern[instrument].map(() => false);
        });
        this.saveToHistory();
    }
    
    /**
     * Effacer un instrument spécifique
     */
    clearInstrument(instrument) {
        if (this.currentPattern[instrument]) {
            this.currentPattern[instrument] = this.currentPattern[instrument].map(() => false);
            this.saveToHistory();
            return true;
        }
        return false;
    }
    
    /**
     * Copier un instrument vers un autre
     */
    copyInstrument(fromInstrument, toInstrument) {
        if (this.currentPattern[fromInstrument] && this.currentPattern[toInstrument]) {
            this.currentPattern[toInstrument] = [...this.currentPattern[fromInstrument]];
            this.saveToHistory();
            return true;
        }
        return false;
    }
    
    /**
     * Inverser un instrument
     */
    invertInstrument(instrument) {
        if (this.currentPattern[instrument]) {
            this.currentPattern[instrument] = this.currentPattern[instrument].map(step => !step);
            this.saveToHistory();
            return true;
        }
        return false;
    }
    
    /**
     * Décaler un instrument (rotation)
     */
    shiftInstrument(instrument, steps) {
        if (!this.currentPattern[instrument]) {
            return false;
        }
        
        const length = this.currentPattern[instrument].length;
        const normalizedSteps = steps % length;
        
        if (normalizedSteps === 0) {
            return true;
        }
        
        const shifted = [...this.currentPattern[instrument]];
        this.currentPattern[instrument] = [
            ...shifted.slice(-normalizedSteps),
            ...shifted.slice(0, -normalizedSteps)
        ];
        
        this.saveToHistory();
        return true;
    }
    
    /**
     * Redimensionner le pattern
     */
    resizePattern(newSize) {
        const validSizes = [8, 16, 32, 64];
        if (!validSizes.includes(newSize)) {
            return false;
        }
        
        this.instruments.forEach(instrument => {
            const currentSize = this.currentPattern[instrument].length;
            
            if (newSize > currentSize) {
                // Étendre en répétant le pattern
                const repetitions = Math.ceil(newSize / currentSize);
                const extended = Array(repetitions).fill(this.currentPattern[instrument]).flat();
                this.currentPattern[instrument] = extended.slice(0, newSize);
            } else {
                // Réduire en tronquant
                this.currentPattern[instrument] = this.currentPattern[instrument].slice(0, newSize);
            }
        });
        
        this.saveToHistory();
        return true;
    }
    
    /**
     * Charger un preset
     */
    loadPreset(presetName) {
        if (this.presets[presetName]) {
            this.setCurrentPattern(this.presets[presetName].pattern);
            return true;
        }
        return false;
    }
    
    /**
     * Sauvegarder le pattern actuel comme preset
     */
    saveAsPreset(name, description = '') {
        this.presets[name] = {
            name: name,
            description: description,
            pattern: this.getCurrentPattern(),
            created: new Date().toISOString()
        };
        return true;
    }
    
    /**
     * Supprimer un preset
     */
    deletePreset(presetName) {
        if (this.presets[presetName]) {
            delete this.presets[presetName];
            return true;
        }
        return false;
    }
    
    /**
     * Obtenir la liste des presets
     */
    getPresets() {
        return { ...this.presets };
    }
    
    /**
     * Sauvegarder dans l'historique
     */
    saveToHistory() {
        // Supprimer les éléments après l'index actuel si on n'est pas à la fin
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Ajouter le nouvel état
        this.history.push(JSON.stringify(this.currentPattern));
        this.historyIndex++;
        
        // Limiter la taille de l'historique
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
    }
    
    /**
     * Annuler (Undo)
     */
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.currentPattern = JSON.parse(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }
    
    /**
     * Refaire (Redo)
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.currentPattern = JSON.parse(this.history[this.historyIndex]);
            return true;
        }
        return false;
    }
    
    /**
     * Vérifier si annuler est possible
     */
    canUndo() {
        return this.historyIndex > 0;
    }
    
    /**
     * Vérifier si refaire est possible
     */
    canRedo() {
        return this.historyIndex < this.history.length - 1;
    }
    
    /**
     * Exporter le pattern au format JSON
     */
    exportPattern() {
        return {
            pattern: this.getCurrentPattern(),
            metadata: {
                created: new Date().toISOString(),
                instruments: this.instruments,
                steps: Object.values(this.currentPattern)[0]?.length || 16
            }
        };
    }
    
    /**
     * Importer un pattern depuis JSON
     */
    importPattern(data) {
        try {
            if (data.pattern) {
                this.setCurrentPattern(data.pattern);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            return false;
        }
    }
    
    /**
     * Obtenir des statistiques sur le pattern
     */
    getPatternStats() {
        const stats = {
            totalSteps: 0,
            activeSteps: 0,
            instrumentStats: {}
        };
        
        this.instruments.forEach(instrument => {
            const steps = this.currentPattern[instrument] || [];
            const activeCount = steps.filter(step => step).length;
            
            stats.instrumentStats[instrument] = {
                total: steps.length,
                active: activeCount,
                density: steps.length > 0 ? activeCount / steps.length : 0
            };
            
            stats.totalSteps += steps.length;
            stats.activeSteps += activeCount;
        });
        
        stats.globalDensity = stats.totalSteps > 0 ? stats.activeSteps / stats.totalSteps : 0;
        
        return stats;
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.currentPattern = {};
        this.presets = {};
        this.history = [];
        this.historyIndex = -1;
    }
}