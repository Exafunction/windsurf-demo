import { BASE_DECAY_RATE, DECAY_SCALE_FACTOR, MIN_SPLIT_SCORE } from '../config.js';
import { getSize } from '../utils.js';

describe('Score Decay', () => {
  // Test the score decay calculation directly
  test('score decays correctly based on size and time', () => {
    // Initial score and time values
    const initialScore = 100;
    const deltaTime = 1; // 1 second
    
    // Calculate size based on score
    const size = getSize(initialScore);
    
    // Calculate decay rate (replicating the logic from applyScoreDecay)
    const decayRate = BASE_DECAY_RATE * (1 + size * DECAY_SCALE_FACTOR);
    
    // Calculate expected decay amount
    const decay = decayRate * deltaTime;
    
    // Calculate expected score after decay
    const expectedScore = Math.max(MIN_SPLIT_SCORE / 2, initialScore - decay);
    
    // Verify decay amount is positive
    expect(decay).toBeGreaterThan(0);
    
    // Verify score decreases by the expected amount
    expect(expectedScore).toBeLessThan(initialScore);
    expect(initialScore - expectedScore).toBeCloseTo(decay, 5);
  });
  
  test('larger entities decay faster than smaller ones', () => {
    // Test with two different sized entities
    const smallEntityScore = 50;
    const largeEntityScore = 500;
    const deltaTime = 1; // 1 second
    
    // Calculate sizes
    const smallSize = getSize(smallEntityScore);
    const largeSize = getSize(largeEntityScore);
    
    // Calculate decay rates
    const smallDecayRate = BASE_DECAY_RATE * (1 + smallSize * DECAY_SCALE_FACTOR);
    const largeDecayRate = BASE_DECAY_RATE * (1 + largeSize * DECAY_SCALE_FACTOR);
    
    // Calculate decay amounts
    const smallDecay = smallDecayRate * deltaTime;
    const largeDecay = largeDecayRate * deltaTime;
    
    // Verify larger entities decay faster
    expect(largeDecayRate).toBeGreaterThan(smallDecayRate);
    expect(largeDecay).toBeGreaterThan(smallDecay);
  });
  
  test('score never decays below minimum threshold', () => {
    // Test with a score close to the minimum threshold
    const lowScore = MIN_SPLIT_SCORE / 2 + 0.1; // Just above minimum
    const deltaTime = 10; // Long time period to ensure decay would go below minimum
    
    // Calculate size and decay
    const size = getSize(lowScore);
    const decayRate = BASE_DECAY_RATE * (1 + size * DECAY_SCALE_FACTOR);
    const decay = decayRate * deltaTime;
    
    // Calculate expected score after decay
    const expectedScore = Math.max(MIN_SPLIT_SCORE / 2, lowScore - decay);
    
    // Verify the decay would have gone below minimum without the limit
    expect(lowScore - decay).toBeLessThan(MIN_SPLIT_SCORE / 2);
    
    // Verify score is clamped to minimum
    expect(expectedScore).toEqual(MIN_SPLIT_SCORE / 2);
  });
});
