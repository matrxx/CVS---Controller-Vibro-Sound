/**
 * Sequencer - Moteur de séquençage temporel
 * Responsable de la lecture des patterns en temps réel
 */
class Sequencer {
    constructor(vibrationEngine) {
        this.vibrationEngine = vibrationEngine;
        this.isPlaying = false;
        this.currentStep = 0;
        this.totalSteps = 16;
        this.bpm = 120;
        this.stepInterval = null;
        this.pattern = null;
        
        this.callbacks = {
            onPlay: [],
            onStop: [],
            onStep: [],
            onLoop: []
        };
        
        this.playbackStats = {
            startTime: null,
            totalSteps: 0,
            loopCount: 0
        };
    }
    
    /**
     * Définir le pattern à jouer
     */
    setPattern(pattern) {
        this.pattern = pattern;
        this.totalSteps = pattern ? Object.values(pattern)[0].length : 16;
    }
    
    /**
     * Obtenir le pattern actuel
     */
    getPattern() {
        return this.pattern;
    }
    
    /**
     * Définir le tempo en BPM
     */
    setBPM(bpm) {
        const oldBpm = this.bpm;
        this.bpm = Math.max(60, Math.min(200, bpm));
        
        // Si en cours de lecture, redémarrer avec le nouveau tempo
        if (this.isPlaying && oldBpm !== this.bpm) {
            this.restart();
        }
    }
    
    /**
     * Obtenir le tempo actuel
     */
    getBPM() {
        return this.bpm;
    }
    
    /**
     * Calculer la durée d'un pas en millisecondes
     */
    getStepDuration() {
        // 16ème notes à 4/4
        return (60 / this.bpm / 4) * 1000;
    }
    
    /**
     * Démarrer la lecture
     */
    play() {
        if (this.isPlaying || !this.pattern) {
            return false;
        }
        
        this.isPlaying = true;
        this.playbackStats.startTime = Date.now();
        this.currentStep = 0;
        
        console.log(`Démarrage du séquenceur: ${this.bpm} BPM, ${this.totalSteps} pas`);
        
        // Déclencher les callbacks de démarrage
        this.callbacks.onPlay.forEach(callback => callback());
        
        // Démarrer la boucle de lecture
        this.startPlaybackLoop();
        
        return true;
    }
    
    /**
     * Arrêter la lecture
     */
    stop() {
        if (!this.isPlaying) {
            return false;
        }
        
        this.isPlaying = false;
        
        if (this.stepInterval) {
            clearInterval(this.stepInterval);
            this.stepInterval = null;
        }
        
        // Arrêter toutes les vibrations en cours
        this.vibrationEngine.stopAllVibrations();
        
        console.log('Séquenceur arrêté');
        
        // Déclencher les callbacks d'arrêt
        this.callbacks.onStop.forEach(callback => callback());
        
        return true;
    }
    
    /**
     * Redémarrer avec les paramètres actuels
     */
    restart() {
        if (this.isPlaying) {
            this.stop();
            setTimeout(() => this.play(), 50);
        }
    }
    
    /**
     * Basculer lecture/arrêt
     */
    toggle() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    /**
     * Boucle principale de lecture
     */
    startPlaybackLoop() {
        const stepDuration = this.getStepDuration();
        
        this.stepInterval = setInterval(() => {
            if (!this.isPlaying) {
                return;
            }
            
            this.executeStep();
            this.advanceStep();
        }, stepDuration);
        
        // Exécuter le premier pas immédiatement
        this.executeStep();
    }
    
    /**
     * Exécuter un pas du séquenceur
     */
    executeStep() {
        if (!this.pattern) {
            return;
        }
        
        const activeInstruments = [];
        
        // Identifier les instruments actifs pour ce pas
        Object.keys(this.pattern).forEach(instrument => {
            if (this.pattern[instrument][this.currentStep]) {
                activeInstruments.push(instrument);
            }
        });
        
        // Jouer les vibrations si des instruments sont actifs
        if (activeInstruments.length > 0) {
            this.vibrationEngine.playPattern(activeInstruments, {
                delay: 0
            });
        }
        
        // Mettre à jour les statistiques
        this.playbackStats.totalSteps++;
        
        // Déclencher les callbacks de pas
        this.callbacks.onStep.forEach(callback => {
            callback(this.currentStep, activeInstruments);
        });
    }
    
