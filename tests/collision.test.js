import { isPointInTriangle, doLinesIntersect, doTrianglesOverlap, createTriangle } from '../static/js/triangleCollision';
import { handleFoodCollisions } from '../static/js/collisions';
import { gameState } from '../static/js/gameState';

describe('Triangle Collision', () => {
  // Test for isPointInTriangle
  test('should correctly determine if a point is inside a triangle', () => {
    const triangle = { x1: 0, y1: 0, x2: 5, y2: 0, x3: 2.5, y3: 5 };
    expect(isPointInTriangle(2.5, 2.5, triangle)).toBe(true);
    expect(isPointInTriangle(0, 0, triangle)).toBe(true);
    expect(isPointInTriangle(6, 0, triangle)).toBe(false);
  });

  // Test for doLinesIntersect
  test('should correctly determine if two line segments intersect', () => {
    // Intersecting lines
    expect(doLinesIntersect(0, 0, 5, 5, 0, 5, 5, 0)).toBe(true);
    // Non-intersecting lines
    expect(doLinesIntersect(0, 0, 1, 1, 2, 2, 3, 3)).toBe(false);
    // Parallel lines
    expect(doLinesIntersect(0, 0, 5, 0, 0, 1, 5, 1)).toBe(false);
    // Collinear lines
    expect(doLinesIntersect(0, 0, 2, 0, 3, 0, 5, 0)).toBe(false);
  });

  // Test for doTrianglesOverlap
  test('should correctly determine if two triangles overlap', () => {
    const triangle1 = { x1: 0, y1: 0, x2: 5, y2: 0, x3: 2.5, y3: 5 };
    const triangle2 = { x1: 1, y1: 1, x2: 6, y2: 1, x3: 3.5, y3: 6 };
    const triangle3 = { x1: 10, y1: 10, x2: 15, y2: 10, x3: 12.5, y3: 15 };
    expect(doTrianglesOverlap(triangle1, triangle2)).toBe(true);
    expect(doTrianglesOverlap(triangle1, triangle3)).toBe(false);
  });

  // Test for createTriangle
  test('should create a triangle with the correct properties', () => {
    const triangle = createTriangle(0, 0, 10, 0);
    expect(triangle).toHaveProperty('x1');
    expect(triangle).toHaveProperty('y1');
    expect(triangle).toHaveProperty('x2');
    expect(triangle).toHaveProperty('y2');
    expect(triangle).toHaveProperty('x3');
    expect(triangle).toHaveProperty('y3');
  });
});

describe('Game Collisions', () => {
  // Test for handleFoodCollisions
  test('should handle food consumption correctly', () => {
    // Mock gameState
    gameState.playerCells = [{ x: 10, y: 10, score: 100, rotation: 0 }];
    gameState.food = [{ x: 11, y: 11, score: 10, rotation: 0 }];
    
    const initialFoodCount = gameState.food.length;
    handleFoodCollisions();
    
    expect(gameState.food.length).toBe(initialFoodCount - 1);
    expect(gameState.playerCells[0].score).toBeGreaterThan(100);
  });
});
