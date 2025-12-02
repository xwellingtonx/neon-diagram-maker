import { Node } from '../types';

export class Point {
  constructor(public x: number, public y: number) {}
  static add(p1: Point, p2: Point) { return new Point(p1.x + p2.x, p1.y + p2.y); }
  static subtract(p1: Point, p2: Point) { return new Point(p1.x - p2.x, p1.y - p2.y); }
  length() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
  normalize() {
    const l = this.length();
    return l === 0 ? new Point(0, 0) : new Point(this.x / l, this.y / l);
  }
  multiply(scalar: number) { return new Point(this.x * scalar, this.y * scalar); }
}

export function getAnchorPoints(node: Node): Point[] {
    const { x, y, width, height, type } = node;
    
    if (type === 'circle') {
        const r = width / 2;
        // Cardinals (Top, Right, Bottom, Left)
        return [
            new Point(x, y - r), // Top
            new Point(x + r, y), // Right
            new Point(x, y + r), // Bottom
            new Point(x - r, y)  // Left
        ];
    } else {
        // Rect / Text
        const w2 = width / 2;
        const h2 = height / 2;
        
        return [
            new Point(x, y - h2), // Top Center
            new Point(x + w2, y), // Right Center
            new Point(x, y + h2), // Bottom Center
            new Point(x - w2, y)  // Left Center
        ];
    }
}

export function getBestConnection(nodeA: Node, nodeB: Node): { start: Point, end: Point } {
    const anchorsA = getAnchorPoints(nodeA);
    const anchorsB = getAnchorPoints(nodeB);
    
    let minDist = Infinity;
    let bestStart = anchorsA[0];
    let bestEnd = anchorsB[0];
    
    for (const pA of anchorsA) {
        for (const pB of anchorsB) {
            const dx = pA.x - pB.x;
            const dy = pA.y - pB.y;
            const dist = dx*dx + dy*dy;
            
            if (dist < minDist) {
                minDist = dist;
                bestStart = pA;
                bestEnd = pB;
            }
        }
    }
    
    return { start: bestStart, end: bestEnd };
}

/**
 * Calculates intermediate points for a "Metro-style" path between start and end.
 * Uses Horizontal -> Diagonal -> Horizontal (or Vertical variant) logic.
 */
function getMetroPoints(start: Point, end: Point): Point[] {
    const vector = Point.subtract(end, start);
    const dx = vector.x;
    const dy = vector.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // If aligned or perfect diagonal, just return start and end
    if (absDx < 1 || absDy < 1 || Math.abs(absDx - absDy) < 1) {
        return [start, end];
    }

    // Determine primary direction
    if (absDx > absDy) {
        // Horizontal -> Diagonal -> Horizontal
        const straightWidth = absDx - absDy;
        const split = straightWidth / 2;
        const signX = Math.sign(dx);

        const p1 = new Point(start.x + split * signX, start.y);
        const p2 = new Point(end.x - split * signX, end.y);
        
        return [start, p1, p2, end];
    } else {
        // Vertical -> Diagonal -> Vertical
        const straightHeight = absDy - absDx;
        const split = straightHeight / 2;
        const signY = Math.sign(dy);

        const p1 = new Point(start.x, start.y + split * signY);
        const p2 = new Point(end.x, end.y - split * signY);
        
        return [start, p1, p2, end];
    }
}

/**
 * Generates an SVG path string from a list of points, rounding the corners.
 */
function generateSmoothPath(points: Point[], cornerRadius: number = 20): string {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
        const pPrev = points[i - 1];
        const pCurr = points[i];
        const pNext = points[i + 1];

        // Vector entering the corner
        const vecIn = Point.subtract(pCurr, pPrev);
        const lenIn = vecIn.length();
        
        // Vector leaving the corner
        const vecOut = Point.subtract(pNext, pCurr);
        const lenOut = vecOut.length();

        // If segment is too short for radius, reduce radius locally
        const maxR = Math.min(lenIn / 2, lenOut / 2, cornerRadius);

        // Calculate cut points
        const startCut = Point.subtract(pCurr, vecIn.normalize().multiply(maxR));
        const endCut = Point.add(pCurr, vecOut.normalize().multiply(maxR));

        d += ` L ${startCut.x} ${startCut.y}`;
        d += ` Q ${pCurr.x} ${pCurr.y} ${endCut.x} ${endCut.y}`;
    }

    // Line to last point
    d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

    return d;
}

/**
 * Main function to generate the path data for a line.
 */
export function generateLinePath(coords: {x: number, y: number}[], cornerRadius: number = 24): string {
    if (coords.length < 2) return '';

    let allPoints: Point[] = [];
    
    // Initial point
    allPoints.push(new Point(coords[0].x, coords[0].y));

    for (let i = 0; i < coords.length - 1; i++) {
        const start = new Point(coords[i].x, coords[i].y);
        const end = new Point(coords[i+1].x, coords[i+1].y);
        
        // Get the structural points (start, p1, p2, end)
        const segmentPoints = getMetroPoints(start, end);
        
        // Add them to master list (skip first as it's already added)
        for (let j = 1; j < segmentPoints.length; j++) {
            allPoints.push(segmentPoints[j]);
        }
    }

    return generateSmoothPath(allPoints, cornerRadius);
}