/**
 * SOLUTION COMPLÈTE - INTÉGRATION DE TOUS LES COMPOSANTS
 * Cette mise à jour corrige main.js pour inclure l'overlay
 */

/**
 * main.js - Point d'entrée principal COMPLET
 */

// Instances globales des composants
let gamepadManager;
let vibrationEngine;
let sequencer;
let patternManager;
let uiController;
let vibrationOverlay; // AJOUT DE L'OVERLAY

/**
 * Initialisation de l'application
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎵 Initialisation du Vibration Music Composer...');
    
    try {
        // Initialiser les composants dans l'ordre
        await initializeComponents();
        
        // Initialiser l'interface utilisateur
        initializeUI();
        
        // INITIALISER L'OVERLAY
        initializeOverlay();
        
        // Configurer les événements globaux APRÈS l'UI
        setupGlobalEvents();
        
        // Ajouter le bouton pour ouvrir l'overlay
        addOverlayButton();
        
        // Démarrage de la vérification des manettes
        startGamepadDetection();
        
        console.log('✅ Application initialisée avec succès (avec overlay)');
        
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
    
    // Charger la configuration des instruments si disponible
    try {
        await vibrationEngine.loadInstrumentConfig('src/data/instruments.json');
    } catch (error) {
        console.warn('Configuration des instruments non trouvée, utilisation des valeurs par défaut');
    }
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
 * NOUVELLE FONCTION - Initialiser l'overlay
 */
function initializeOverlay() {
    try {
        // Créer l'overlay avec le moteur de vibrations
        vibrationOverlay = new VibrationOverlay(vibrationEngine);
        console.log('✅ Overlay de vibrations initialisé');
        
        // Rendre l'overlay accessible globalement
        window.vibrationOverlay = vibrationOverlay;
        
    } catch (error) {
        console.warn('⚠️ Impossible de créer l\'overlay:', error);
    }
}

/**
 * NOUVELLE FONCTION - Ajouter le bouton d'overlay dans l'interface
 */
function addOverlayButton() {
    // Trouver le header et ajouter le bouton overlay
    const headerRight = document.querySelector('.header-right');
    if (headerRight && vibrationOverlay) {
        const overlayBtn = document.createElement('button');
        overlayBtn.className = 'header-btn';
        overlayBtn.title = 'Moniteur de vibrations';
        overlayBtn.innerHTML = `
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1.5c-2.363 0-4.5.729-4.5 1.75 0 .512.527 1.072 1.416 1.402C5.56 4.82 6.74 5 8 5s2.44-.18 3.084-.348C11.973 4.322 12.5 3.762 12.5 3.25c0-1.021-2.137-1.75-4.5-1.75z"/>
                <path d="M3.5 5.75c0 .76.872 1.424 2.166 1.732-.244-.56-.38-1.16-.38-1.482v-1.25C4.244 4.956 3.5 5.296 3.5 5.75z"/>
                <path d="M12.5 5.75c0-.454-.744-.794-1.786-1-v1.25c0 .322-.136.922-.38 1.482C11.628 7.174 12.5 6.51 12.5 5.75z"/>
                <path d="M8 2.5A1.5 1.5 0 0 1 9.5 4v8a1.5 1.5 0 0 1-3 0V4A1.5 1.5 0 0 1 8 2.5z"/>
            </svg>
        `;
        
        overlayBtn.addEventListener('click', () => {
            if (vibrationOverlay) {
                vibrationOverlay.toggle();
            }
        });
        
        // Insérer avant le bouton settings
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            headerRight.insertBefore(overlayBtn, settingsBtn);
        } else {
            headerRight.appendChild(overlayBtn);
        }
        
        console.log('✅ Bouton overlay ajouté au header');
    }
}

/**
 * Démarrer la détection des manettes
 */
function startGamepadDetection() {
    // Vérification initiale
    checkForGamepads();
    
    // Message d'information si aucune manette n'est détectée
    setTimeout(() => {
        if (!gamepadManager.isGamepadConnected()) {
            showGamepadInstructions();
        }
    }, 1000);
}

/**
 * Vérifier les manettes connectées
 */
