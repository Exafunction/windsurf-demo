import { findSafeSpawnLocation } from '../utils.js';
import { getSize } from '../utils.js';

describe('findSafeSpawnLocation', () => {
  test('returns a safe position when there are no entities', () => {
    const mockGameState = {
      aiPlayers: [],
      playerCells: []
    };
    
    const position = findSafeSpawnLocation(mockGameState);
    
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(position.x).toBeGreaterThanOrEqual(0);
    expect(position.y).toBeGreaterThanOrEqual(0);
  });
  
  test('finds safe position when there are entities but space available', () => {
    const mockGameState = {
      aiPlayers: [
        { x: 100, y: 100, score: 100 },
        { x: 500, y: 500, score: 200 }
      ],
      playerCells: [
        { x: 1500, y: 1500, score: 300 }
      ]
    };
    
    const position = findSafeSpawnLocation(mockGameState);
    
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    
    // Check that position is not too close to any entity
    const isSafe = [...mockGameState.aiPlayers, ...mockGameState.playerCells].every(entity => {
      const dx = position.x - entity.x;
      const dy = position.y - entity.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const safeDistance = getSize(entity.score) + 100; // minDistance = 100
      return distance >= safeDistance;
    });
    
    expect(isSafe).toBe(true);
  });
  
  test('falls back to best position when no safe spot found after max attempts', () => {
    // Create a crowded game state where finding a safe spot is unlikely
    const mockGameState = {
      aiPlayers: Array(20).fill(0).map((_, i) => ({
        x: (i % 5) * 400,
        y: Math.floor(i / 5) * 400,
        score: 400
      })),
      playerCells: Array(10).fill(0).map((_, i) => ({
        x: (i % 5) * 400 + 200,
        y: Math.floor(i / 5) * 400 + 200,
        score: 400
      }))
    };
    
    // Mock Math.random to always return the same value to make the test deterministic
    const originalRandom = Math.random;
    let callCount = 0;
    Math.random = jest.fn(() => {
      callCount++;
      return callCount % 10 / 10; // Return values from 0.1 to 1.0
    });
    
    const position = findSafeSpawnLocation(mockGameState);
    
    // Restore Math.random
    Math.random = originalRandom;
    
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    
    // We can't guarantee it's safe, but we can verify it returned a position
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
  });
});
