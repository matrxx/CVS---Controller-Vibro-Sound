/**
 * main.js - Point d'entrée principal de l'application
 * Initialise et coordonne tous les composants
 */

// Instances globales des composants
let gamepadManager;
let vibrationEngine;
let sequencer;
let patternManager;
let uiController;

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎵 Initialisation du Vibration Music Composer...');
    
    try {
        // Initialiser les composants dans l'ordre
        await initializeComponents();
        
        // Configurer les événements globaux
        setupGlobalEvents();
        
        // Initialiser l'interface utilisateur
        initializeUI();
        
        console.log('✅ Application initialisée avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showErrorMessage('Erreur d\'initialisation: ' + error.message);
    }
});

/**
 * Initialiser tous les composants
 */
async function initializeComponents() {
    // 1. Gestionnaire de manettes
    gamepadManager = new GamepadManager();
    
    // 2. Moteur de vibrations
    vibrationEngine = new VibrationEngine(gamepadManager);
    
    // 3. Gestionnaire de patterns
    patternManager = new PatternManager();
    
    // 4. Séquenceur
    sequencer = new Sequencer(vibrationEngine);
    sequencer.setPattern(patternManager.getCurrentPattern());
    
    // 5. Contrôleur d'interface (sera créé après)
    // uiController sera initialisé dans initializeUI()
    
    // Charger la configuration des instruments si disponible
    try {
        await vibrationEngine.loadInstrumentConfig('src/data/instruments.json');
    } catch (error) {
        console.warn('Configuration des instruments non trouvée, utilisation des valeurs par défaut');
    }
}

/**
 * Configurer les événements globaux entre composants
 */
function setupGlobalEvents() {
    // Événements du gestionnaire de manettes
    gamepadManager.on('onConnect', (gamepad) => {
        console.log(`🎮 Manette connectée: ${gamepad.id}`);
        updateGamepadStatus(true, gamepad);
        
        // Activer les contrôles
        document.getElementById('playBtn').disabled = false;
    });
    
    gamepadManager.on('onDisconnect', (gamepad) => {
        console.log('🎮 Manette déconnectée');
        updateGamepadStatus(false);
        
        // Arrêter la lecture et désactiver les contrôles
        sequencer.stop();
        document.getElementById('playBtn').disabled = true;
        document.getElementById('stopBtn').disabled = true;
    });
    
    // Événements du séquenceur
    sequencer.on('onPlay', () => {
        console.log('▶️ Lecture démarrée');
        updatePlaybackUI(true);
    });
    
    sequencer.on('onStop', () => {
        console.log('⏹️ Lecture arrêtée');
        updatePlaybackUI(false);
    });
    
    sequencer.on('onStep', (step, activeInstruments) => {
        updateStepIndicator(step);
        updateActiveInstruments(activeInstruments);
        
        // Debug: afficher les instruments actifs
        if (activeInstruments.length > 0) {
            console.log(`Pas ${step + 1}: ${activeInstruments.join(', ')}`);
        }
    });
    
    sequencer.on('onLoop', (loopCount) => {
        console.log(`🔄 Boucle ${loopCount} terminée`);
        updateLoopCounter(loopCount);
    });
}

/**
 * Initialiser l'interface utilisateur
 */
function initializeUI() {
    // Créer le contrôleur d'interface
    uiController = new UIController({
        gamepadManager,
        vibrationEngine,
        sequencer,
        patternManager
    });
    
    // Initialiser l'interface
    uiController.initialize();
}

/**
 * Mettre à jour le statut de la manette dans l'UI
 */
function updateGamepadStatus(connected, gamepad = null) {
    const statusElement = document.getElementById('gamepadStatus');
    
    if (connected && gamepad) {
        statusElement.textContent = `🎮 Manette connectée: ${gamepad.id}`;
        statusElement.className = 'status connected';
    } else {
        statusElement.textContent = 'Connectez une manette et appuyez sur un bouton...';
        statusElement.className = 'status disconnected';
    }
}

/**
 * Mettre à jour l'interface de lecture
 */