function checkForGamepads() {
    const gamepads = navigator.getGamepads();
    let foundGamepad = false;
    
    for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
            console.log(`🎮 Manette détectée: ${gamepads[i].id}`);
            foundGamepad = true;
            break;
        }
    }
    
    if (!foundGamepad) {
        console.log('⚠️ Aucune manette détectée');
    }
    
    return foundGamepad;
}

/**
 * Afficher les instructions pour la manette
 */
function showGamepadInstructions() {
    const instructions = document.createElement('div');
    instructions.id = 'gamepadInstructions';
    instructions.innerHTML = `
        <div class="instructions-content">
            <h3>🎮 Connexion de la manette</h3>
            <p>Pour utiliser l'application :</p>
            <ol>
                <li>Connectez votre manette (USB ou Bluetooth)</li>
                <li><strong>Appuyez sur n'importe quel bouton</strong> pour l'activer</li>
                <li>Le bouton Play sera disponible</li>
            </ol>
            <p><small>Manettes supportées : Xbox, PlayStation, Switch Pro, etc.</small></p>
            <button onclick="closeInstructions()">Compris</button>
        </div>
    `;
    
    instructions.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-primary);
        color: white;
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        .instructions-content {
            background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 32px;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }
        
        .instructions-content h3 {
            color: var(--accent-primary);
            margin-bottom: 16px;
        }
        
        .instructions-content ol {
            text-align: left;
            margin: 16px 0;
            padding-left: 20px;
        }
        
        .instructions-content li {
            margin: 8px 0;
            line-height: 1.4;
        }
        
        .instructions-content button {
            background: linear-gradient(135deg, var(--accent-primary), #0099cc);
            border: none;
            border-radius: 8px;
            color: white;
            padding: 12px 24px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 16px;
            transition: all 0.2s ease;
        }
        
        .instructions-content button:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(instructions);
}

/**
 * Fermer les instructions
 */
window.closeInstructions = function() {
    const instructions = document.getElementById('gamepadInstructions');
    if (instructions) {
        instructions.remove();
    }
}

/**
 * Configurer les événements globaux entre composants
 */
function setupGlobalEvents() {
    // Événements du gestionnaire de manettes
    gamepadManager.on('onConnect', (gamepad) => {
        console.log(`🎮 Manette connectée: ${gamepad.id}`);
        
        // Fermer les instructions si elles sont ouvertes
        const instructions = document.getElementById('gamepadInstructions');
        if (instructions) {
            instructions.remove();
        }
        
        // Afficher notification de succès
        if (uiController) {
            uiController.showNotification(`Manette connectée: ${gamepad.id}`, 'success');
        }
    });
    
    gamepadManager.on('onDisconnect', (gamepad) => {
        console.log('🎮 Manette déconnectée');
        
        // Afficher notification
        if (uiController) {
            uiController.showNotification('Manette déconnectée', 'warning');
        }
        
        // Réafficher les instructions après un délai
        setTimeout(() => {
            if (!gamepadManager.isGamepadConnected()) {
                showGamepadInstructions();
            }
        }, 2000);
    });
    
    // Événements du séquenceur
    sequencer.on('onPlay', () => {
        console.log('▶️ Lecture démarrée');
    });
    
    sequencer.on('onStop', () => {
        console.log('⏹️ Lecture arrêtée');
    });
    
    sequencer.on('onStep', (step, activeInstruments) => {
        // Debug: afficher les instruments actifs
        if (activeInstruments.length > 0) {
            console.log(`Pas ${step + 1}: ${activeInstruments.join(', ')}`);
        }
    });
    
    sequencer.on('onLoop', (loopCount) => {
        console.log(`🔄 Boucle ${loopCount} terminée`);
    });
}

/**
 * Afficher un message d'erreur
 */
function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4757;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 1000;
        max-width: 300px;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    document.body.appendChild(errorDiv);
    
    requestAnimationFrame(() => {
        errorDiv.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        errorDiv.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 300);
    }, 5000);
}

