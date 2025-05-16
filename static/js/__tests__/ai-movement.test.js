import { updateAI } from '../entities.js';
import { gameState } from '../gameState.js';
import { WORLD_SIZE } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    aiPlayers: []
  }
}));

describe('updateAI', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.aiPlayers = [];
    
    // Mock Math.random to make tests deterministic
    jest.spyOn(Math, 'random').mockImplementation(() => 0.5);
  });
  
  afterEach(() => {
    // Restore Math.random
    jest.restoreAllMocks();
  });
  
  test('updates AI position based on direction', () => {
    const ai = {
      x: 100,
      y: 100,
      score: 100,
      direction: Math.PI / 4 // 45 degrees
    };
    
    gameState.aiPlayers = [ai];
    
    updateAI();
    
    // AI should have moved in the direction of its angle
    expect(gameState.aiPlayers[0].x).toBeGreaterThan(100);
    expect(gameState.aiPlayers[0].y).toBeGreaterThan(100);
  });
  
  test('AI changes direction randomly', () => {
    const ai = {
      x: 100,
      y: 100,
      score: 100,
      direction: 0
    };
    
    gameState.aiPlayers = [ai];
    
    // Mock Math.random to return a value that will trigger direction change
    jest.spyOn(Math, 'random')
      .mockImplementationOnce(() => 0.01) // Less than 0.02 to trigger direction change
      .mockImplementationOnce(() => 0.5); // For the new direction calculation
    
    updateAI();
    
    // Direction should have changed
    expect(gameState.aiPlayers[0].direction).toBeCloseTo(Math.PI);
  });
  
  test('AI speed is inversely proportional to size', () => {
    const smallAI = {
      x: 100,
      y: 100,
      score: 100,
      direction: 0 // Moving right
    };
    
    const largeAI = {
      x: 100,
      y: 100,
      score: 400,
      direction: 0 // Moving right
    };
    
    // Test small AI first
    gameState.aiPlayers = [smallAI];
    updateAI();
    const smallAISpeed = gameState.aiPlayers[0].x - 100;
    
    // Test large AI
    gameState.aiPlayers = [largeAI];
    updateAI();
    const largeAISpeed = gameState.aiPlayers[0].x - 100;
    
    // Small AI should move faster than large AI
    expect(smallAISpeed).toBeGreaterThan(largeAISpeed);
  });
  
  test('AI stays within world boundaries', () => {
    // Test AI at edge of world
    const edgeAI = {
      x: WORLD_SIZE - 1,
      y: WORLD_SIZE - 1,
      score: 100,
      direction: Math.PI / 4 // 45 degrees, moving toward edge
    };
    
    gameState.aiPlayers = [edgeAI];
    
    updateAI();
    
    // AI should be constrained to world boundaries
    expect(gameState.aiPlayers[0].x).toBeLessThanOrEqual(WORLD_SIZE);
    expect(gameState.aiPlayers[0].y).toBeLessThanOrEqual(WORLD_SIZE);
    expect(gameState.aiPlayers[0].x).toBeGreaterThanOrEqual(0);
    expect(gameState.aiPlayers[0].y).toBeGreaterThanOrEqual(0);
  });
});
