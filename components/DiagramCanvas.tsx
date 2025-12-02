
import React, { useRef, useState, useEffect } from 'react';
import { Node, Link, Signal } from '../types';
import { ZoomIn, ZoomOut, Maximize, Move } from 'lucide-react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';

interface DiagramCanvasProps {
    nodes: Node[];
    links: Link[];
    signals: Signal[];
    tool: 'SELECT' | 'RECT' | 'CIRCLE' | 'TEXT' | 'CONNECT';
    selection: { nodes: string[], links: string[] };
    onNodeMove: (id: string, x: number, y: number) => void;
    onNodeResize: (id: string, w: number, h: number) => void;
    onNodeClick: (id: string, shiftKey: boolean) => void;
    onLinkClick: (id: string, shiftKey: boolean) => void;
    onCanvasClick: (x: number, y: number) => void;
    connectionStartId: string | null;
}

interface Guide {
    type: 'vertical' | 'horizontal';
    pos: number;
}

const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ 
    nodes, links, signals, tool, selection, 
    onNodeMove, onNodeResize, onNodeClick, onLinkClick, onCanvasClick,
    connectionStartId
}) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRefs = useRef<{ [key: string]: SVGPathElement | null }>({});
    
    // Transform State
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 0.8 });
    const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
    const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
    const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
    const lastMousePos = useRef({ x: 0, y: 0 });

    // Alignment Guides State
    const [guides, setGuides] = useState<Guide[]>([]);

    // Link Metrics (Label Positions)
    const [linkMetrics, setLinkMetrics] = useState<Record<string, {x: number, y: number, angle: number}>>({});

    const centerView = () => {
        if (nodes.length > 0) {
            const padding = 100;
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            
            nodes.forEach(n => {
                minX = Math.min(minX, n.x - n.width/2);
                maxX = Math.max(maxX, n.x + n.width/2);
                minY = Math.min(minY, n.y - n.height/2);
                maxY = Math.max(maxY, n.y + n.height/2);
            });

            // If only one node or tight cluster, add minimum padding
            if (maxX - minX < 200) { minX -= 100; maxX += 100; }
            if (maxY - minY < 200) { minY -= 100; maxY += 100; }

            const contentWidth = maxX - minX + padding * 2;
            const contentHeight = maxY - minY + padding * 2;
            const contentCenterX = (minX + maxX) / 2;
            const contentCenterY = (minY + maxY) / 2;

            const k = Math.min(CANVAS_WIDTH / contentWidth, CANVAS_HEIGHT / contentHeight, 2); // Max zoom 2x
            
            setTransform({
                x: (CANVAS_WIDTH / 2) - (contentCenterX * k),
                y: (CANVAS_HEIGHT / 2) - (contentCenterY * k),
                k
            });
        } else {
             setTransform({ x: 0, y: 0, k: 0.8 });
        }
    };

    // Auto-center on mount
    useEffect(() => {
        centerView();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // Calculate Link Metrics (Center point & Angle)
    useEffect(() => {
        const newMetrics: Record<string, any> = {};
        links.forEach(link => {
            const el = pathRefs.current[link.id];
            if (el && link.label) {
                const len = el.getTotalLength();
                if (len > 0) {
                    const pt = el.getPointAtLength(len / 2);
                    // Always horizontal: angle is 0
                    newMetrics[link.id] = { x: pt.x, y: pt.y, angle: 0 };
                }
            }
        });
        setLinkMetrics(newMetrics);
    }, [links, nodes]); 

    const getSvgCoordinates = (clientX: number, clientY: number) => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const screenCTM = svg.getScreenCTM();
        if (screenCTM) {
            const svgPoint = pt.matrixTransform(screenCTM.inverse());
            return {
                x: (svgPoint.x - transform.x) / transform.k,
                y: (svgPoint.y - transform.y) / transform.k
            };
        }
        return { x: 0, y: 0 };
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!draggingNodeId && !resizingNodeId) {
             setIsDraggingCanvas(true);
             lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const coords = getSvgCoordinates(e.clientX, e.clientY);

        // 1. Resize Node
        if (resizingNodeId) {
            e.preventDefault();
            const node = nodes.find(n => n.id === resizingNodeId);
            if (node) {
                const dx = Math.abs(coords.x - node.x);
                const dy = Math.abs(coords.y - node.y);
                const newSize = Math.max(20, Math.max(dx, dy) * 2); 
                
                if (node.type === 'circle') {
                    onNodeResize(resizingNodeId, newSize, newSize);
                } else {
                     onNodeResize(resizingNodeId, dx * 2, dy * 2);
                }
            }
            return;
        }

        // 2. Drag Node with Snapping
        if (draggingNodeId) {
            e.preventDefault();
            
            let newX = coords.x;
            let newY = coords.y;

            // Basic grid snap as fallback
            newX = Math.round(newX / 10) * 10;
            newY = Math.round(newY / 10) * 10;

            const SNAP_THRESHOLD = 15;
            const newGuides: Guide[] = [];

            // Alignment Snapping
            // We check against all other nodes
            let snappedX = false;
            let snappedY = false;

            nodes.forEach(other => {
                if (other.id === draggingNodeId) return;

                // Center X
                if (Math.abs(other.x - newX) < SNAP_THRESHOLD) {
                    newX = other.x;
                    if (!snappedX) {
                        newGuides.push({ type: 'vertical', pos: other.x });
                        snappedX = true;
                    }
                }

                // Center Y
                if (Math.abs(other.y - newY) < SNAP_THRESHOLD) {
                    newY = other.y;
                    if (!snappedY) {
                        newGuides.push({ type: 'horizontal', pos: other.y });
                        snappedY = true;
                    }
                }
            });

            setGuides(newGuides);
            onNodeMove(draggingNodeId, newX, newY);
            return;
        }

        // 3. Pan Canvas
        if (isDraggingCanvas) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        }
    };

    const handleMouseUp = () => {
        setIsDraggingCanvas(false);
        setDraggingNodeId(null);
        setResizingNodeId(null);
        setGuides([]); // Clear guides
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const factor = e.deltaY > 0 ? 0.9 : 1.1;
        const newK = Math.max(0.1, Math.min(5, transform.k * factor));
        setTransform(prev => ({ ...prev, k: newK }));
    };

    const setPathRef = (id: string, el: SVGPathElement | null) => {
        pathRefs.current[id] = el;
    };

    return (
        <div 
            className={`w-full h-full overflow-hidden ${tool === 'SELECT' ? 'cursor-grab' : 'cursor-crosshair'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
             {/* Controls */}
             <div className="absolute top-20 right-6 flex flex-col items-center gap-1 z-10 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl p-2 shadow-xl">
                <button 
                    onClick={() => setTransform(p => ({...p, k: p.k * 1.2}))} 
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                    title="Zoom In"
                    aria-label="Zoom In"
                >
                    <ZoomIn className="w-5 h-5"/>
                </button>
                <div className="h-px w-6 bg-gray-800" />
                <button 
                    onClick={() => setTransform(p => ({...p, k: p.k * 0.8}))} 
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                    title="Zoom Out"
                    aria-label="Zoom Out"
                >
                    <ZoomOut className="w-5 h-5"/>
                </button>
                <div className="h-px w-6 bg-gray-800" />
                <button 
                    onClick={centerView} 
                    className="p-2 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                    title="Fit to Screen"
                    aria-label="Fit to Screen"
                >
                    <Maximize className="w-5 h-5"/>
                </button>
             </div>

            <svg 
                ref={svgRef}
                id="diagram-svg"
                viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`}
                className="w-full h-full outline-none"
                style={{ backgroundColor: '#111827' }}
                onClick={(e) => {
                    if (!isDraggingCanvas && !draggingNodeId && !resizingNodeId) {
                        const c = getSvgCoordinates(e.clientX, e.clientY);
                        onCanvasClick(c.x, c.y);
                    }
                }}
            >
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <circle cx="2" cy="2" r="1" fill="#374151" opacity="0.5" />
                    </pattern>
                </defs>

                <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                    <rect id="canvas-grid-rect" x={-CANVAS_WIDTH} y={-CANVAS_HEIGHT} width={CANVAS_WIDTH*4} height={CANVAS_HEIGHT*4} fill="url(#grid)" pointerEvents="none" />

                    {/* Guides */}
                    {guides.map((g, i) => (
                        g.type === 'vertical' 
                        ? <line key={i} x1={g.pos} y1={-CANVAS_HEIGHT} x2={g.pos} y2={CANVAS_HEIGHT} stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" className="opacity-70" />
                        : <line key={i} x1={-CANVAS_WIDTH} y1={g.pos} x2={CANVAS_WIDTH} y2={g.pos} stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 2" className="opacity-70" />
                    ))}

                    {/* Links */}
                    {links.map(link => {
                        const isSelected = selection.links.includes(link.id);
                        return (
                            <g key={link.id} onClick={(e) => { e.stopPropagation(); onLinkClick(link.id, e.shiftKey); }}>
                                {/* Hover/Select Area */}
                                <path d={link.path} stroke="transparent" strokeWidth="20" fill="none" className="cursor-pointer hover:stroke-white/10" />
                                {/* Main Line */}
                                <path 
                                    ref={(el) => setPathRef(link.id, el)}
                                    d={link.path} 
                                    stroke={link.color} 
                                    strokeWidth={link.width} 
                                    fill="none" 
                                    strokeLinecap="round"
                                    strokeOpacity={0.4}
                                />
                                {isSelected && (
                                    <path d={link.path} stroke="#fff" strokeWidth="1" strokeDasharray="4 4" fill="none" className="animate-pulse" />
                                )}
                            </g>
                        );
                    })}

                    {/* Link Labels */}
                    {links.map(link => {
                        const metric = linkMetrics[link.id];
                        if (!link.label || !metric) return null;
                        
                        const fontSize = link.labelSize || 12;
                        const charWidth = fontSize * 0.6;
                        const width = (link.label.length * charWidth) + fontSize; // add some padding
                        const height = fontSize * 1.5;
                        const yOffset = -(height / 2);
                        const showBg = link.showLabelBackground !== false; // Default to true if undefined

                        return (
                            <g 
                                key={`label-${link.id}`}
                                transform={`translate(${metric.x}, ${metric.y}) rotate(${metric.angle})`}
                                className="pointer-events-none select-none"
                            >
                                {showBg && (
                                    <rect 
                                        x={-width / 2} 
                                        y={yOffset} 
                                        width={width} 
                                        height={height} 
                                        rx={4} 
                                        fill={link.color} // Match link color
                                        fillOpacity="0.2"
                                        stroke={link.color}
                                        strokeWidth="1"
                                    />
                                )}
                                <text 
                                    textAnchor="middle" 
                                    dominantBaseline="middle" 
                                    fill={link.labelColor || '#ffffff'} 
                                    fontSize={fontSize} 
                                    fontWeight="bold"
                                    style={{ textShadow: showBg ? '0 1px 2px black' : '0 2px 4px black' }}
                                >
                                    {link.label}
                                </text>
                            </g>
                        );
                    })}

                    {/* Signals */}
                    {signals.map(sig => {
                        const pathEl = pathRefs.current[sig.linkId];
                        if (!pathEl) return null;
                        const len = pathEl.getTotalLength();
                        const pt = pathEl.getPointAtLength(sig.progress * len);
                        return (
                            <circle 
                                key={sig.id} 
                                cx={pt.x} 
                                cy={pt.y} 
                                r={4} 
                                fill={sig.color} 
                                className="drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                            />
                        );
                    })}

                    {/* Nodes */}
                    {nodes.map(node => {
                        const isSelected = selection.nodes.includes(node.id);
                        const isConnecting = connectionStartId === node.id;
                        const isText = node.type === 'text';
                        const strokeDasharray = node.borderStyle === 'dashed' ? '6 4' : undefined;
                        
                        return (
                            <g 
                                key={node.id} 
                                transform={`translate(${node.x}, ${node.y})`}
                                onClick={(e) => { e.stopPropagation(); onNodeClick(node.id, e.shiftKey); }}
                                onMouseDown={(e) => {
                                    if (tool === 'SELECT') {
                                        e.stopPropagation();
                                        // Usually dragging selects the item first if not selected
                                        if (!isSelected && !e.shiftKey) {
                                            onNodeClick(node.id, false);
                                        }
                                        setDraggingNodeId(node.id);
                                    }
                                }}
                                className={`cursor-pointer transition-opacity ${isConnecting ? 'opacity-100' : (connectionStartId ? 'opacity-50 hover:opacity-100' : 'opacity-100')}`}
                            >
                                {/* Selection Glow */}
                                {isSelected && (
                                    node.type === 'circle' 
                                    ? <circle r={node.width/2 + 6} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 4" className="animate-spin-slow" />
                                    : <rect x={-node.width/2 - 6} y={-node.height/2 - 6} width={node.width + 12} height={node.height + 12} fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="6 4" />
                                )}

                                {/* Shape */}
                                {node.type === 'circle' ? (
                                    <circle 
                                        r={node.width / 2} 
                                        fill={node.color} 
                                        stroke={node.borderColor} 
                                        strokeWidth={node.borderWidth}
                                        strokeDasharray={strokeDasharray}
                                        className="shadow-xl"
                                    />
                                ) : (
                                    <rect 
                                        x={-node.width / 2} 
                                        y={-node.height / 2} 
                                        width={node.width} 
                                        height={node.height} 
                                        rx={isText ? 0 : 8} 
                                        fill={node.color} 
                                        stroke={node.borderColor} 
                                        strokeWidth={node.borderWidth}
                                        strokeDasharray={strokeDasharray}
                                    />
                                )}

                                {/* Label */}
                                <text 
                                    y={isText ? 0 : 5}
                                    dominantBaseline={isText ? "middle" : "auto"}
                                    textAnchor="middle" 
                                    fill={node.labelColor} 
                                    fontSize={node.fontSize} // Use property
                                    fontWeight="bold"
                                    className="pointer-events-none select-none"
                                >
                                    {node.label}
                                </text>

                                {/* Resize Handle (Only when selected and singular) */}
                                {isSelected && selection.nodes.length === 1 && (
                                    <circle 
                                        cx={node.width / 2} 
                                        cy={node.height / 2} 
                                        r={6} 
                                        fill="#22d3ee" 
                                        className="cursor-nwse-resize transition-transform"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizingNodeId(node.id);
                                        }}
                                    />
                                )}
                            </g>
                        );
                    })}
                </g>
            </svg>
        </div>
    );
};

export default DiagramCanvas;
