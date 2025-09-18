import { gameState, mouse } from './gameState.js';
import { getSize, getRandomPosition, calculateCenterOfMass, getDistance } from './utils.js';
import { 
    WORLD_SIZE, 
    FOOD_COUNT, 
    AI_COUNT, 
    MIN_SPLIT_SCORE, 
    SPLIT_VELOCITY, 
    MAX_PLAYER_CELLS,
    AI_STARTING_SCORE,
    MERGE_COOLDOWN,
    MERGE_DISTANCE,
    MERGE_FORCE,
    MERGE_START_FORCE
} from './config.js';

const AI_NAMES = [
    'Cursor',
    'Zed',
    'VSCode',
    'Visual Studio',
    'Eclipse',
    'JetBrains',
    'XCode',
    'Sublime',
    'Neovim',
    'Emacs'
];

// Function to get an unused AI name
function getUnusedAIName() {
    const usedNames = new Set(gameState.aiPlayers.map(ai => ai.name));
    return AI_NAMES.find(name => !usedNames.has(name)) || AI_NAMES[0];
}

export function updateCellMerging() {
    const now = Date.now();
    const cellsToMerge = [];

    // First pass: calculate merging forces and identify mergeable cells
    for (let i = 0; i < gameState.playerCells.length; i++) {
        const cell1 = gameState.playerCells[i];
        
        // Skip if cell is already marked for merging
        if (cellsToMerge.includes(i)) continue;

        for (let j = i + 1; j < gameState.playerCells.length; j++) {
            const cell2 = gameState.playerCells[j];
            
            // Skip if cell is already marked for merging
            if (cellsToMerge.includes(j)) continue;

            const distance = getDistance(cell1, cell2);
            const cell1Size = getSize(cell1.score);
            const cell2Size = getSize(cell2.score);
            const minMergeDistance = (cell1Size + cell2Size) * MERGE_DISTANCE;
            const minDistance = cell1Size + cell2Size;  // Minimum distance before repulsion

            // Calculate time since split
            const timeSinceSplit1 = now - (cell1.splitTime || 0);
            const timeSinceSplit2 = now - (cell2.splitTime || 0);
            const canMerge = timeSinceSplit1 > MERGE_COOLDOWN && timeSinceSplit2 > MERGE_COOLDOWN;

            if (distance < minMergeDistance && canMerge) {
                // Mark cells for merging only if they're very close
                if (distance < minDistance * 0.5) {
                    cellsToMerge.push(i, j);
                } else {
                    // Strong attraction force when close to merging
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    const force = MERGE_FORCE;
                    const factor = force / Math.max(1, distance);

                    cell1.velocityX += dx * factor;
                    cell1.velocityY += dy * factor;
                    cell2.velocityX -= dx * factor;
                    cell2.velocityY -= dy * factor;
                }
            } else {
                // Calculate repulsion when too close
                if (distance < minDistance) {
                    const repulsionStrength = 0.3;  // Adjust this to control repulsion strength
                    const repulsionFactor = (minDistance - distance) / minDistance * repulsionStrength;
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    
                    // Apply repulsion
                    cell1.velocityX -= dx * repulsionFactor;
                    cell1.velocityY -= dy * repulsionFactor;
                    cell2.velocityX += dx * repulsionFactor;
                    cell2.velocityY += dy * repulsionFactor;
                }
                
                // Apply attraction force if not too close
                if (distance > minDistance) {
                    const dx = cell2.x - cell1.x;
                    const dy = cell2.y - cell1.y;
                    const force = canMerge ? MERGE_FORCE : MERGE_START_FORCE;
                    const factor = force / Math.max(1, distance);

                    cell1.velocityX += dx * factor;
                    cell1.velocityY += dy * factor;
                    cell2.velocityX -= dx * factor;
                    cell2.velocityY -= dy * factor;
                }
            }
        }
    }

    // Second pass: merge cells
    if (cellsToMerge.length > 0) {
        // Sort indices in descending order to remove from end first
        cellsToMerge.sort((a, b) => b - a);
        
        // Get unique indices
        const uniqueIndices = [...new Set(cellsToMerge)];
        
        // Group cells to merge
        const groups = [];
        let currentGroup = [uniqueIndices[0]];
        
        for (let i = 1; i < uniqueIndices.length; i++) {
            const current = uniqueIndices[i];
            const prev = currentGroup[currentGroup.length - 1];
            
            if (prev - current === 1) {
                currentGroup.push(current);
            } else {
                groups.push(currentGroup);
                currentGroup = [current];
            }
        }
        groups.push(currentGroup);

        // Merge each group
        groups.forEach(group => {
            const cells = group.map(index => gameState.playerCells[index]);
            
            // Calculate total score and weighted position
            const totalScore = cells.reduce((sum, cell) => sum + cell.score, 0);
            const weightedX = cells.reduce((sum, cell) => sum + cell.x * cell.score, 0) / totalScore;
            const weightedY = cells.reduce((sum, cell) => sum + cell.y * cell.score, 0) / totalScore;
            
            // Calculate average velocity weighted by mass
            const avgVelocityX = cells.reduce((sum, cell) => sum + cell.velocityX * cell.score, 0) / totalScore;
            const avgVelocityY = cells.reduce((sum, cell) => sum + cell.velocityY * cell.score, 0) / totalScore;

            // Remove old cells (in reverse order to maintain correct indices)
            group.sort((a, b) => b - a).forEach(index => {
                gameState.playerCells.splice(index, 1);
            });

            // Add merged cell with combined score
            gameState.playerCells.push({
                x: weightedX,
                y: weightedY,
                score: totalScore,  // This is the sum of all merged cell scores
                velocityX: avgVelocityX,
                velocityY: avgVelocityY,
                splitTime: 0  // Reset split time for merged cell
            });
        });
    }
}

