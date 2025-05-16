import { getSize, getDistance, calculateCenterOfMass, getRandomPosition, findSafeSpawnLocation, applyDecay } from '../utils.js';
import { WORLD_SIZE, DECAY_ENABLED, DECAY_RATE, DECAY_THRESHOLD } from '../config.js';

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

describe('applyDecay', () => {
  test('should not decay below threshold', () => {
    const entity = { score: DECAY_THRESHOLD };
    applyDecay(entity, 1000);
    expect(entity.score).toBe(DECAY_THRESHOLD);
  });

  test('should decay proportionally to time passed', () => {
    const entity = { score: 100 };
    // Update to use power function instead of sqrt
    const expectedDecayFactor = Math.pow(entity.score, DECAY_SIZE_FACTOR) / 10;
    const expectedDecayAmount = DECAY_RATE * expectedDecayFactor * 1; // 1 second
    
    applyDecay(entity, 1000); // 1 second
    
    expect(entity.score).toBeCloseTo(100 - expectedDecayAmount, 5);
  });

  test('should decay more for higher scores', () => {
    const smallEntity = { score: 100 };
    const largeEntity = { score: 400 };
    
    // Apply same time decay to both
    applyDecay(smallEntity, 1000);
    applyDecay(largeEntity, 1000);
    
    // Verify larger entity decayed more
    expect(100 - smallEntity.score).toBeLessThan(400 - largeEntity.score);
  });
});