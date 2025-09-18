import { updateCellMerging } from '../entities.js';
import { gameState } from '../gameState.js';
import { MERGE_COOLDOWN } from '../config.js';

// Mock gameState
jest.mock('../gameState.js', () => ({
  gameState: {
    playerCells: []
  }
}));

describe('updateCellMerging', () => {
  beforeEach(() => {
    // Reset gameState before each test
    gameState.playerCells = [];
    // Mock Date.now to control time
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
  });

  afterEach(() => {
    // Restore Date.now
    jest.restoreAllMocks();
  });

  test('cells do not merge when cooldown has not passed', () => {
    // Create two cells that are close enough to merge but with recent split time
    const cell1 = { 
      x: 100, y: 100, score: 100, 
      velocityX: 0, velocityY: 0, 
      splitTime: Date.now() - (MERGE_COOLDOWN / 2) 
    };
    const cell2 = { 
      x: 101, y: 101, score: 100, 
      velocityX: 0, velocityY: 0, 
      splitTime: Date.now() - (MERGE_COOLDOWN / 2) 
    };
    
    gameState.playerCells = [cell1, cell2];
    
    updateCellMerging();
    
    // Cells should not merge, still have two cells
    expect(gameState.playerCells.length).toBe(2);
  });

  test('cells merge when cooldown has passed and they are close enough', () => {
    // Mock Date.now to return a time after the cooldown
    jest.spyOn(Date, 'now').mockImplementation(() => MERGE_COOLDOWN + 2000);
    
    // Create two cells that are close enough to merge with old split time
    const cell1 = { 
      x: 100, y: 100, score: 100, 
      velocityX: 0, velocityY: 0, 
      splitTime: 0 // Old split time
    };
    const cell2 = { 
      x: 101, y: 101, score: 100, 
      velocityX: 0, velocityY: 0, 
      splitTime: 0 // Old split time
    };
    
    gameState.playerCells = [cell1, cell2];
    
    updateCellMerging();
    
    // Cells should merge into one
    expect(gameState.playerCells.length).toBe(1);
    // The merged cell should have the combined score
    expect(gameState.playerCells[0].score).toBe(200);
  });

  test('cells attract each other when close but not close enough to merge', () => {
    // Mock Date.now to return a time after the cooldown
    jest.spyOn(Date, 'now').mockImplementation(() => MERGE_COOLDOWN + 2000);
    
    // Create two cells that are not close enough to merge immediately
    const cell1 = { 
      x: 100, y: 100, score: 100, 
      velocityX: 0, velocityY: 0, 
      splitTime: 0 // Old split time
    };
    const cell2 = { 
      x: 200, y: 200, score: 100, // Increased distance to ensure no merging
      velocityX: 0, velocityY: 0, 
      splitTime: 0 // Old split time
    };
    
    gameState.playerCells = [cell1, cell2];
    
    updateCellMerging();
    
    // Cells should not merge yet, still have two cells
    expect(gameState.playerCells.length).toBe(2);
    // But they should have velocities towards each other
    expect(gameState.playerCells[0].velocityX).toBeGreaterThan(0);
    expect(gameState.playerCells[0].velocityY).toBeGreaterThan(0);
    expect(gameState.playerCells[1].velocityX).toBeLessThan(0);
    expect(gameState.playerCells[1].velocityY).toBeLessThan(0);
  });

  test('cells repel each other when too close', () => {
    // Create two cells that are too close and should repel
    const cell1 = { 
      x: 100, y: 100, score: 400, // Larger size
      velocityX: 0, velocityY: 0, 
      splitTime: 0
    };
    const cell2 = { 
      x: 100.1, y: 100.1, score: 400, // Larger size
      velocityX: 0, velocityY: 0, 
      splitTime: 0
    };
    
    gameState.playerCells = [cell1, cell2];
    
    // Mock Date.now to return a time before the cooldown
    jest.spyOn(Date, 'now').mockImplementation(() => 1000);
    
    updateCellMerging();
    
    // Cells should not merge, still have two cells
    expect(gameState.playerCells.length).toBe(2);
    // They should have velocities pushing away from each other
    expect(gameState.playerCells[0].velocityX).toBeLessThan(0);
    expect(gameState.playerCells[0].velocityY).toBeLessThan(0);
    expect(gameState.playerCells[1].velocityX).toBeGreaterThan(0);
    expect(gameState.playerCells[1].velocityY).toBeGreaterThan(0);
  });
});