export function updatePlayer() {
    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 0) {
        const direction = {
            x: dx / distance,
            y: dy / distance
        };

        // Update each cell
        gameState.playerCells.forEach(cell => {
            // Base speed is inversely proportional to cell size
            const speed = 5 / (getSize(cell.score) / 20);

            // Update velocity (with inertia)
            cell.velocityX = cell.velocityX * 0.9 + direction.x * speed * 0.1;
            cell.velocityY = cell.velocityY * 0.9 + direction.y * speed * 0.1;

            // Update position
            cell.x = Math.max(0, Math.min(WORLD_SIZE, cell.x + cell.velocityX));
            cell.y = Math.max(0, Math.min(WORLD_SIZE, cell.y + cell.velocityY));
        });
    }

    // Handle cell merging
    updateCellMerging();
}

export function splitPlayerCell(cell) {
    if (cell.score < MIN_SPLIT_SCORE || 
        gameState.playerCells.length >= MAX_PLAYER_CELLS) {
        return;
    }

    // Calculate split direction (towards mouse)
    const dx = mouse.x - window.innerWidth / 2;
    const dy = mouse.y - window.innerHeight / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return;

    const direction = {
        x: dx / distance,
        y: dy / distance
    };

    const now = Date.now();

    // Create new cell
    const newCell = {
        x: cell.x,
        y: cell.y,
        score: cell.score / 2,
        velocityX: direction.x * SPLIT_VELOCITY,
        velocityY: direction.y * SPLIT_VELOCITY,
        splitTime: now
    };

    // Update original cell
    cell.score /= 2;
    cell.velocityX = -direction.x * SPLIT_VELOCITY * 0.5;
    cell.velocityY = -direction.y * SPLIT_VELOCITY * 0.5;
    cell.splitTime = now;

    // Add new cell
    gameState.playerCells.push(newCell);
}

export function handlePlayerSplit() {
    // Split each cell that's large enough
    const cellsToSplit = gameState.playerCells.filter(cell => 
        cell.score >= MIN_SPLIT_SCORE && 
        gameState.playerCells.length < MAX_PLAYER_CELLS
    );

    cellsToSplit.forEach(cell => splitPlayerCell(cell));
}

export function updateAI() {
    gameState.aiPlayers.forEach(ai => {
        if (Math.random() < 0.02) {
            ai.direction = Math.random() * Math.PI * 2;
        }

        const speed = 5 / (getSize(ai.score) / 20);
        ai.x += Math.cos(ai.direction) * speed;
        ai.y += Math.sin(ai.direction) * speed;

        ai.x = Math.max(0, Math.min(WORLD_SIZE, ai.x));
        ai.y = Math.max(0, Math.min(WORLD_SIZE, ai.y));
    });
}

export function initEntities() {
    // Clear existing entities
    gameState.food = [];
    gameState.aiPlayers = [];
    
    console.log('Initializing entities...');
    
    const currentTime = Date.now();

    // Initialize food
    for (let i = 0; i < FOOD_COUNT; i++) {
        const pos = getRandomPosition();
        gameState.food.push({
            x: pos.x,
            y: pos.y,
            color: `hsl(${Math.random() * 360}, 50%, 50%)`
        });
    }

    // Initialize AI players
    for (let i = 0; i < AI_COUNT; i++) {
        const pos = getRandomPosition();
        const ai = {
            x: pos.x,
            y: pos.y,
            score: AI_STARTING_SCORE,
            color: `hsl(${Math.random() * 360}, 70%, 50%)`,
            direction: Math.random() * Math.PI * 2,
            name: getUnusedAIName(),
            lastFoodTime: currentTime // Initialize lastFoodTime
        };
        gameState.aiPlayers.push(ai);
    }

    // Respawn player if all cells are gone
    if (gameState.playerCells.length === 0) {
        const safePos = findSafeSpawnLocation(gameState);
        gameState.playerCells.push({
            x: safePos.x,
            y: safePos.y,
            score: STARTING_SCORE,
            velocityX: 0,
            velocityY: 0,
            splitTime: 0,
            lastFoodTime: currentTime // Initialize lastFoodTime
        });
    }

    console.log('Entities initialized:', {
        foodCount: gameState.food.length,
        aiCount: gameState.aiPlayers.length,
        playerCells: gameState.playerCells.length
    });
}

// Export for use in other modules
export function respawnAI() {
    const pos = getRandomPosition();
    const name = getUnusedAIName();
    const currentTime = Date.now();
    
    return {
        x: pos.x,
        y: pos.y,
        score: AI_STARTING_SCORE,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        direction: Math.random() * Math.PI * 2,
        name: name,
        lastFoodTime: currentTime // Initialize lastFoodTime
    };
}