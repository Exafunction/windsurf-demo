/**
 * Triangle Collision Detection Module
 * Implements algorithms for detecting overlap between triangles
 */

/**
 * Represents a triangle with three vertices
 * @typedef {Object} Triangle
 * @property {number} x1 - x-coordinate of first vertex
 * @property {number} y1 - y-coordinate of first vertex
 * @property {number} x2 - x-coordinate of second vertex
 * @property {number} y2 - y-coordinate of second vertex
 * @property {number} x3 - x-coordinate of third vertex
 * @property {number} y3 - y-coordinate of third vertex
 */

/**
 * Determines if a point is inside a triangle using barycentric coordinates
 * @param {number} px - x-coordinate of the point
 * @param {number} py - y-coordinate of the point
 * @param {Triangle} triangle - The triangle to check against
 * @returns {boolean} - True if the point is inside the triangle
 */
export function isPointInTriangle(px, py, triangle) {
    const { x1, y1, x2, y2, x3, y3 } = triangle;
    
    // Calculate barycentric coordinates
    const denominator = ((y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3));
    
    // Avoid division by zero
    if (Math.abs(denominator) < 0.0001) return false;
    
    const a = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / denominator;
    const b = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / denominator;
    const c = 1 - a - b;
    
    // Point is inside if all barycentric coordinates are between 0 and 1
    return a >= 0 && a <= 1 && b >= 0 && b <= 1 && c >= 0 && c <= 1;
}

/**
 * Checks if a line segment intersects with another line segment
 * @param {number} x1 - x-coordinate of first point of first line
 * @param {number} y1 - y-coordinate of first point of first line
 * @param {number} x2 - x-coordinate of second point of first line
 * @param {number} y2 - y-coordinate of second point of first line
 * @param {number} x3 - x-coordinate of first point of second line
 * @param {number} y3 - y-coordinate of first point of second line
 * @param {number} x4 - x-coordinate of second point of second line
 * @param {number} y4 - y-coordinate of second point of second line
 * @returns {boolean} - True if the line segments intersect
 */
export function doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    function onSegment(px, py, qx, qy, rx, ry) {
        if (qx <= Math.max(px, rx) && qx >= Math.min(px, rx) &&
            qy <= Math.max(py, ry) && qy >= Math.min(py, ry)) {
            return true;
        }
        return false;
    }

    function orientation(px, py, qx, qy, rx, ry) {
        const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
        if (Math.abs(val) < 0.0001) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    }

    const o1 = orientation(x1, y1, x2, y2, x3, y3);
    const o2 = orientation(x1, y1, x2, y2, x4, y4);
    const o3 = orientation(x3, y3, x4, y4, x1, y1);
    const o4 = orientation(x3, y3, x4, y4, x2, y2);

    // General case
    if (o1 !== o2 && o3 !== o4) {
        return true;
    }

    // Special Cases
    // (x1, y1, x2, y2) and (x3, y3) are collinear and (x3, y3) lies on segment (x1, y1)-(x2, y2)
    if (o1 === 0 && onSegment(x1, y1, x3, y3, x2, y2)) return true;

    // (x1, y1, x2, y2) and (x4, y4) are collinear and (x4, y4) lies on segment (x1, y1)-(x2, y2)
    if (o2 === 0 && onSegment(x1, y1, x4, y4, x2, y2)) return true;

    // (x3, y3, x4, y4) and (x1, y1) are collinear and (x1, y1) lies on segment (x3, y3)-(x4, y4)
    if (o3 === 0 && onSegment(x3, y3, x1, y1, x4, y4)) return true;

    // (x3, y3, x4, y4) and (x2, y2) are collinear and (x2, y2) lies on segment (x3, y3)-(x4, y4)
    if (o4 === 0 && onSegment(x3, y3, x2, y2, x4, y4)) return true;

    return false; // Doesn't fall in any of the above cases
}

