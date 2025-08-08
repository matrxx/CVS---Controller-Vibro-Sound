/**
 * VibrationEngine - Moteur de génération des vibrations
 * Responsable de la conversion des patterns musicaux en vibrations
 */
class VibrationEngine {
    constructor(gamepadManager) {
        this.gamepadManager = gamepadManager;
        this.instrumentConfigs = {};
        this.globalIntensity = {
            weak: 0.5,
            strong: 0.8
        };
        
        this.isPlaying = false;
        this.activeVibrations = new Set();
        
        this.loadDefaultInstruments();
    }
    
    /**
     * Configuration par défaut des instruments
     */
    loadDefaultInstruments() {
        this.instrumentConfigs = {
            'Kick': {
                weak: 0.9,
                strong: 1.0,
                duration: 200,
                pattern: 'punch',
                description: 'Grosse caisse - Impact puissant'
            },
            'Snare': {
                weak: 0.7,
                strong: 0.8,
                duration: 150,
                pattern: 'snap',
                description: 'Caisse claire - Claque sèche'
            },
            'Hi-Hat': {
                weak: 0.3,
                strong: 0.1,
                duration: 80,
                pattern: 'tick',
                description: 'Charleston - Percussion légère'
            },
            'Ride': {
                weak: 0.4,
                strong: 0.2,
                duration: 120,
                pattern: 'shimmer',
                description: 'Ride - Vibration métallique'
            },
            'Bass': {
                weak: 0.8,
                strong: 0.9,
                duration: 300,
                pattern: 'rumble',
                description: 'Basse - Vibration profonde'
            },
            'Lead': {
                weak: 0.5,
                strong: 0.6,
                duration: 100,
                pattern: 'pulse',
                description: 'Lead - Pulsation rapide'
            },
            'Pad': {
                weak: 0.6,
                strong: 0.3,
                duration: 400,
                pattern: 'wave',
                description: 'Pad - Onde douce'
            },
            'FX': {
                weak: 0.4,
                strong: 0.7,
                duration: 250,
                pattern: 'burst',
                description: 'Effets - Éclatement'
            }
        };
    }
    
    /**
     * Charger la configuration des instruments depuis un fichier JSON
     */
    async loadInstrumentConfig(configPath) {
        try {
            const response = await fetch(configPath);
            const config = await response.json();
            this.instrumentConfigs = { ...this.instrumentConfigs, ...config };
            console.log('Configuration des instruments chargée:', configPath);
        } catch (error) {
            console.warn('Impossible de charger la configuration:', error);
        }
    }
    
    /**
     * Définir l'intensité globale
     */
    setGlobalIntensity(weak, strong) {
        this.globalIntensity.weak = Math.max(0, Math.min(1, weak));
        this.globalIntensity.strong = Math.max(0, Math.min(1, strong));
    }
    
    /**
     * Obtenir la configuration d'un instrument
     */
    getInstrumentConfig(instrumentName) {
        return this.instrumentConfigs[instrumentName] || {
            weak: 0.5,
            strong: 0.5,
            duration: 200,
            pattern: 'default'
        };
    }
    
    /**
     * Jouer une note individuelle
     */
    async playNote(instrumentName, options = {}) {
        if (!this.gamepadManager.supportsVibration()) {
            console.warn('Vibration non supportée');
            return false;
        }
        
        const config = this.getInstrumentConfig(instrumentName);
        const vibrationId = `${instrumentName}-${Date.now()}`;
        
        // Calculer l'intensité finale
        const finalWeak = (config.weak * this.globalIntensity.weak) * (options.intensityMultiplier || 1);
        const finalStrong = (config.strong * this.globalIntensity.strong) * (options.intensityMultiplier || 1);
        
        const vibrationOptions = {
            startDelay: options.delay || 0,
            duration: options.duration || config.duration,
            weakMagnitude: Math.max(0, Math.min(1, finalWeak)),
            strongMagnitude: Math.max(0, Math.min(1, finalStrong))
        };
        
        this.activeVibrations.add(vibrationId);
        
        try {
            const success = await this.gamepadManager.vibrate(vibrationOptions);
            
            // Retirer de la liste des vibrations actives après la durée
            setTimeout(() => {
                this.activeVibrations.delete(vibrationId);
            }, vibrationOptions.duration);
            
            return success;
        } catch (error) {
            this.activeVibrations.delete(vibrationId);
            console.error('Erreur lors de la lecture de la note:', error);
            return false;
        }
    }
    
    /**
     * Jouer un pattern combiné (plusieurs instruments simultanés)
     */
    async playPattern(instruments, options = {}) {
        if (!Array.isArray(instruments) || instruments.length === 0) {
            return false;
        }
        
        if (!this.gamepadManager.supportsVibration()) {
            console.warn('Vibration non supportée');
            return false;
        }
        
        // Combiner les configurations des instruments
        const combinedConfig = this.combineInstruments(instruments);
        
        const vibrationOptions = {
            startDelay: options.delay || 0,
            duration: options.duration || combinedConfig.duration,
            weakMagnitude: Math.max(0, Math.min(1, combinedConfig.weak * this.globalIntensity.weak)),
            strongMagnitude: Math.max(0, Math.min(1, combinedConfig.strong * this.globalIntensity.strong))
        };
        
        const vibrationId = `pattern-${Date.now()}`;
        this.activeVibrations.add(vibrationId);
        
        try {
            const success = await this.gamepadManager.vibrate(vibrationOptions);
            
            setTimeout(() => {
                this.activeVibrations.delete(vibrationId);
            }, vibrationOptions.duration);
            
            return success;
        } catch (error) {
            this.activeVibrations.delete(vibrationId);
            console.error('Erreur lors de la lecture du pattern:', error);
            return false;
        }
    }
    
