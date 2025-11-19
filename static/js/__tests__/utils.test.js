import * as utils from '../utils.js';
import { getSize, getDistance, calculateCenterOfMass, getRandomPosition, findSafeSpawnLocation } from '../utils.js';
import { WORLD_SIZE } from '../config.js';

describe('getSize', () => {
  test('returns correct size for score 0', () => {
    expect(getSize(0)).toBe(20);  // sqrt(0) + 20
  });

  test('returns correct size for score 100', () => {
    expect(getSize(100)).toBe(30);  // sqrt(100) + 20
  });

  test('returns correct size for score 400', () => {
    expect(getSize(400)).toBe(40);  // sqrt(400) + 20
  });
});

describe('getDistance', () => {
  test('returns 0 for same point', () => {
    const point = { x: 10, y: 10 };
    expect(getDistance(point, point)).toBe(0);
  });

  test('returns correct horizontal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 0 };
    expect(getDistance(point1, point2)).toBe(3);
  });

  test('returns correct vertical distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 0, y: 4 };
    expect(getDistance(point1, point2)).toBe(4);
  });

  test('returns correct diagonal distance', () => {
    const point1 = { x: 0, y: 0 };
    const point2 = { x: 3, y: 4 };
    expect(getDistance(point1, point2)).toBe(5);  // 3-4-5 triangle
  });
});

describe('calculateCenterOfMass', () => {
  test('returns center for single cell', () => {
    const cells = [{ x: 10, y: 20, score: 100 }];
    const center = calculateCenterOfMass(cells);
    expect(center).toEqual({ x: 10, y: 20 });
  });

  test('returns weighted center for multiple cells', () => {
    const cells = [
      { x: 0, y: 0, score: 100 },
      { x: 10, y: 10, score: 300 }
    ];
    const center = calculateCenterOfMass(cells);
    expect(center.x).toBeCloseTo(7.5);
    expect(center.y).toBeCloseTo(7.5);
  });

  test('returns {x: 0, y: 0} for empty cells array', () => {
    expect(calculateCenterOfMass([])).toEqual({ x: 0, y: 0 });
  });

  test('returns {x: 0, y: 0} for cells with zero total score', () => {
    const cells = [
      { x: 10, y: 20, score: 0 },
      { x: 30, y: 40, score: 0 }
    ];
    expect(calculateCenterOfMass(cells)).toEqual({ x: 0, y: 0 });
  });
});

describe('getRandomPosition', () => {
  test('returns position within world bounds', () => {
    const pos = getRandomPosition();
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('returns different positions on multiple calls', () => {
    const positions = Array.from({ length: 10 }, () => getRandomPosition());
    const uniquePositions = new Set(positions.map(p => `${p.x},${p.y}`));
    // With 10 random positions, we should get at least 2 unique ones
    expect(uniquePositions.size).toBeGreaterThan(1);
  });
});

describe('findSafeSpawnLocation', () => {
  test('returns safe position away from AI players', () => {
    const gameState = {
      aiPlayers: [
        { x: 100, y: 100, score: 100 }
      ],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(gameState, 100);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    const distance = getDistance(pos, gameState.aiPlayers[0]);
    const safeDistance = getSize(gameState.aiPlayers[0].score) + 100;
    expect(distance).toBeGreaterThanOrEqual(safeDistance);
  });

  test('returns safe position away from player cells', () => {
    const gameState = {
      aiPlayers: [],
      playerCells: [
        { x: 200, y: 200, score: 150 }
      ]
    };
    const pos = findSafeSpawnLocation(gameState, 100);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    const distance = getDistance(pos, gameState.playerCells[0]);
    const safeDistance = getSize(gameState.playerCells[0].score) + 100;
    expect(distance).toBeGreaterThanOrEqual(safeDistance);
  });

  test('avoids unsafe positions near player cells during retry', () => {
    // Mock Math.random to generate specific positions
    const originalRandom = global.Math.random;
    let callCount = 0;
    global.Math.random = () => {
      callCount++;
      // First call pair (x, y): generate position at (500, 500)
      // This is far from AI player (100, 100) but near player cell (500, 500)
      if (callCount === 1 || callCount === 2) {
        return 0.5; // 0.5 * 1000 = 500
      }
      // Second call pair (x, y): generate position at (900, 900) - far from both
      return 0.9; // 0.9 * 1000 = 900
    };

    const gameState = {
      aiPlayers: [
        { x: 100, y: 100, score: 100 } // AI player far from (500, 500)
      ],
      playerCells: [
        { x: 500, y: 500, score: 500 } // Player cell at (500, 500)
      ]
    };
    
    const pos = findSafeSpawnLocation(gameState, 100);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    
    // Verify the position is safe from both
    const distanceFromAI = getDistance(pos, gameState.aiPlayers[0]);
    const safeDistanceFromAI = getSize(gameState.aiPlayers[0].score) + 100;
    expect(distanceFromAI).toBeGreaterThanOrEqual(safeDistanceFromAI);
    
    const distanceFromCell = getDistance(pos, gameState.playerCells[0]);
    const safeDistanceFromCell = getSize(gameState.playerCells[0].score) + 100;
    expect(distanceFromCell).toBeGreaterThanOrEqual(safeDistanceFromCell);
    
    // Restore original Math.random
    global.Math.random = originalRandom;
  });

  test('returns safe position away from both AI players and player cells', () => {
    const gameState = {
      aiPlayers: [
        { x: 100, y: 100, score: 100 }
      ],
      playerCells: [
        { x: 200, y: 200, score: 150 }
      ]
    };
    const pos = findSafeSpawnLocation(gameState, 100);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    
    // Check distance from AI player
    const distanceFromAI = getDistance(pos, gameState.aiPlayers[0]);
    const safeDistanceFromAI = getSize(gameState.aiPlayers[0].score) + 100;
    expect(distanceFromAI).toBeGreaterThanOrEqual(safeDistanceFromAI);
    
    // Check distance from player cell
    const distanceFromCell = getDistance(pos, gameState.playerCells[0]);
    const safeDistanceFromCell = getSize(gameState.playerCells[0].score) + 100;
    expect(distanceFromCell).toBeGreaterThanOrEqual(safeDistanceFromCell);
  });

  test('uses fallback logic when no safe spot found after max attempts', () => {
    // Create a crowded game state that covers most of the world
    const gameState = {
      aiPlayers: Array.from({ length: 20 }, (_, i) => ({
        x: (i % 5) * (WORLD_SIZE / 5) + WORLD_SIZE / 10,
        y: Math.floor(i / 5) * (WORLD_SIZE / 5) + WORLD_SIZE / 10,
        score: 10000
      })),
      playerCells: []
    };
    
    const pos = findSafeSpawnLocation(gameState, 500);
    // Should still return a position even if not perfectly safe
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });

  test('works with custom minDistance parameter', () => {
    const gameState = {
      aiPlayers: [
        { x: 500, y: 500, score: 100 }
      ],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(gameState, 200);
    const distance = getDistance(pos, gameState.aiPlayers[0]);
    const safeDistance = getSize(gameState.aiPlayers[0].score) + 200;
    expect(distance).toBeGreaterThanOrEqual(safeDistance);
  });

  test('returns position when game state is empty', () => {
    const gameState = {
      aiPlayers: [],
      playerCells: []
    };
    const pos = findSafeSpawnLocation(gameState);
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(WORLD_SIZE);
  });
});