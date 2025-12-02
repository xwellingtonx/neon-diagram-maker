
import { Node, Link } from './types';
import { generateLinePath, getBestConnection } from './utils/geometry';

export const CANVAS_WIDTH = 2000;
export const CANVAS_HEIGHT = 2000;

const INITIAL_NODES_DATA = [
    { id: 'n1', type: 'rect', label: 'Server A', x: 400, y: 300, w: 120, h: 80, color: '#1e293b' },
    { id: 'n2', type: 'circle', label: 'Router', x: 700, y: 300, w: 80, h: 80, color: '#0f766e' },
    { id: 'n3', type: 'rect', label: 'Database', x: 700, y: 600, w: 100, h: 100, color: '#be185d' },
    { id: 'n4', type: 'rect', label: 'Client', x: 200, y: 500, w: 100, h: 60, color: '#1d4ed8' },
];

export const INITIAL_NODES: Node[] = INITIAL_NODES_DATA.map(d => ({
    id: d.id,
    type: d.type as 'circle' | 'rect',
    label: d.label,
    x: d.x,
    y: d.y,
    width: d.w,
    height: d.h,
    color: d.color,
    borderColor: '#ffffff',
    borderWidth: 2,
    borderStyle: 'solid',
    labelColor: '#ffffff',
    fontSize: 14
}));

// Helper to calc path immediately for initial state
const getCoords = (n1: Node, n2: Node) => {
    const { start, end } = getBestConnection(n1, n2);
    return [start, end];
};

const n1 = INITIAL_NODES[0];
const n2 = INITIAL_NODES[1];
const n3 = INITIAL_NODES[2];
const n4 = INITIAL_NODES[3];

export const INITIAL_LINKS: Link[] = [
    { 
        id: 'l1', sourceId: 'n1', targetId: 'n2', color: '#22d3ee', width: 4, 
        path: generateLinePath(getCoords(n1, n2)), trafficSpeed: 1, trafficDensity: 0.02,
        label: "HTTP/2", labelSize: 10, labelColor: '#ffffff', showLabelBackground: true
    },
    { 
        id: 'l2', sourceId: 'n2', targetId: 'n3', color: '#f472b6', width: 4, 
        path: generateLinePath(getCoords(n2, n3)), trafficSpeed: 0.8, trafficDensity: 0.015,
        label: "JDBC", labelSize: 10, labelColor: '#ffffff', showLabelBackground: true
    },
    { 
        id: 'l3', sourceId: 'n4', targetId: 'n1', color: '#60a5fa', width: 2, 
        path: generateLinePath(getCoords(n4, n1)), trafficSpeed: 1.5, trafficDensity: 0.03,
        label: "WebSocket", labelSize: 10, labelColor: '#ffffff', showLabelBackground: true
    },
];