    /**
     * Avancer au pas suivant
     */
    advanceStep() {
        this.currentStep = (this.currentStep + 1) % this.totalSteps;
        
        // Si on revient au début, incrémenter le compteur de boucles
        if (this.currentStep === 0) {
            this.playbackStats.loopCount++;
            this.callbacks.onLoop.forEach(callback => {
                callback(this.playbackStats.loopCount);
            });
        }
    }
    
    /**
     * Obtenir le pas actuel
     */
    getCurrentStep() {
        return this.currentStep;
    }
    
    /**
     * Définir le pas actuel (pour navigation manuelle)
     */
    setCurrentStep(step) {
        this.currentStep = Math.max(0, Math.min(this.totalSteps - 1, step));
    }
    
    /**
     * Obtenir l'état de lecture
     */
    getPlaybackState() {
        return {
            isPlaying: this.isPlaying,
            currentStep: this.currentStep,
            totalSteps: this.totalSteps,
            bpm: this.bpm,
            stepDuration: this.getStepDuration(),
            progress: this.currentStep / this.totalSteps
        };
    }
    
    /**
     * Obtenir les statistiques de lecture
     */
    getPlaybackStats() {
        const stats = { ...this.playbackStats };
        
        if (stats.startTime) {
            stats.elapsedTime = Date.now() - stats.startTime;
            stats.elapsedMinutes = Math.floor(stats.elapsedTime / 60000);
            stats.elapsedSeconds = Math.floor((stats.elapsedTime % 60000) / 1000);
        }
        
        return stats;
    }
    
    /**
     * Définir le nombre de pas total
     */
    setTotalSteps(steps) {
        const validSteps = [8, 16, 32, 64];
        if (!validSteps.includes(steps)) {
            console.warn(`Nombre de pas invalide: ${steps}. Utilisation de 16.`);
            steps = 16;
        }
        
        this.totalSteps = steps;
        
        // Ajuster le pas actuel si nécessaire
        if (this.currentStep >= this.totalSteps) {
            this.currentStep = 0;
        }
        
        // Redémarrer si en cours de lecture
        if (this.isPlaying) {
            this.restart();
        }
    }
    
    /**
     * Mode pas à pas (pour debug/édition)
     */
    stepForward() {
        if (this.isPlaying) {
            return false;
        }
        
        this.executeStep();
        this.advanceStep();
        return true;
    }
    
    /**
     * Revenir au pas précédent
     */
    stepBackward() {
        if (this.isPlaying) {
            return false;
        }
        
        this.currentStep = this.currentStep === 0 ? 
            this.totalSteps - 1 : 
            this.currentStep - 1;
        return true;
    }
    
    /**
     * Aller au début
     */
    goToStart() {
        if (!this.isPlaying) {
            this.currentStep = 0;
            return true;
        }
        return false;
    }
    
    /**
     * Prévisualiser un pas spécifique
     */
    previewStep(stepIndex) {
        if (stepIndex < 0 || stepIndex >= this.totalSteps || !this.pattern) {
            return false;
        }
        
        const activeInstruments = [];
        
        Object.keys(this.pattern).forEach(instrument => {
            if (this.pattern[instrument][stepIndex]) {
                activeInstruments.push(instrument);
            }
        });
        
        if (activeInstruments.length > 0) {
            this.vibrationEngine.playPattern(activeInstruments);
        }
        
        return activeInstruments;
    }
    
    /**
     * Ajouter un callback pour les événements
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    }
    
    /**
     * Supprimer un callback
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            const index = this.callbacks[event].indexOf(callback);
            if (index > -1) {
                this.callbacks[event].splice(index, 1);
            }
        }
    }
    
    /**
     * Réinitialiser les statistiques
     */
    resetStats() {
        this.playbackStats = {
            startTime: null,
            totalSteps: 0,
            loopCount: 0
        };
    }
    
    /**
     * Nettoyer les ressources
     */
    destroy() {
        this.stop();
        this.pattern = null;
        this.callbacks = {
            onPlay: [],
            onStop: [],
            onStep: [],
            onLoop: []
        };
        this.resetStats();
    }
}