/**
 * Checks if two triangles overlap using vertex inclusion and edge intersection tests
 * @param {Triangle} triangle1 - First triangle
 * @param {Triangle} triangle2 - Second triangle
 * @returns {boolean} - True if the triangles overlap
 */
export function doTrianglesOverlap(triangle1, triangle2) {
    // Null check for triangles
    if (!triangle1 || !triangle2) return false;
    
    // Ensure all properties exist
    const t1Props = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
    const t2Props = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3'];
    
    for (const prop of t1Props) {
        if (triangle1[prop] === undefined) return false;
    }
    
    for (const prop of t2Props) {
        if (triangle2[prop] === undefined) return false;
    }
    
    // Check if any vertex of triangle1 is inside triangle2
    if (isPointInTriangle(triangle1.x1, triangle1.y1, triangle2) ||
        isPointInTriangle(triangle1.x2, triangle1.y2, triangle2) ||
        isPointInTriangle(triangle1.x3, triangle1.y3, triangle2)) {
        return true;
    }
    
    // Check if any vertex of triangle2 is inside triangle1
    if (isPointInTriangle(triangle2.x1, triangle2.y1, triangle1) ||
        isPointInTriangle(triangle2.x2, triangle2.y2, triangle1) ||
        isPointInTriangle(triangle2.x3, triangle2.y3, triangle1)) {
        return true;
    }
    
    // Check if any edge of triangle1 intersects with any edge of triangle2
    const edges1 = [
        [triangle1.x1, triangle1.y1, triangle1.x2, triangle1.y2],
        [triangle1.x2, triangle1.y2, triangle1.x3, triangle1.y3],
        [triangle1.x3, triangle1.y3, triangle1.x1, triangle1.y1]
    ];
    
    const edges2 = [
        [triangle2.x1, triangle2.y1, triangle2.x2, triangle2.y2],
        [triangle2.x2, triangle2.y2, triangle2.x3, triangle2.y3],
        [triangle2.x3, triangle2.y3, triangle2.x1, triangle2.y1]
    ];
    
    for (const [x1, y1, x2, y2] of edges1) {
        for (const [x3, y3, x4, y4] of edges2) {
            if (doLinesIntersect(x1, y1, x2, y2, x3, y3, x4, y4)) {
                return true;
            }
        }
    }
    
    return false;
}

/**
 * Creates a triangle with the given center point and size
 * @param {number} x - x-coordinate of the center
 * @param {number} y - y-coordinate of the center
 * @param {number} size - Size of the triangle (distance from center to vertices)
 * @param {number} rotation - Rotation angle in radians
 * @returns {Triangle} - A triangle object
 */
export function createTriangle(x, y, size, rotation = 0) {
    // Create an equilateral triangle with a slightly larger size for better collision detection
    // Using 1.1 * size to make the collision area slightly larger than the visual triangle
    const collisionSize = size * 1.1; // Slightly larger collision area
    
    const angle1 = rotation;
    const angle2 = rotation + (2 * Math.PI / 3);
    const angle3 = rotation + (4 * Math.PI / 3);
    
    return {
        x1: x + collisionSize * Math.cos(angle1),
        y1: y + collisionSize * Math.sin(angle1),
        x2: x + collisionSize * Math.cos(angle2),
        y2: y + collisionSize * Math.sin(angle2),
        x3: x + collisionSize * Math.cos(angle3),
        y3: y + collisionSize * Math.sin(angle3)
    };
}

/**
 * Calculates the area of a triangle
 * @param {Triangle} triangle - The triangle
 * @returns {number} - The area of the triangle
 */
export function calculateTriangleArea(triangle) {
    const { x1, y1, x2, y2, x3, y3 } = triangle;
    return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2);
}

/**
 * Checks if a point is inside a convex polygon
 * @param {number} x - x-coordinate of the point
 * @param {number} y - y-coordinate of the point
 * @param {Array<{x: number, y: number}>} polygon - Array of polygon vertices
 * @returns {boolean} - True if the point is inside the polygon
 */
export function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        const intersect = ((yi > y) !== (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}