/**
 * Gestion des raccourcis clavier
 */
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT') {
        return;
    }
    
    switch (event.code) {
        case 'Space':
            event.preventDefault();
            if (gamepadManager && gamepadManager.isGamepadConnected()) {
                sequencer.toggle();
            } else {
                if (uiController) {
                    uiController.showNotification('Connectez d\'abord une manette', 'warning');
                }
            }
            break;
            
        case 'Escape':
            event.preventDefault();
            // Fermer l'overlay si ouvert, sinon arrêter la lecture
            if (vibrationOverlay && vibrationOverlay.isVisible) {
                vibrationOverlay.hide();
            } else if (sequencer) {
                sequencer.stop();
            }
            break;
            
        case 'KeyV':
            if (event.ctrlKey && event.shiftKey) {
                event.preventDefault();
                // Raccourci pour ouvrir l'overlay
                if (vibrationOverlay) {
                    vibrationOverlay.toggle();
                }
            }
            break;
            
        case 'KeyZ':
            if (event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                if (patternManager) {
                    patternManager.undo();
                    if (uiController) {
                        uiController.updatePatternDisplay();
                        sequencer.setPattern(patternManager.getCurrentPattern());
                    }
                }
            } else if (event.ctrlKey && event.shiftKey) {
                event.preventDefault();
                if (patternManager) {
                    patternManager.redo();
                    if (uiController) {
                        uiController.updatePatternDisplay();
                        sequencer.setPattern(patternManager.getCurrentPattern());
                    }
                }
            }
            break;
            
        case 'Delete':
            event.preventDefault();
            if (patternManager) {
                patternManager.clearPattern();
                if (uiController) {
                    uiController.updatePatternDisplay();
                    sequencer.setPattern(patternManager.getCurrentPattern());
                    uiController.showNotification('Pattern effacé', 'info');
                }
            }
            break;
            
        case 'KeyR':
            if (event.ctrlKey) {
                event.preventDefault();
                if (patternManager) {
                    patternManager.setCurrentPattern(patternManager.generateRandomPattern(0.3));
                    if (uiController) {
                        uiController.updatePatternDisplay();
                        sequencer.setPattern(patternManager.getCurrentPattern());
                        uiController.showNotification('Pattern aléatoire généré', 'info');
                    }
                }
            }
            break;
    }
});

/**
 * Détection des manettes avec écoute d'événements
 */
document.addEventListener('keydown', () => {
    if (!gamepadManager.isGamepadConnected()) {
        checkForGamepads();
    }
});

document.addEventListener('click', () => {
    if (!gamepadManager.isGamepadConnected()) {
        checkForGamepads();
    }
});

/**
 * Vérification périodique des manettes
 */
setInterval(() => {
    if (gamepadManager) {
        gamepadManager.checkGamepads();
    }
}, 2000);

/**
 * Gestion de la fermeture de l'application
 */
window.addEventListener('beforeunload', () => {
    console.log('🧹 Nettoyage des ressources...');
    
    if (sequencer) {
        sequencer.stop();
        sequencer.destroy();
    }
    if (gamepadManager) gamepadManager.destroy();
    if (vibrationEngine) vibrationEngine.destroy();
    if (patternManager) patternManager.destroy();
    if (uiController) uiController.destroy();
    if (vibrationOverlay) vibrationOverlay.destroy(); // NETTOYAGE OVERLAY
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

/**
 * Debug - Afficher l'état de l'application
 */
window.debugApp = function() {
    console.group('🔧 État de l\'application');
    console.log('Manette connectée:', gamepadManager?.isGamepadConnected());
    console.log('Pattern actuel:', patternManager?.getCurrentPattern());
    console.log('État séquenceur:', sequencer?.getPlaybackState());
    console.log('Stats vibrations:', vibrationEngine?.getStats());
    console.log('Overlay disponible:', !!vibrationOverlay);
    console.groupEnd();
}

// Exporter les instances pour l'accès global (utile pour le debug)
window.musicComposer = {
    gamepadManager: () => gamepadManager,
    vibrationEngine: () => vibrationEngine,
    sequencer: () => sequencer,
    patternManager: () => patternManager,
    uiController: () => uiController,
    vibrationOverlay: () => vibrationOverlay, // AJOUT OVERLAY
    debug: () => window.debugApp()
};