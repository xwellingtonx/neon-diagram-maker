
import React, { useState, useEffect, useRef, useCallback } from 'react';
import DiagramCanvas from './components/DiagramCanvas';
import Controls from './components/Controls';
import EditorPanel from './components/MapEditor';
import WelcomeScreen from './components/WelcomeScreen';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './constants';
import { Node, Link, Signal, DiagramData } from './types';
import { generateLinePath, getBestConnection } from './utils/geometry';

const App: React.FC = () => {
    const [isInitialized, setIsInitialized] = useState(false);

    // Data State
    const [nodes, setNodes] = useState<Node[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [signals, setSignals] = useState<Signal[]>([]);
    const [projectName, setProjectName] = useState('Neon Architect Diagram');
    
    // UI State
    const [selection, setSelection] = useState<{ nodes: string[], links: string[] }>({ nodes: [], links: [] });
    const [isPlaying, setIsPlaying] = useState(true);
    const [globalSpeed, setGlobalSpeed] = useState(1);
    
    // Editor State
    const [tool, setTool] = useState<'SELECT' | 'RECT' | 'CIRCLE' | 'TEXT' | 'CONNECT' | 'SVG'>('SELECT');
    const [connectionStartId, setConnectionStartId] = useState<string | null>(null);
    const [cornerRadius, setCornerRadius] = useState(24);
    
    // Clipboard
    const [clipboard, setClipboard] = useState<Node | null>(null);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recordingProgress, setRecordingProgress] = useState(0);
    const [exportFps, setExportFps] = useState(30);
    const [exportResolution, setExportResolution] = useState<string>('720p');
    
    const gifRef = useRef<any>(null);
    const recordingFramesRef = useRef(0);
    const TOTAL_RECORDING_FRAMES = 90; // Default length (e.g., 3 seconds at 30fps)
    const isFinishingRef = useRef(false);

    // Default props for new nodes
    const [defaultNodeProps, setDefaultNodeProps] = useState<Partial<Node>>({
        color: '#1f2937',
        borderColor: '#9ca3af',
        borderWidth: 2,
        borderStyle: 'solid',
        labelColor: '#ffffff',
        fontSize: 14,
        width: 80,
        height: 80,
        iconName: 'Box',
        iconColor: '#ffffff'
    });

    // Default props for new links
    const [defaultLinkProps, setDefaultLinkProps] = useState<Partial<Link>>({
        color: '#22d3ee',
        width: 3,
        trafficSpeed: 1,
        trafficDensity: 0.02,
        labelSize: 12,
        labelColor: '#ffffff',
        showLabelBackground: true
    });

    // History
    const [history, setHistory] = useState<{nodes: Node[], links: Link[]}[]>([]);

    const requestRef = useRef<number | undefined>(undefined);
    const previousTimeRef = useRef<number | undefined>(undefined);

    // --- History ---
    const pushHistory = useCallback(() => {
        setHistory(prev => {
            const newState = { nodes: [...nodes], links: [...links] };
            const newHistory = [...prev, newState];
            if (newHistory.length > 30) return newHistory.slice(newHistory.length - 30);
            return newHistory;
        });
    }, [nodes, links]);

    const handleUndo = useCallback(() => {
        setHistory(prev => {
            if (prev.length === 0) return prev;
            const newHistory = [...prev];
            const lastState = newHistory.pop();
            if (lastState) {
                setNodes(lastState.nodes);
                setLinks(lastState.links);
                setSelection({ nodes: [], links: [] });
            }
            return newHistory;
        });
    }, []);

    // --- Path Updating ---
    const updateLinkPaths = useCallback((currentNodes: Node[], currentLinks: Link[], radius: number) => {
        return currentLinks.map(link => {
            const source = currentNodes.find(n => n.id === link.sourceId);
            const target = currentNodes.find(n => n.id === link.targetId);
            // If nodes missing, keep old path if exists, else empty
            if (!source || !target) return link;
            
            const { start, end } = getBestConnection(source, target);
            return {
                ...link,
                path: generateLinePath([start, end], radius)
            };
        });
    }, []);

    // Effect to update paths when nodes move or corner radius changes
    useEffect(() => {
        if (!isInitialized) return;
        setLinks(prev => updateLinkPaths(nodes, prev, cornerRadius));
    }, [nodes, cornerRadius, isInitialized, updateLinkPaths]);


    // --- Import / Export ---
    const handleStartFromData = (data: DiagramData) => {
        // Sanitize and load data
        const safeNodes = (data.nodes || []).map(n => ({
            ...n,
            // Defaults if missing
            color: n.color || defaultNodeProps.color!,
            borderColor: n.borderColor || defaultNodeProps.borderColor!,
            borderWidth: n.borderWidth ?? defaultNodeProps.borderWidth!,
            borderStyle: n.borderStyle || 'solid',
            labelColor: n.labelColor || defaultNodeProps.labelColor!,
            fontSize: n.fontSize ?? defaultNodeProps.fontSize!,
            iconName: n.iconName || (n.type === 'svg' ? 'Box' : undefined),
            iconColor: n.iconColor || defaultNodeProps.iconColor!
        }));

        const safeLinks = (data.links || []).map(l => ({
            ...l,
            width: l.width ?? defaultLinkProps.width!,
            trafficSpeed: l.trafficSpeed ?? defaultLinkProps.trafficSpeed!,
            trafficDensity: l.trafficDensity ?? defaultLinkProps.trafficDensity!,
            color: l.color || defaultLinkProps.color!,
            labelSize: l.labelSize || defaultLinkProps.labelSize!,
            labelColor: l.labelColor || defaultLinkProps.labelColor!,
            showLabelBackground: l.showLabelBackground !== false // Default true if undefined
        }));
        
        // Settings
        if (data.globalSettings) {
            if (data.globalSettings.cornerRadius !== undefined) setCornerRadius(data.globalSettings.cornerRadius);
            if (data.globalSettings.globalSpeed !== undefined) setGlobalSpeed(data.globalSettings.globalSpeed);
        }

        // Calculate paths immediately for the new data
        const linksWithPaths = updateLinkPaths(safeNodes, safeLinks as Link[], data.globalSettings?.cornerRadius || cornerRadius);

        setNodes(safeNodes as Node[]);
        setLinks(linksWithPaths);
        setIsInitialized(true);
        setHistory([]); // Clear history on new load
    };

    const handleExport = () => {
        const data: DiagramData = {
            nodes,
            links: links.map(({path, ...l}) => l), // Strip path to keep JSON clean (optional, but cleaner)
            globalSettings: {
                cornerRadius,
                globalSpeed
            }
        };

        const safeName = projectName.trim().replace(/[^a-z0-9_\- ]/gi, '').replace(/\s+/g, '_') || 'diagram';
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${safeName}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleHome = () => {
        setIsInitialized(false);
    };


    // --- GIF Worker Loader ---
    const getWorkerBlobUrl = async () => {
        const response = await fetch('https://unpkg.com/gif.js@0.2.0/dist/gif.worker.js');
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    };

    // --- Canvas Capture Helper ---
    const captureFrameToCanvas = async (): Promise<HTMLCanvasElement | null> => {
        const svgEl = document.getElementById('diagram-svg');
        if (!svgEl) return null;
        
        // 1. Clone & Prepare SVG for Transparency
        const clonedSvg = svgEl.cloneNode(true) as SVGElement;
        
        // Remove Grid ID
        const gridRect = clonedSvg.querySelector('#canvas-grid-rect');
        if (gridRect) gridRect.remove();

        // Explicitly set background to transparent on the clone
        clonedSvg.style.backgroundColor = 'transparent';

        // --- AUTOMATIC CENTERING LOGIC FOR EXPORT ---
        if (nodes.length > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            nodes.forEach(n => {
                minX = Math.min(minX, n.x - n.width/2);
                maxX = Math.max(maxX, n.x + n.width/2);
                minY = Math.min(minY, n.y - n.height/2);
                maxY = Math.max(maxY, n.y + n.height/2);
            });

            const padding = 50;
            const contentX = minX - padding;
            const contentY = minY - padding;
            const contentW = (maxX - minX) + padding * 2;
            const contentH = (maxY - minY) + padding * 2;

            // Update ViewBox to frame the content
            clonedSvg.setAttribute('viewBox', `${contentX} ${contentY} ${contentW} ${contentH}`);

            // IMPORTANT: Remove the transform on the group
            const contentGroup = clonedSvg.querySelector('g');
            if (contentGroup) {
                contentGroup.removeAttribute('transform');
            }
        }
        
        // 2. Serialize SVG
        const s = new XMLSerializer().serializeToString(clonedSvg);
        const src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

        // 3. Determine Dimensions based on Selection
        let targetW = 1080;
        let targetH = 1080;
        if (exportResolution === '720p') { targetW = 1280; targetH = 720; }
        if (exportResolution === '1080p') { targetW = 1920; targetH = 1080; }
        if (exportResolution === 'square') { targetW = 1080; targetH = 1080; }

        return new Promise<HTMLCanvasElement | null>((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = targetW; 
                canvas.height = targetH;
                
                const ctx = canvas.getContext('2d');
                if(ctx) {
                    // TRANSPARENCY: Clear background to fully transparent
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    
                    // Calculate aspect ratios
                    let contentAspect = 1;
                    if (nodes.length > 0) {
                         let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                         nodes.forEach(n => {
                             minX = Math.min(minX, n.x - n.width/2);
                             maxX = Math.max(maxX, n.x + n.width/2);
                             minY = Math.min(minY, n.y - n.height/2);
                             maxY = Math.max(maxY, n.y + n.height/2);
                         });
                         contentAspect = ((maxX - minX) + 100) / ((maxY - minY) + 100);
                    }

                    const targetAspect = targetW / targetH;
                    
                    let drawW, drawH, offsetX, offsetY;
                    
                    if (contentAspect > targetAspect) {
                        // Content is wider than target
                        drawW = targetW;
                        drawH = targetW / contentAspect;
                        offsetX = 0;
                        offsetY = (targetH - drawH) / 2;
                    } else {
                        // Content is taller than target
                        drawH = targetH;
                        drawW = targetH * contentAspect;
                        offsetX = (targetW - drawW) / 2;
                        offsetY = 0;
                    }

                    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
                    resolve(canvas);
                } else {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    };

    const handleStartRecording = async () => {
        if (!(window as any).GIF) {
            alert("GIF encoder library not loaded.");
            return;
        }
        
        setIsProcessing(true); 
        
        try {
            const workerUrl = await getWorkerBlobUrl();
            
            setIsProcessing(false);
            setIsRecording(true);
            setRecordingProgress(0);
            recordingFramesRef.current = 0;
            isFinishingRef.current = false;

            // Initialize GIF.js
            gifRef.current = new (window as any).GIF({
                workers: 2,
                quality: 10,
                width: exportResolution === '720p' ? 1280 : (exportResolution === '1080p' ? 1920 : 1080),
                height: exportResolution === '720p' ? 720 : 1080,
                workerScript: workerUrl,
                transparent: 0x000000 // Treat black pixels (0,0,0,0) as transparent key
            });

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            alert("Failed to initialize GIF worker.");
        }
    };

    const finishRecording = () => {
        if (!gifRef.current || isFinishingRef.current) return;
        
        isFinishingRef.current = true;
        setIsRecording(false);
        setIsProcessing(true);
        
        gifRef.current.on('finished', (blob: Blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const safeName = projectName.trim().replace(/[^a-z0-9_\- ]/gi, '').replace(/\s+/g, '_') || 'animation';
            a.download = `${safeName}-${exportResolution}.gif`;
            a.click();
            setIsProcessing(false);
            gifRef.current = null;
            isFinishingRef.current = false;
        });
        gifRef.current.render();
    };

    // --- Animation Loop ---
    const updateSignals = (dt: number) => {
        const timeScale = dt / 16.667;

        // 1. Spawn new signals
        const newSignals: Signal[] = [];
        if (isPlaying && isInitialized) {
            links.forEach(link => {
                const spawnChance = link.trafficDensity * 0.5 * globalSpeed * timeScale;
                
                if (Math.random() < spawnChance) {
                    newSignals.push({
                        id: `sig-${Date.now()}-${Math.random()}`,
                        linkId: link.id,
                        progress: 0,
                        speed: 0.005 * link.trafficSpeed,
                        color: link.color
                    });
                }
            });
        }

        // 2. Move existing signals
        setSignals(prev => {
            const updated = [...prev, ...newSignals].map(sig => ({
                ...sig,
                progress: sig.progress + (sig.speed * globalSpeed * timeScale)
            })).filter(sig => sig.progress < 1);
            return updated;
        });
    };

    const animate = useCallback(async (time: number) => {
        const deltaTime = previousTimeRef.current !== undefined ? time - previousTimeRef.current : 16;
        
        if (isRecording) {
            if (isFinishingRef.current) return;

            const fixedDt = 1000 / exportFps;
            
            updateSignals(fixedDt); 

            const canvas = await captureFrameToCanvas();
            
            if (canvas && gifRef.current && !isFinishingRef.current) {
                gifRef.current.addFrame(canvas, { delay: 1000 / exportFps, copy: true });
            }
            
            recordingFramesRef.current += 1;
            setRecordingProgress(Math.round((recordingFramesRef.current / TOTAL_RECORDING_FRAMES) * 100));

            if (recordingFramesRef.current >= TOTAL_RECORDING_FRAMES) {
                finishRecording();
                previousTimeRef.current = undefined;
            } else {
                requestRef.current = requestAnimationFrame(animate);
            }
        } else {
            if (!isProcessing) {
                const safeDt = Math.min(deltaTime, 100);
                updateSignals(safeDt);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        }
    }, [links, isPlaying, globalSpeed, isRecording, isProcessing, exportFps, exportResolution, isInitialized]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(animate);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [animate]);

    // --- Handlers ---
    
    const handleNodeMove = (id: string, x: number, y: number) => {
        setNodes(prevNodes => {
            const movedNode = prevNodes.find(n => n.id === id);
            if (!movedNode) return prevNodes;

            const dx = x - movedNode.x;
            const dy = y - movedNode.y;
            
            const isSelected = selection.nodes.includes(id);
            let newNodes = prevNodes;

            if (isSelected && selection.nodes.length > 1) {
                newNodes = prevNodes.map(n => {
                    if (selection.nodes.includes(n.id)) {
                        return { ...n, x: n.x + dx, y: n.y + dy };
                    }
                    return n;
                });
            } else {
                newNodes = prevNodes.map(n => n.id === id ? { ...n, x, y } : n);
            }
            
            // Note: Links update via effect now
            return newNodes;
        });
    };

    const handleNodeResize = (id: string, width: number, height: number) => {
        setNodes(prev => prev.map(n => n.id === id ? { ...n, width, height } : n));
    };

    const handleCanvasClick = (x: number, y: number) => {
        setSelection({ nodes: [], links: [] });
        
        if (tool === 'RECT' || tool === 'CIRCLE' || tool === 'TEXT' || tool === 'SVG') {
            pushHistory();
            const snapX = Math.round(x / 20) * 20;
            const snapY = Math.round(y / 20) * 20;
            
            const isText = tool === 'TEXT';
            const isSvg = tool === 'SVG';
            
            const newNode: Node = {
                id: `n-${Date.now()}`,
                type: isText ? 'text' : (isSvg ? 'svg' : (tool === 'RECT' ? 'rect' : 'circle')),
                label: isText ? 'New Text' : (isSvg ? 'New Icon' : `Node ${nodes.length + 1}`),
                x: snapX,
                y: snapY,
                width: isText ? 100 : (defaultNodeProps.width || 80),
                height: isText ? 30 : (tool === 'CIRCLE' ? (defaultNodeProps.width || 80) : (defaultNodeProps.height || 80)),
                color: isText ? 'rgba(0,0,0,0)' : (defaultNodeProps.color || '#333'),
                borderColor: isText ? 'rgba(0,0,0,0)' : (defaultNodeProps.borderColor || '#fff'),
                borderWidth: defaultNodeProps.borderWidth || 2,
                borderStyle: isText ? 'solid' : (defaultNodeProps.borderStyle || 'solid'),
                labelColor: defaultNodeProps.labelColor || '#fff',
                fontSize: defaultNodeProps.fontSize || 14,
                iconName: isSvg ? 'Box' : undefined,
                iconColor: defaultNodeProps.iconColor || '#ffffff'
            };
            setNodes(prev => [...prev, newNode]);
            setTool('SELECT');
            setSelection({ nodes: [newNode.id], links: [] });
        }
    };

    const handleNodeClick = (id: string, shiftKey: boolean) => {
        if (tool === 'CONNECT') {
            if (!connectionStartId) {
                setConnectionStartId(id);
            } else {
                if (connectionStartId !== id) {
                    pushHistory();
                    const source = nodes.find(n => n.id === connectionStartId);
                    const target = nodes.find(n => n.id === id);
                    if (source && target) {
                        const { start, end } = getBestConnection(source, target);
                        
                        const newLink: Link = {
                            id: `l-${Date.now()}`,
                            sourceId: source.id,
                            targetId: target.id,
                            path: generateLinePath([start, end], cornerRadius),
                            color: defaultLinkProps.color || '#22d3ee',
                            width: defaultLinkProps.width || 3,
                            trafficSpeed: defaultLinkProps.trafficSpeed || 1,
                            trafficDensity: defaultLinkProps.trafficDensity || 0.02,
                            labelSize: defaultLinkProps.labelSize || 12,
                            labelColor: defaultLinkProps.labelColor || '#ffffff',
                            showLabelBackground: defaultLinkProps.showLabelBackground !== false
                        };
                        setLinks(prev => [...prev, newLink]);
                    }
                }
                setConnectionStartId(null);
            }
        } else {
            setSelection(prev => {
                if (shiftKey) {
                    const newNodes = prev.nodes.includes(id) 
                        ? prev.nodes.filter(n => n !== id)
                        : [...prev.nodes, id];
                    return { nodes: newNodes, links: prev.links }; 
                } else {
                    return { nodes: [id], links: [] }; 
                }
            });
        }
    };

    const handleLinkClick = (id: string, shiftKey: boolean) => {
        if (tool === 'SELECT') {
             setSelection(prev => {
                if (shiftKey) {
                    const newLinks = prev.links.includes(id) 
                        ? prev.links.filter(l => l !== id)
                        : [...prev.links, id];
                    return { nodes: prev.nodes, links: newLinks }; 
                } else {
                    return { nodes: [], links: [id] }; 
                }
            });
        }
    };

    const handleUpdateItem = (updates: any) => {
        pushHistory();
        if (selection.nodes.length > 0) {
            setNodes(prev => prev.map(n => selection.nodes.includes(n.id) ? { ...n, ...updates } : n));
        }
        if (selection.links.length > 0) {
            setLinks(prev => prev.map(l => selection.links.includes(l.id) ? { ...l, ...updates } : l));
        }
    };

    const handleDelete = () => {
        if (selection.nodes.length === 0 && selection.links.length === 0) return;
        pushHistory();
        
        const nodesToDelete = selection.nodes;
        const linksToDelete = selection.links;

        setNodes(prev => prev.filter(n => !nodesToDelete.includes(n.id)));
        setLinks(prev => prev.filter(l => 
            !linksToDelete.includes(l.id) && 
            !nodesToDelete.includes(l.sourceId) && 
            !nodesToDelete.includes(l.targetId)
        ));
        
        setSelection({ nodes: [], links: [] });
    };

    const handleClear = () => {
        pushHistory();
        setNodes([]);
        setLinks([]);
        setSignals([]);
        setSelection({ nodes: [], links: [] });
    };

    const handleBringToFront = () => {
        if (selection.nodes.length > 0) {
            setNodes(prev => {
                const selected = prev.filter(n => selection.nodes.includes(n.id));
                const others = prev.filter(n => !selection.nodes.includes(n.id));
                return [...others, ...selected];
            });
        }
        if (selection.links.length > 0) {
            setLinks(prev => {
                const selected = prev.filter(l => selection.links.includes(l.id));
                const others = prev.filter(l => !selection.links.includes(l.id));
                return [...others, ...selected];
            });
        }
    };

    const handleSendToBack = () => {
        if (selection.nodes.length > 0) {
            setNodes(prev => {
                const selected = prev.filter(n => selection.nodes.includes(n.id));
                const others = prev.filter(n => !selection.nodes.includes(n.id));
                return [...selected, ...others];
            });
        }
        if (selection.links.length > 0) {
            setLinks(prev => {
                const selected = prev.filter(l => selection.links.includes(l.id));
                const others = prev.filter(l => !selection.links.includes(l.id));
                return [...others, ...selected];
            });
        }
    };

    // Keyboard shortcuts
    useEffect(() => {
        if (!isInitialized) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

            if (e.key === 'Delete' || e.key === 'Backspace') handleDelete();
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); handleUndo(); }
            
            if ((e.ctrlKey || e.metaKey) && e.key === 'c' && selection.nodes.length === 1) {
                const n = nodes.find(no => no.id === selection.nodes[0]);
                if (n) setClipboard(n);
            }
            if ((e.ctrlKey || e.metaKey) && e.key === 'v' && clipboard) {
                pushHistory();
                const newNode = {
                    ...clipboard,
                    id: `n-${Date.now()}`,
                    x: clipboard.x + 20,
                    y: clipboard.y + 20
                };
                setNodes(prev => [...prev, newNode]);
                setSelection({ nodes: [newNode.id], links: [] });
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selection, nodes, clipboard, handleUndo, isInitialized]);

    if (!isInitialized) {
        return <WelcomeScreen onStart={handleStartFromData} />;
    }

    return (
        <div className="flex h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">
            {/* Left Tools / Editor */}
            <EditorPanel 
                tool={tool}
                setTool={setTool}
                selection={selection}
                nodes={nodes}
                links={links}
                onUpdateItem={handleUpdateItem}
                onDelete={handleDelete}
                onClear={handleClear}
                onBringToFront={handleBringToFront}
                onSendToBack={handleSendToBack}
                defaultNodeProps={defaultNodeProps}
                setDefaultNodeProps={setDefaultNodeProps}
                defaultLinkProps={defaultLinkProps}
                setDefaultLinkProps={setDefaultLinkProps}
                cornerRadius={cornerRadius}
                setCornerRadius={setCornerRadius}
                onUndo={handleUndo}
                canUndo={history.length > 0}
                onExport={handleExport}
                onHome={handleHome}
                projectName={projectName}
                setProjectName={setProjectName}
            />

            {/* Main Canvas */}
            <div className="flex-1 relative bg-gray-900">
                <DiagramCanvas 
                    nodes={nodes}
                    links={links}
                    signals={signals}
                    tool={tool}
                    selection={selection}
                    onNodeMove={handleNodeMove}
                    onNodeResize={handleNodeResize}
                    onNodeClick={handleNodeClick}
                    onLinkClick={handleLinkClick}
                    onCanvasClick={handleCanvasClick}
                    connectionStartId={connectionStartId}
                />
            </div>

            {/* Global Playback Controls */}
            <Controls 
                isPlaying={isPlaying}
                togglePlay={() => setIsPlaying(!isPlaying)}
                globalSpeed={globalSpeed}
                setGlobalSpeed={setGlobalSpeed}
                isRecording={isRecording}
                onRecord={handleStartRecording}
                recordingProgress={recordingProgress}
                exportFps={exportFps}
                setExportFps={setExportFps}
                exportResolution={exportResolution}
                setExportResolution={setExportResolution}
                isProcessing={isProcessing}
            />
        </div>
    );
};

export default App;