    /**
     * Combiner plusieurs instruments en une seule vibration
     */
    combineInstruments(instruments) {
        let combinedWeak = 0;
        let combinedStrong = 0;
        let maxDuration = 0;
        
        instruments.forEach(instrumentName => {
            const config = this.getInstrumentConfig(instrumentName);
            
            // Utiliser le maximum pour l'intensité (pour éviter la saturation)
            combinedWeak = Math.max(combinedWeak, config.weak);
            combinedStrong = Math.max(combinedStrong, config.strong);
            maxDuration = Math.max(maxDuration, config.duration);
        });
        
        return {
            weak: Math.min(1, combinedWeak),
            strong: Math.min(1, combinedStrong),
            duration: maxDuration
        };
    }
    
    /**
     * Arrêter toutes les vibrations en cours
     */
    async stopAllVibrations() {
        this.activeVibrations.clear();
        return await this.gamepadManager.stopVibration();
    }
    
    /**
     * Test d'une vibration spécifique
     */
    async testVibration(type = 'both', duration = 300) {
        if (!this.gamepadManager.supportsVibration()) {
            console.warn('Vibration non supportée');
            return false;
        }
        
        let weak = 0;
        let strong = 0;
        
        switch (type) {
            case 'weak':
                weak = this.globalIntensity.weak;
                break;
            case 'strong':
                strong = this.globalIntensity.strong;
                break;
            case 'both':
            default:
                weak = this.globalIntensity.weak;
                strong = this.globalIntensity.strong;
                break;
        }
        
        return await this.gamepadManager.vibrate({
            startDelay: 0,
            duration: duration,
            weakMagnitude: weak,
            strongMagnitude: strong
        });
    }
    
    /**
     * Créer un pattern de vibration personnalisé
     */
    createCustomPattern(name, config) {
        if (!config.weak || !config.strong || !config.duration) {
            throw new Error('Configuration invalide: weak, strong et duration sont requis');
        }
        
        this.instrumentConfigs[name] = {
            weak: Math.max(0, Math.min(1, config.weak)),
            strong: Math.max(0, Math.min(1, config.strong)),
            duration: Math.max(50, config.duration),
            pattern: config.pattern || 'custom',
            description: config.description || `Pattern personnalisé: ${name}`
        };
        
        console.log(`Pattern personnalisé créé: ${name}`);
    }
    
    /**
     * Supprimer un pattern personnalisé
     */
    removeCustomPattern(name) {
        if (this.instrumentConfigs[name]) {
            delete this.instrumentConfigs[name];
            console.log(`Pattern supprimé: ${name}`);
            return true;
        }
        return false;
    }
    
    /**
     * Obtenir la liste de tous les instruments disponibles
     */
    getAvailableInstruments() {
        return Object.keys(this.instrumentConfigs);
    }
    
    /**
     * Exporter la configuration actuelle
     */
    exportConfig() {
        return {
            instruments: { ...this.instrumentConfigs },
            globalIntensity: { ...this.globalIntensity },
            timestamp: new Date().toISOString()
        };
    }
    
    /**
     * Importer une configuration
     */
    importConfig(config) {
        try {
            if (config.instruments) {
                this.instrumentConfigs = { ...config.instruments };
            }
            
            if (config.globalIntensity) {
                this.globalIntensity = {
                    weak: Math.max(0, Math.min(1, config.globalIntensity.weak || 0.5)),
                    strong: Math.max(0, Math.min(1, config.globalIntensity.strong || 0.8))
                };
            }
            
            console.log('Configuration importée avec succès');
            return true;
        } catch (error) {
            console.error('Erreur lors de l\'importation:', error);
            return false;
        }
    }
    
    /**
     * Obtenir des statistiques sur les vibrations actives
     */
    getStats() {
        return {
            activeVibrations: this.activeVibrations.size,
            isPlaying: this.isPlaying,
            availableInstruments: this.getAvailableInstruments().length,
            supportsVibration: this.gamepadManager.supportsVibration(),
            globalIntensity: { ...this.globalIntensity }
        };
    }
    
    /**
     * Mode debug - afficher les informations sur une vibration
     */
    debugVibration(instrumentName) {
        const config = this.getInstrumentConfig(instrumentName);
        const finalWeak = config.weak * this.globalIntensity.weak;
        const finalStrong = config.strong * this.globalIntensity.strong;
        
        console.group(`Debug Vibration: ${instrumentName}`);
        console.log('Configuration originale:', config);
        console.log('Intensité globale:', this.globalIntensity);
        console.log('Intensité finale:', { weak: finalWeak, strong: finalStrong });
        console.log('Support vibration:', this.gamepadManager.supportsVibration());
        console.groupEnd();
        
        return {
            instrument: instrumentName,
            original: config,
            global: this.globalIntensity,
            final: { weak: finalWeak, strong: finalStrong },
            supported: this.gamepadManager.supportsVibration()
        };
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.stopAllVibrations();
        this.instrumentConfigs = {};
        this.activeVibrations.clear();
        this.isPlaying = false;
    }
}