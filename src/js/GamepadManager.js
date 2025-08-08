/**
 * GamepadManager - Gestion des manettes de jeu
 * Responsable de la détection, connexion et communication avec les manettes
 */
class GamepadManager {
    constructor() {
        this.currentGamepad = null;
        this.isConnected = false;
        this.callbacks = {
            onConnect: [],
            onDisconnect: [],
            onButtonPress: []
        };
        
        this.init();
    }
    
    /**
     * Initialisation du gestionnaire
     */
    init() {
        // Écouter les événements de connexion/déconnexion
        window.addEventListener('gamepadconnected', (e) => {
            this.handleGamepadConnected(e.gamepad);
        });
        
        window.addEventListener('gamepaddisconnected', (e) => {
            this.handleGamepadDisconnected(e.gamepad);
        });
        
        // Vérification périodique pour les navigateurs qui ne supportent pas les événements
        this.checkInterval = setInterval(() => {
            this.checkGamepads();
        }, 1000);
        
        // Vérification initiale
        this.checkGamepads();
    }
    
    /**
     * Vérification manuelle des manettes connectées
     */
    checkGamepads() {
        const gamepads = navigator.getGamepads();
        let foundGamepad = false;
        
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!this.currentGamepad || this.currentGamepad.index !== i) {
                    this.handleGamepadConnected(gamepads[i]);
                }
                foundGamepad = true;
                break;
            }
        }
        
        if (!foundGamepad && this.isConnected) {
            this.handleGamepadDisconnected();
        }
    }
    
    /**
     * Gestion de la connexion d'une manette
     */
    handleGamepadConnected(gamepad) {
        this.currentGamepad = gamepad;
        this.isConnected = true;
        
        console.log(`Manette connectée: ${gamepad.id}`);
        
        // Notifier les callbacks
        this.callbacks.onConnect.forEach(callback => {
            callback(gamepad);
        });
    }
    
    /**
     * Gestion de la déconnexion d'une manette
     */
    handleGamepadDisconnected(gamepad = null) {
        console.log(`Manette déconnectée: ${gamepad ? gamepad.id : 'Unknown'}`);
        
        this.currentGamepad = null;
        this.isConnected = false;
        
        // Notifier les callbacks
        this.callbacks.onDisconnect.forEach(callback => {
            callback(gamepad);
        });
    }
    
    /**
     * Obtenir la manette actuelle (avec état mis à jour)
     */
    getCurrentGamepad() {
        if (!this.isConnected || !this.currentGamepad) {
            return null;
        }
        
        // Obtenir l'état actuel depuis l'API
        const gamepads = navigator.getGamepads();
        return gamepads[this.currentGamepad.index];
    }
    
    /**
     * Vérifier si une manette est connectée
     */
    isGamepadConnected() {
        return this.isConnected && this.currentGamepad !== null;
    }
    
    /**
     * Obtenir les informations de la manette
     */
    getGamepadInfo() {
        if (!this.isConnected || !this.currentGamepad) {
            return null;
        }
        
        return {
            id: this.currentGamepad.id,
            index: this.currentGamepad.index,
            buttons: this.currentGamepad.buttons.length,
            axes: this.currentGamepad.axes.length,
            hapticActuators: this.currentGamepad.hapticActuators ? this.currentGamepad.hapticActuators.length : 0,
            vibrationActuator: !!this.currentGamepad.vibrationActuator
        };
    }
    
    /**
     * Vérifier si la vibration est supportée
     */
    supportsVibration() {
        const gamepad = this.getCurrentGamepad();
        return gamepad && gamepad.vibrationActuator;
    }
    
    /**
     * Déclencher une vibration
     */
    async vibrate(options = {}) {
        const gamepad = this.getCurrentGamepad();
        
        if (!gamepad || !gamepad.vibrationActuator) {
            console.warn('Vibration non supportée ou manette déconnectée');
            return false;
        }
        
        const defaultOptions = {
            startDelay: 0,
            duration: 200,
            weakMagnitude: 0.5,
            strongMagnitude: 0.8
        };
        
        const vibrationOptions = { ...defaultOptions, ...options };
        
        try {
            await gamepad.vibrationActuator.playEffect('dual-rumble', vibrationOptions);
            return true;
        } catch (error) {
            console.error('Erreur lors de la vibration:', error);
            return false;
        }
    }
    
    /**
     * Arrêter toutes les vibrations
     */
    async stopVibration() {
        const gamepad = this.getCurrentGamepad();
        
        if (gamepad && gamepad.vibrationActuator) {
            try {
                await gamepad.vibrationActuator.reset();
                return true;
            } catch (error) {
                console.error('Erreur lors de l\'arrêt de la vibration:', error);
                return false;
            }
        }
        
        return false;
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
     * Nettoyer les ressources
     */
    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        
        this.stopVibration();
        this.currentGamepad = null;
        this.isConnected = false;
        this.callbacks = {
            onConnect: [],
            onDisconnect: [],
            onButtonPress: []
        };
    }
    
    /**
     * Obtenir l'état des boutons (pour debug)
     */
    getButtonStates() {
        const gamepad = this.getCurrentGamepad();
        if (!gamepad) return [];
        
        return gamepad.buttons.map((button, index) => ({
            index,
            pressed: button.pressed,
            touched: button.touched,
            value: button.value
        }));
    }
    
    /**
     * Obtenir l'état des axes (pour debug)
     */
    getAxesStates() {
        const gamepad = this.getCurrentGamepad();
        if (!gamepad) return [];
        
        return gamepad.axes.map((axis, index) => ({
            index,
            value: axis
        }));
    }
}