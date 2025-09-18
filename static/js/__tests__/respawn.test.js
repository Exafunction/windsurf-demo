import { respawnEntities } from '../collisions.js';
import { gameState } from '../gameState.js';
import { FOOD_COUNT, AI_COUNT, STARTING_SCORE } from '../config.js';
import { respawnAI } from '../entities.js';

// Mock dependencies
jest.mock('../gameState.js', () => ({
  gameState: {
    food: [],
    aiPlayers: [],
    playerCells: []
  }
}));

jest.mock('../entities.js', () => ({
  respawnAI: jest.fn().mockReturnValue({
    x: 0,
    y: 0,
    score: 50,
    color: 'hsl(0, 70%, 50%)',
    direction: 0,
    name: 'MockAI'
  })
}));

jest.mock('../utils.js', () => ({
  getRandomPosition: jest.fn().mockReturnValue({ x: 100, y: 100 }),
  findSafeSpawnLocation: jest.fn().mockReturnValue({ x: 200, y: 200 }),
  getSize: jest.fn().mockReturnValue(30),
  getDistance: jest.fn().mockReturnValue(50)
}));

describe('respawnEntities', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.food = [];
    gameState.aiPlayers = [];
    gameState.playerCells = [];
    
    // Reset mock call counts
    jest.clearAllMocks();
  });
  
  test('respawns food to reach target count', () => {
    // Start with some food
    gameState.food = Array(FOOD_COUNT / 2).fill({ x: 0, y: 0, color: 'red' });
    
    respawnEntities();
    
    // Should have added food to reach FOOD_COUNT
    expect(gameState.food.length).toBe(FOOD_COUNT);
  });
  
  test('respawns AI players to reach target count', () => {
    // Start with some AI players
    gameState.aiPlayers = Array(AI_COUNT / 2).fill({ x: 0, y: 0, score: 50 });
    
    respawnEntities();
    
    // Should have added AI players to reach AI_COUNT
    expect(gameState.aiPlayers.length).toBe(AI_COUNT);
    // Should have called respawnAI for each new AI
    expect(respawnAI).toHaveBeenCalledTimes(AI_COUNT / 2);
  });
  
  test('respawns player if no cells exist', () => {
    // Start with no player cells
    gameState.playerCells = [];
    
    respawnEntities();
    
    // Should have added a player cell
    expect(gameState.playerCells.length).toBe(1);
    expect(gameState.playerCells[0]).toHaveProperty('score', STARTING_SCORE);
    expect(gameState.playerCells[0]).toHaveProperty('velocityX', 0);
    expect(gameState.playerCells[0]).toHaveProperty('velocityY', 0);
  });
  
  test('does not respawn player if cells already exist', () => {
    // Start with one player cell
    gameState.playerCells = [{ x: 0, y: 0, score: STARTING_SCORE }];
    
    respawnEntities();
    
    // Should still have just one player cell
    expect(gameState.playerCells.length).toBe(1);
  });
});
