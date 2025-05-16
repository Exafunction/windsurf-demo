import { 
    WORLD_SIZE, 
    DECAY_ENABLED, 
    DECAY_RATE, 
    DECAY_THRESHOLD,
    DECAY_MOVEMENT_MULTIPLIER,
    DECAY_SIZE_FACTOR,
    DECAY_STARVATION_THRESHOLD,
    DECAY_STARVATION_MULTIPLIER
} from './config.js';

export function getSize(score) {
    return Math.sqrt(score) + 20;
}

export function getRandomPosition() {
    return {
        x: Math.random() * WORLD_SIZE,
        y: Math.random() * WORLD_SIZE
    };
}

export function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function calculateCenterOfMass(cells) {
    const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
    if (totalScore === 0) return { x: 0, y: 0 };
    
    return {
        x: cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore,
        y: cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore
    };
}

export function applyDecay(entity, deltaTime) {
    // Check if decay is disabled globally or if entity is at minimum threshold
    if (DECAY_ENABLED === false || entity.score <= DECAY_THRESHOLD) {
        return entity.score;
    }
    
    // Initialize decay multiplier
    let decayMultiplier = 1.0;
    
    // Apply movement-based decay if the entity is moving
    if (entity.velocityX !== undefined && entity.velocityY !== undefined) {
        const speed = Math.sqrt(entity.velocityX * entity.velocityX + entity.velocityY * entity.velocityY);
        if (speed > 0.1) { // Only apply if moving at a meaningful speed
            decayMultiplier *= (1 + (speed * DECAY_MOVEMENT_MULTIPLIER / 10));
        }
    }
    
    // Apply starvation decay if the entity hasn't eaten recently
    if (entity.lastFoodTime !== undefined) {
        const timeSinceFood = (Date.now() - entity.lastFoodTime) / 1000; // in seconds
        if (timeSinceFood > DECAY_STARVATION_THRESHOLD) {
            decayMultiplier *= DECAY_STARVATION_MULTIPLIER;
        }
    }
    
    // Calculate base decay amount based on current score and time elapsed
    // Higher scores decay faster (proportional to score^DECAY_SIZE_FACTOR)
    const decayFactor = Math.pow(entity.score, DECAY_SIZE_FACTOR) / 10;
    const decayAmount = DECAY_RATE * decayFactor * decayMultiplier * (deltaTime / 1000);
    
    // Apply decay with a minimum threshold
    entity.score = Math.max(DECAY_THRESHOLD, entity.score - decayAmount);
    return entity.score;
}

export function findSafeSpawnLocation(gameState, minDistance = 100) {
    const maxAttempts = 50;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
        const pos = getRandomPosition();
        let isSafe = true;

        // Check distance from AI players
        for (const ai of gameState.aiPlayers) {
            const distance = getDistance(pos, ai);
            const safeDistance = getSize(ai.score) + minDistance;
            if (distance < safeDistance) {
                isSafe = false;
                break;
            }
        }

        // Check distance from player cells
        for (const cell of gameState.playerCells) {
            const distance = getDistance(pos, cell);
            const safeDistance = getSize(cell.score) + minDistance;
            if (distance < safeDistance) {
                isSafe = false;
                break;
            }
        }

        if (isSafe) {
            return pos;
        }

        attempts++;
    }

    // If no safe spot found after max attempts, find the spot furthest from all players
    let bestPos = getRandomPosition();
    let maxMinDistance = 0;

    for (let i = 0; i < 20; i++) {
        const pos = getRandomPosition();
        let minDistanceToPlayer = Infinity;

        // Check distance to all players and cells
        [...gameState.aiPlayers, ...gameState.playerCells].forEach(entity => {
            const distance = getDistance(pos, entity);
            minDistanceToPlayer = Math.min(minDistanceToPlayer, distance);
        });

        if (minDistanceToPlayer > maxMinDistance) {
            maxMinDistance = minDistanceToPlayer;
            bestPos = pos;
        }
    }

    return bestPos;
}