function updatePlaybackUI(isPlaying) {
    const playBtn = document.getElementById('playBtn');
    const stopBtn = document.getElementById('stopBtn');
    const playbackInfo = document.getElementById('playbackInfo');
    
    if (isPlaying) {
        playBtn.disabled = true;
        stopBtn.disabled = false;
        playbackInfo.textContent = 'Statut: En lecture';
        playbackInfo.className = 'playing';
    } else {
        playBtn.disabled = false;
        stopBtn.disabled = true;
        playbackInfo.textContent = 'Statut: Arrêté';
        playbackInfo.className = 'stopped';
    }
}

/**
 * Mettre à jour l'indicateur de pas
 */
function updateStepIndicator(currentStep) {
    const indicator = document.getElementById('stepIndicator');
    const totalSteps = sequencer.getPlaybackState().totalSteps;
    const progress = (currentStep / totalSteps) * 100;
    
    indicator.style.background = `linear-gradient(90deg, var(--accent-color) ${progress}%, rgba(255,255,255,0.2) ${progress}%)`;
    
    // Mettre à jour les indicateurs visuels des pas
    updateStepVisuals(currentStep);
}

/**
 * Mettre à jour les visuels des pas dans la grille
 */
function updateStepVisuals(currentStep) {
    // Effacer les indicateurs précédents
    document.querySelectorAll('.note-step.playing').forEach(el => {
        el.classList.remove('playing');
    });
    
    // Ajouter l'indicateur au pas actuel
    const pattern = patternManager.getCurrentPattern();
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
 * Mettre à jour l'affichage des instruments actifs
 */
function updateActiveInstruments(activeInstruments) {
    // Cette fonction peut être utilisée pour afficher des informations
    // supplémentaires sur les instruments en cours de lecture
}

/**
 * Mettre à jour le compteur de boucles
 */
function updateLoopCounter(loopCount) {
    // Afficher le nombre de boucles dans l'interface si nécessaire
}

/**
 * Afficher un message d'erreur
 */
function showErrorMessage(message) {
    // Créer une notification d'erreur
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--danger-color);
        color: white;
        padding: 15px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Supprimer après 5 secondes
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

/**
 * Gestion des raccourcis clavier
 */
document.addEventListener('keydown', (event) => {
    // Éviter les conflits avec les champs de saisie
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return;
    }
    
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            sequencer.toggle();
            break;
            
        case 'Escape':
            event.preventDefault();
            sequencer.stop();
            break;
            
        case 'KeyC':
            if (event.ctrlKey) {
                event.preventDefault();
                // Copier le pattern (à implémenter)
            }
            break;
            
        case 'KeyV':
            if (event.ctrlKey) {
                event.preventDefault();
                // Coller le pattern (à implémenter)
            }
            break;
            
        case 'KeyZ':
            if (event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                patternManager.undo();
                if (uiController) {
                    uiController.updatePatternDisplay();
                }
            } else if (event.ctrlKey && event.shiftKey) {
                event.preventDefault();
                patternManager.redo();
                if (uiController) {
                    uiController.updatePatternDisplay();
                }
            }
            break;
            
        case 'Delete':
            event.preventDefault();
            patternManager.clearPattern();
            if (uiController) {
                uiController.updatePatternDisplay();
            }
            break;
    }
});

/**
 * Gestion de la fermeture de l'application
 */
window.addEventListener('beforeunload', () => {
    // Nettoyer les ressources
    if (sequencer) sequencer.destroy();
    if (gamepadManager) gamepadManager.destroy();
    if (vibrationEngine) vibrationEngine.destroy();
    if (patternManager) patternManager.destroy();
});

/**
 * Gestion des erreurs globales
 */
window.addEventListener('error', (event) => {
    console.error('Erreur globale:', event.error);
    showErrorMessage('Une erreur inattendue s\'est produite.');
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Promise rejetée:', event.reason);
    showErrorMessage('Erreur de traitement asynchrone.');
});

// Exporter les instances pour l'accès global (utile pour le debug)
window.musicComposer = {
    gamepadManager: () => gamepadManager,
    vibrationEngine: () => vibrationEngine,
    sequencer: () => sequencer,
    patternManager: () => patternManager,
    uiController: () => uiController
};