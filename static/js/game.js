import { gameState, mouse } from './gameState.js';
import { initRenderer, resizeCanvas, drawGame, drawMinimap, updateLeaderboard } from './renderer.js';
import { updatePlayer, updateAI, initEntities, handlePlayerSplit } from './entities.js';
import { handleFoodCollisions, handlePlayerAICollisions, handleAIAICollisions, respawnEntities } from './collisions.js';
import { initUI } from './ui.js';
import { applyDecay } from './utils.js';
import { DECAY_INTERVAL } from './config.js';

function setupInputHandlers() {
    const canvas = document.getElementById('gameCanvas');
    
    // Mouse movement
    canvas.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Mouse click for splitting
    canvas.addEventListener('click', (e) => {
        handlePlayerSplit();
    });

    // Window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
    });
}

function checkCollisions() {
    handleFoodCollisions();
    handlePlayerAICollisions();
    handleAIAICollisions();
    respawnEntities();
}

function verifyGameState() {
    console.log('Verifying game state...');
    console.log('Player cells:', gameState.playerCells);
    console.log('AI players:', gameState.aiPlayers);
    console.log('Food count:', gameState.food.length);

    if (gameState.playerCells.length === 0) {
        console.error('No player cells found!');
    }
    if (gameState.aiPlayers.length === 0) {
        console.error('No AI players found!');
    }
    if (gameState.food.length === 0) {
        console.error('No food found!');
    }
}

// Track time for decay calculations
let lastFrameTime = Date.now();
let lastDecayTime = Date.now();

function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    
    // Apply decay at regular intervals to avoid performance issues
    if (currentTime - lastDecayTime >= DECAY_INTERVAL) {
        // Calculate time since last decay calculation
        const decayDeltaTime = currentTime - lastDecayTime;
        lastDecayTime = currentTime;
        
        // Apply decay to player cells
        gameState.playerCells.forEach(cell => {
            applyDecay(cell, decayDeltaTime);
        });
        
        // Apply decay to AI players
        gameState.aiPlayers.forEach(ai => {
            applyDecay(ai, decayDeltaTime);
        });
    }
    
    updatePlayer();
    updateAI();
    checkCollisions();
    updateLeaderboard();
    drawGame();
    drawMinimap();
    requestAnimationFrame(gameLoop);
}

async function initGame() {
    try {
        console.log('Initializing game...');
        
        // Get DOM elements
        const elements = {
            gameCanvas: document.getElementById('gameCanvas'),
            minimapCanvas: document.getElementById('minimap'),
            scoreElement: document.getElementById('score'),
            leaderboardContent: document.getElementById('leaderboard-content')
        };

        // Verify all elements are found
        Object.entries(elements).forEach(([key, element]) => {
            if (!element) {
                throw new Error(`Could not find element: ${key}`);
            }
        });

        console.log('DOM elements found');

        // Initialize game components in order
        initRenderer(elements);
        console.log('Renderer initialized');
        
        setupInputHandlers();
        console.log('Input handlers set up');
        
        initEntities();
        console.log('Entities initialized');

        initUI();
        console.log('UI initialized');

        // Verify game state
        verifyGameState();

        // Start game loop
        console.log('Starting game loop');
        gameLoop();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

// Start the game when the DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}