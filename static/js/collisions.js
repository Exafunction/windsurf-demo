import { gameState } from './gameState.js';
import { getDistance, getSize, getRandomPosition, findSafeSpawnLocation } from './utils.js';
import { FOOD_SIZE, FOOD_SCORE, COLLISION_THRESHOLD, FOOD_COUNT, AI_COUNT, STARTING_SCORE, WORLD_SIZE } from './config.js';
import { respawnAI } from './entities.js';
import { doTrianglesOverlap, createTriangle } from './triangleCollision.js';

export function handleFoodCollisions() {
    // Player cells eating food
    for (const playerCell of gameState.playerCells) {
        gameState.food = gameState.food.filter(food => {
            const distance = getDistance(playerCell, food);
            const playerSize = getSize(playerCell.score);

            if (distance < playerSize + FOOD_SIZE) {
                // Create triangles for more precise collision detection
                const playerTriangle = createTriangle(playerCell.x, playerCell.y, playerSize, playerCell.rotation || 0);
                const foodTriangle = createTriangle(food.x, food.y, FOOD_SIZE, food.rotation || 0);
                
                // Check for triangle overlap
                if (doTrianglesOverlap(playerTriangle, foodTriangle)) {
                    playerCell.score += FOOD_SCORE;
                    return false;
                }
            }
            return true;
        });
    }

    // AI eating food
    for (const ai of gameState.aiPlayers) {
        gameState.food = gameState.food.filter(food => {
            const distance = getDistance(ai, food);
            const aiSize = getSize(ai.score);

            if (distance < aiSize + FOOD_SIZE) {
                // Create triangles for more precise collision detection
                const aiTriangle = createTriangle(ai.x, ai.y, aiSize, ai.rotation || 0);
                const foodTriangle = createTriangle(food.x, food.y, FOOD_SIZE, food.rotation || 0);
                
                // Check for triangle overlap
                if (doTrianglesOverlap(aiTriangle, foodTriangle)) {
                    ai.score += FOOD_SCORE;
                    return false;
                }
            }
            return true;
        });
    }
}

export function handlePlayerAICollisions() {
    // Track changes to make after all collision checks
    const aiIndicesToRemove = new Set();
    const playerCellsToRemove = new Set();
    const scoreGains = new Map(); // Map of cell index to score gain

    // Check each player cell against each AI
    gameState.playerCells.forEach((playerCell, playerCellIndex) => {
        gameState.aiPlayers.forEach((ai, aiIndex) => {
            if (aiIndicesToRemove.has(aiIndex)) return;
            if (playerCellsToRemove.has(playerCellIndex)) return;

            // First do a quick circle-based distance check for performance
            const distance = getDistance(playerCell, ai);
            const playerSize = getSize(playerCell.score);
            const aiSize = getSize(ai.score);
            const minDistance = playerSize + aiSize;

            // Only perform triangle collision if circles are close enough
            if (distance < minDistance * 1.5) {
                // Create triangles for more precise collision detection
                const playerTriangle = createTriangle(playerCell.x, playerCell.y, playerSize, playerCell.rotation || 0);
                const aiTriangle = createTriangle(ai.x, ai.y, aiSize, ai.rotation || 0);
                
                // Check for triangle overlap
                if (doTrianglesOverlap(playerTriangle, aiTriangle)) {
                    // Player cell is bigger
                    if (playerSize > aiSize * COLLISION_THRESHOLD) {
                        const currentGain = scoreGains.get(playerCellIndex) || 0;
                        scoreGains.set(playerCellIndex, currentGain + ai.score + 100);
                        aiIndicesToRemove.add(aiIndex);
                    }
                    // AI is bigger
                    else if (aiSize > playerSize * COLLISION_THRESHOLD) {
                        ai.score += playerCell.score + 100;
                        playerCellsToRemove.add(playerCellIndex);
                    }
                }
            }
        });
    });

    // Apply all changes after collision checks
    // Remove consumed AIs (in reverse order)
    [...aiIndicesToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.aiPlayers.splice(index, 1);
    });

    // Apply score gains to surviving player cells
    scoreGains.forEach((gain, cellIndex) => {
        if (!playerCellsToRemove.has(cellIndex)) {
            gameState.playerCells[cellIndex].score += gain;
        }
    });

    // Remove consumed player cells (in reverse order)
    [...playerCellsToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.playerCells.splice(index, 1);
    });

    // Respawn player if all cells are gone
    if (gameState.playerCells.length === 0) {
        const safePos = findSafeSpawnLocation(gameState);
        gameState.playerCells.push({
            x: safePos.x,
            y: safePos.y,
            score: STARTING_SCORE,
            velocityX: 0,
            velocityY: 0
        });
    }
}

