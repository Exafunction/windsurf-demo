import * as utils from '../utils.js';
import * as config from '../config.js';

describe('decay mechanics', () => {
  // Mock Date.now() to return a consistent value for tests
  const NOW = 1621234567890; // Fixed timestamp for testing
  let originalDateNow;
  // Setup and teardown for each test
  beforeEach(() => {
    // Mock the config values directly
    config.DECAY_ENABLED = true;
    config.DECAY_RATE = 0.05;
    config.DECAY_THRESHOLD = 50;
    config.DECAY_MOVEMENT_MULTIPLIER = 1.5;
    config.DECAY_SIZE_FACTOR = 0.2;
    config.DECAY_STARVATION_THRESHOLD = 10;
    config.DECAY_STARVATION_MULTIPLIER = 2;
    
    // Mock Date.now
    originalDateNow = Date.now;
    Date.now = jest.fn(() => NOW);
  });
  
  afterEach(() => {
    // Restore all mocks
    jest.restoreAllMocks();
    Date.now = originalDateNow;
  });

  test('should not decay below threshold', () => {
    const entity = { score: config.DECAY_THRESHOLD };
    utils.applyDecay(entity, 1000);
    expect(entity.score).toBe(config.DECAY_THRESHOLD);
  });

  test('should decay proportionally to time passed', () => {
    const entity = { score: 100 };
    const expectedDecayFactor = Math.sqrt(entity.score) / 10;
    const expectedDecayAmount = config.DECAY_RATE * expectedDecayFactor * 1; // 1 second
    
    utils.applyDecay(entity, 1000); // 1 second
    
    expect(entity.score).toBeCloseTo(100 - expectedDecayAmount, 5);
  });

  test('should decay more for higher scores', () => {
    const smallEntity = { score: 100 };
    const largeEntity = { score: 400 };
    
    // Apply same time decay to both
    utils.applyDecay(smallEntity, 1000);
    utils.applyDecay(largeEntity, 1000);
    
    // Calculate expected decay
    const smallDecayFactor = Math.sqrt(100) / 10;
    const largeDecayFactor = Math.sqrt(400) / 10;
    
    // Verify larger entity decayed more
    expect(largeDecayFactor).toBeGreaterThan(smallDecayFactor);
    expect(100 - smallEntity.score).toBeLessThan(400 - largeEntity.score);
  });

  test('should not decay when disabled', () => {
    // Temporarily disable decay for this test
    const originalDecayEnabled = config.DECAY_ENABLED;
    config.DECAY_ENABLED = false;
    
    const entity = { score: 100 };
    utils.applyDecay(entity, 1000);
    
    // Restore original value
    config.DECAY_ENABLED = originalDecayEnabled;
    
    expect(entity.score).toBe(100);
  });

  test('should handle very large time deltas gracefully', () => {
    const entity = { score: 200 };
    
    // Apply a very large time delta (10 seconds)
    utils.applyDecay(entity, 10000);
    
    // Should not go below threshold
    expect(entity.score).toBeGreaterThanOrEqual(config.DECAY_THRESHOLD);
  });

  test('should apply movement-based decay', () => {
    // Entity with velocity
    const entity = { 
      score: 100,
      velocityX: 2,
      velocityY: 2
    };
    
    // Entity with no velocity
    const staticEntity = { 
      score: 100,
      velocityX: 0,
      velocityY: 0
    };
    
    utils.applyDecay(entity, 1000);
    utils.applyDecay(staticEntity, 1000);
    
    // Moving entity should decay more
    expect(entity.score).toBeLessThan(staticEntity.score);
  });
  
  test('should apply starvation decay', () => {
    // Entity that just ate
    const recentlyFedEntity = { 
      score: 100,
      lastFoodTime: NOW
    };
    
    // Entity that hasn't eaten in a while
    const starvingEntity = { 
      score: 100,
      lastFoodTime: NOW - (config.DECAY_STARVATION_THRESHOLD * 1000 + 5000) // Past threshold
    };
    
    utils.applyDecay(recentlyFedEntity, 1000);
    utils.applyDecay(starvingEntity, 1000);
    
    // Starving entity should decay more
    expect(starvingEntity.score).toBeLessThan(recentlyFedEntity.score);
  });
  
  test('should apply size-based decay using power function', () => {
    const smallEntity = { score: 100 };
    const largeEntity = { score: 400 };
    
    // Calculate expected decay with power function
    const smallDecayFactor = Math.pow(smallEntity.score, config.DECAY_SIZE_FACTOR) / 10;
    const largeDecayFactor = Math.pow(largeEntity.score, config.DECAY_SIZE_FACTOR) / 10;
    
    // Verify power function gives different results than sqrt
    expect(largeDecayFactor / smallDecayFactor).not.toBeCloseTo(2); // sqrt would be 2
    
    utils.applyDecay(smallEntity, 1000);
    utils.applyDecay(largeEntity, 1000);
    
    // Larger entity should decay more, but by a different factor than with sqrt
    expect(largeEntity.score).toBeLessThan(400);
    expect(smallEntity.score).toBeLessThan(100);
  });
});