export function handleAIAICollisions() {
    const aisToRemove = new Set();
    const scoreGains = new Map(); // Map of AI index to score gain

    for (let i = 0; i < gameState.aiPlayers.length; i++) {
        if (aisToRemove.has(i)) continue;

        for (let j = i + 1; j < gameState.aiPlayers.length; j++) {
            if (aisToRemove.has(j)) continue;

            const ai1 = gameState.aiPlayers[i];
            const ai2 = gameState.aiPlayers[j];
            
            const distance = getDistance(ai1, ai2);
            const ai1Size = getSize(ai1.score);
            const ai2Size = getSize(ai2.score);
            const minDistance = ai1Size + ai2Size;

            // Only perform triangle collision if circles are close enough
            if (distance < minDistance * 1.5) {
                // Create triangles for more precise collision detection
                const ai1Triangle = createTriangle(ai1.x, ai1.y, ai1Size, ai1.rotation || 0);
                const ai2Triangle = createTriangle(ai2.x, ai2.y, ai2Size, ai2.rotation || 0);
                
                // Check for triangle overlap
                if (doTrianglesOverlap(ai1Triangle, ai2Triangle)) {
                    if (ai1Size > ai2Size * COLLISION_THRESHOLD) {
                        const currentGain = scoreGains.get(i) || 0;
                        scoreGains.set(i, currentGain + ai2.score + 100);
                        aisToRemove.add(j);
                    } else if (ai2Size > ai1Size * COLLISION_THRESHOLD) {
                        const currentGain = scoreGains.get(j) || 0;
                        scoreGains.set(j, currentGain + ai1.score + 100);
                        aisToRemove.add(i);
                        break;
                    }
                }
            }
        }
    }

    // Apply score gains to surviving AIs
    scoreGains.forEach((gain, aiIndex) => {
        if (!aisToRemove.has(aiIndex)) {
            gameState.aiPlayers[aiIndex].score += gain;
        }
    });

    // Remove consumed AIs (in reverse order)
    [...aisToRemove].sort((a, b) => b - a).forEach(index => {
        gameState.aiPlayers.splice(index, 1);
    });
}

export function respawnEntities() {
    // Respawn food if needed
    while (gameState.food.length < FOOD_COUNT) {
        const pos = getRandomPosition();
        gameState.food.push({
            x: pos.x,
            y: pos.y,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`,
            rotation: Math.random() * Math.PI * 2 // Add random rotation
        });
    }

    // Respawn AI players if needed
    while (gameState.aiPlayers.length < AI_COUNT) {
        const safePos = findSafeSpawnLocation(gameState);
        const newAI = respawnAI();
        newAI.x = safePos.x;
        newAI.y = safePos.y;
        // Ensure AI has rotation property
        if (!newAI.hasOwnProperty('rotation')) {
            newAI.rotation = Math.random() * Math.PI * 2;
        }
        gameState.aiPlayers.push(newAI);
    }

    // Ensure player has at least one cell
    if (gameState.playerCells.length === 0) {
        const safePos = findSafeSpawnLocation(gameState);
        gameState.playerCells.push({
            x: safePos.x,
            y: safePos.y,
            score: STARTING_SCORE,
            velocityX: 0,
            velocityY: 0,
            rotation: Math.random() * Math.PI * 2 // Add initial rotation
        });
    }
}