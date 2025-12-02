
import React, { useState, useEffect } from 'react';
import { MousePointer2, Circle, Square, ArrowRight, Trash2, RotateCcw, Type, Palette, AlignCenter, Sliders, Activity, Droplets, ChevronsUp, ChevronsDown, Save, Home, Settings, Tag, Eye, EyeOff } from 'lucide-react';
import { Node, Link } from '../types';

interface EditorPanelProps {
    tool: 'SELECT' | 'RECT' | 'CIRCLE' | 'CONNECT' | 'TEXT';
    setTool: (t: any) => void;
    selection: { nodes: string[], links: string[] };
    nodes: Node[];
    links: Link[];
    onUpdateItem: (updates: any) => void;
    onDelete: () => void;
    onClear: () => void;
    onBringToFront: () => void;
    onSendToBack: () => void;
    
    defaultNodeProps: Partial<Node>;
    setDefaultNodeProps: (p: Partial<Node>) => void;
    
    defaultLinkProps: Partial<Link>;
    setDefaultLinkProps: (p: Partial<Link>) => void;
    
    cornerRadius: number;
    setCornerRadius: (r: number) => void;
    onUndo: () => void;
    canUndo: boolean;

    onExport: () => void;
    onHome: () => void;

    projectName: string;
    setProjectName: (n: string) => void;
}

// Helper to parse/format colors
const parseColor = (c: string) => {
    let hex = '#000000';
    let alpha = 1;
    if (!c) return { hex, alpha };

    if (c.startsWith('#')) {
        hex = c;
        alpha = 1;
    } else if (c.startsWith('rgba')) {
        const match = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([0-9.]+))?\)/);
        if (match) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            alpha = match[4] ? parseFloat(match[4]) : 1;
            const toHex = (n: number) => n.toString(16).padStart(2, '0');
            hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        }
    }
    return { hex, alpha };
};

const formatColor = (hex: string, alpha: number) => {
    if (alpha >= 1) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ColorInput: React.FC<{ label: React.ReactNode, value: string, onChange: (val: string) => void }> = ({ label, value, onChange }) => {
    const { hex, alpha } = parseColor(value);
    
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(formatColor(e.target.value, alpha));
    };

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(formatColor(hex, parseFloat(e.target.value)));
    };

    return (
        <div className="space-y-1">
            <div className="flex justify-between items-center">
                 <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1">{label}</label>
                 <div className="flex items-center gap-1">
                     <div className="w-3 h-3 rounded-full border border-gray-600" style={{ backgroundColor: value }}></div>
                     <span className="text-[10px] text-gray-500 font-mono">{alpha < 1 ? `${Math.round(alpha * 100)}%` : '100%'}</span>
                 </div>
            </div>
            <div className="flex gap-2">
                <input 
                    type="color" 
                    value={hex} 
                    onChange={handleHexChange}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border border-gray-700 p-0.5" 
                />
                <div className="flex-1 flex flex-col justify-center">
                    <input 
                        type="range" 
                        min="0" max="1" step="0.01" 
                        value={alpha} 
                        onChange={handleAlphaChange}
                        className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                        title="Opacity"
                    />
                </div>
            </div>
            <input 
                type="text" 
                value={value} 
                onChange={(e) => onChange(e.target.value)}
                className="w-full text-[10px] bg-gray-800 border-none text-gray-500 px-1 py-0.5 rounded font-mono"
            />
        </div>
    );
};


const EditorPanel: React.FC<EditorPanelProps> = ({
    tool, setTool, selection, nodes, links, onUpdateItem, onDelete, onClear,
    defaultNodeProps, setDefaultNodeProps, defaultLinkProps, setDefaultLinkProps,
    cornerRadius, setCornerRadius, onUndo, canUndo,
    onBringToFront, onSendToBack, onExport, onHome,
    projectName, setProjectName
}) => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const hasSelection = selection.nodes.length > 0 || selection.links.length > 0;
    const isNodeSelected = selection.nodes.length > 0;
    const isLinkSelected = selection.links.length > 0;
    const multipleSelected = (selection.nodes.length + selection.links.length) > 1;

    // Use the first selected item as the representative for values
    const firstNodeId = selection.nodes[0];
    const firstLinkId = selection.links[0];
    const representativeNode = firstNodeId ? nodes.find(n => n.id === firstNodeId) : null;
    const representativeLink = firstLinkId ? links.find(l => l.id === firstLinkId) : null;

    // --- Visibility Logic ---
    const isCreatingNode = ['RECT', 'CIRCLE', 'TEXT'].includes(tool);
    const isCreatingLink = tool === 'CONNECT';
    const isSelectMode = tool === 'SELECT';
    
    // Auto-close settings if user interacts with tools or selection
    useEffect(() => {
        if (tool !== 'SELECT' || hasSelection) {
            setIsSettingsOpen(false);
        }
    }, [tool, hasSelection]);

    // Priority: Settings Toggle -> Creation Context -> Selection Context
    const showGlobalSettings = isSettingsOpen;
    const showNodeSettings = !isSettingsOpen && ((isSelectMode && isNodeSelected) || isCreatingNode);
    const showLinkSettings = !isSettingsOpen && ((isSelectMode && isLinkSelected) || isCreatingLink);
    
    // Determine if panel should be visible
    const showPanel = showGlobalSettings || showNodeSettings || showLinkSettings;

    // Header Title Logic
    const getHeaderTitle = () => {
        if (showGlobalSettings) return 'Global Settings';
        if (isSelectMode) {
            if (multipleSelected) return `Selected (${selection.nodes.length + selection.links.length})`;
            if (isNodeSelected) return 'Node Properties';
            if (isLinkSelected) return 'Link Properties';
        }
        if (isCreatingNode) return 'New Node Style';
        if (isCreatingLink) return 'New Link Style';
        return 'Settings';
    };

    const updateNodeProp = (key: string, value: any) => {
        if (isNodeSelected) {
            onUpdateItem({ [key]: value });
        } else {
            setDefaultNodeProps({ ...defaultNodeProps, [key]: value });
        }
    };

    const updateLinkProp = (key: string, value: any) => {
        if (isLinkSelected) {
            onUpdateItem({ [key]: value });
        } else {
            setDefaultLinkProps({ ...defaultLinkProps, [key]: value });
        }
    };

    // Values to Display
    const displayColor = isNodeSelected ? (representativeNode?.color || '#000') : (defaultNodeProps.color || '#1f2937');
    const displayBorderColor = isNodeSelected ? (representativeNode?.borderColor || '#fff') : (defaultNodeProps.borderColor || '#9ca3af');
    const displayLabelColor = isNodeSelected ? (representativeNode?.labelColor || '#fff') : (defaultNodeProps.labelColor || '#ffffff');
    const displayFontSize = isNodeSelected ? (representativeNode?.fontSize || 12) : (defaultNodeProps.fontSize || 14);
    const displayBorderStyle = isNodeSelected ? (representativeNode?.borderStyle || 'solid') : (defaultNodeProps.borderStyle || 'solid');

    const displayLinkColor = isLinkSelected ? (representativeLink?.color || '#22d3ee') : (defaultLinkProps.color || '#22d3ee');
    const displayTrafficSpeed = isLinkSelected ? (representativeLink?.trafficSpeed || 1) : (defaultLinkProps.trafficSpeed || 1);
    const displayTrafficDensity = isLinkSelected ? (representativeLink?.trafficDensity || 0.02) : (defaultLinkProps.trafficDensity || 0.02);
    const displayLinkLabel = isLinkSelected ? (representativeLink?.label || '') : (defaultLinkProps.label || '');
    const displayLinkLabelSize = isLinkSelected ? (representativeLink?.labelSize || 12) : (defaultLinkProps.labelSize || 12);
    const displayLinkLabelColor = isLinkSelected ? (representativeLink?.labelColor || '#fff') : (defaultLinkProps.labelColor || '#fff');
    // For boolean toggle, default to true if undefined
    const displayShowLabelBackground = isLinkSelected 
        ? (representativeLink?.showLabelBackground !== false) 
        : (defaultLinkProps.showLabelBackground !== false);


    return (
        <div className="absolute top-6 left-6 flex flex-col gap-3 z-20">
            {/* Tools Panel */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl p-3 shadow-xl w-14 flex flex-col items-center gap-3">
                <button 
                    onClick={() => {
                        setTool('SELECT');
                        setIsSettingsOpen(false);
                    }}
                    className={`p-2 rounded-lg transition-all ${tool === 'SELECT' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Select / Move"
                >
                    <MousePointer2 className="w-5 h-5" />
                </button>
                <div className="h-px w-8 bg-gray-800" />
                <button 
                    onClick={() => setTool(tool === 'RECT' ? 'SELECT' : 'RECT')}
                    className={`p-2 rounded-lg transition-all ${tool === 'RECT' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Add Rectangle"
                >
                    <Square className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setTool(tool === 'CIRCLE' ? 'SELECT' : 'CIRCLE')}
                    className={`p-2 rounded-lg transition-all ${tool === 'CIRCLE' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Add Circle"
                >
                    <Circle className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setTool(tool === 'TEXT' ? 'SELECT' : 'TEXT')}
                    className={`p-2 rounded-lg transition-all ${tool === 'TEXT' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Add Text"
                >
                    <Type className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => setTool(tool === 'CONNECT' ? 'SELECT' : 'CONNECT')}
                    className={`p-2 rounded-lg transition-all ${tool === 'CONNECT' ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Connect Nodes"
                >
                    <ArrowRight className="w-5 h-5" />
                </button>
                
                <div className="h-px w-8 bg-gray-800" />
                
                <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                    className={`p-2 rounded-lg transition-all ${isSettingsOpen ? 'bg-cyan-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                    title="Global Settings"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Properties Panel (Context Aware) */}
            {showPanel && (
                <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-xl w-64 max-h-[40vh] overflow-y-auto custom-scrollbar relative animate-in slide-in-from-left-2 fade-in duration-200">
                    
                    {/* Sticky Header */}
                    <div className="-mt-4 pt-4 pb-2 mb-2 bg-gray-900/95 z-10 border-b border-gray-800 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">
                            {getHeaderTitle()}
                        </span>
                        {/* Only show actions in Select Mode with selection */}
                        {hasSelection && isSelectMode && !isSettingsOpen && (
                            <div className="flex gap-1">
                                 <button onClick={onBringToFront} className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white" title="Bring to Front">
                                    <ChevronsUp className="w-4 h-4" />
                                </button>
                                <button onClick={onSendToBack} className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white" title="Send to Back">
                                    <ChevronsDown className="w-4 h-4" />
                                </button>
                                <button onClick={onDelete} className="p-1 rounded hover:bg-red-900/30 text-red-400 hover:text-red-300 ml-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {isSettingsOpen && (
                            <button onClick={() => setIsSettingsOpen(false)} className="text-gray-500 hover:text-white">
                                <span className="sr-only">Close</span>
                            </button>
                        )}
                    </div>

                    {/* Node Controls */}
                    {showNodeSettings && (
                        <div className="space-y-4">
                            {isNodeSelected && !multipleSelected && representativeNode && (
                                <div className="space-y-1">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Type className="w-3 h-3"/> Label</label>
                                    <input 
                                        type="text" 
                                        value={representativeNode.label} 
                                        onChange={(e) => onUpdateItem({ label: e.target.value })}
                                        className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            )}
                            
                            <ColorInput 
                                label={<span><Palette className="w-3 h-3 inline mr-1"/> Fill Color</span>}
                                value={displayColor}
                                onChange={(val) => updateNodeProp('color', val)}
                            />
                            
                            <ColorInput 
                                label={<span><AlignCenter className="w-3 h-3 inline mr-1"/> Border Color</span>}
                                value={displayBorderColor}
                                onChange={(val) => updateNodeProp('borderColor', val)}
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => updateNodeProp('borderStyle', 'solid')}
                                    className={`flex-1 py-1.5 rounded border border-gray-700 flex items-center justify-center transition-all ${displayBorderStyle === 'solid' ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                    title="Solid Border"
                                >
                                    <div className={`w-8 h-0 border-t-2 ${displayBorderStyle === 'solid' ? 'border-cyan-400' : 'border-gray-500'}`}></div>
                                </button>
                                <button
                                    onClick={() => updateNodeProp('borderStyle', 'dashed')}
                                    className={`flex-1 py-1.5 rounded border border-gray-700 flex items-center justify-center transition-all ${displayBorderStyle === 'dashed' ? 'bg-cyan-900/50 border-cyan-500' : 'bg-gray-800 hover:bg-gray-700'}`}
                                    title="Dashed Border"
                                >
                                    <div className={`w-8 h-0 border-t-2 border-dashed ${displayBorderStyle === 'dashed' ? 'border-cyan-400' : 'border-gray-500'}`}></div>
                                </button>
                            </div>

                            <div className="h-px bg-gray-800 my-2"></div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Type className="w-3 h-3"/> Label Size</label>
                                    <span className="text-[10px] text-cyan-400">{displayFontSize}px</span>
                                </div>
                                <input 
                                    type="range" min="8" max="64" step="1"
                                    value={displayFontSize}
                                    onChange={(e) => updateNodeProp('fontSize', parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                />
                            </div>

                            <ColorInput 
                                label="Text Color"
                                value={displayLabelColor}
                                onChange={(val) => updateNodeProp('labelColor', val)}
                            />
                        </div>
                    )}

                    {/* Link Controls */}
                    {showLinkSettings && (
                        <div className={`space-y-4 animate-in fade-in ${showNodeSettings ? 'pt-4 border-t border-gray-800 mt-4' : ''}`}>
                            {showNodeSettings && <div className="text-xs font-bold text-gray-500 uppercase mb-2">Link Properties</div>}
                            
                            {/* Link Label Input */}
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Tag className="w-3 h-3"/> Link Label</label>
                                <input 
                                    type="text" 
                                    value={displayLinkLabel} 
                                    onChange={(e) => updateLinkProp('label', e.target.value)}
                                    placeholder="e.g. JSON/HTTP"
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:border-cyan-500 outline-none placeholder-gray-600"
                                />
                            </div>
                            
                            {/* Link Label Size & Color */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Type className="w-3 h-3"/> Label Size</label>
                                    <span className="text-[10px] text-cyan-400">{displayLinkLabelSize}px</span>
                                </div>
                                <input 
                                    type="range" min="8" max="32" step="1"
                                    value={displayLinkLabelSize}
                                    onChange={(e) => updateLinkProp('labelSize', parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                />
                            </div>

                            <ColorInput 
                                label="Label Color"
                                value={displayLinkLabelColor}
                                onChange={(val) => updateLinkProp('labelColor', val)}
                            />

                            <div className="flex items-center justify-between">
                                <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Square className="w-3 h-3" /> Label Background</label>
                                <button 
                                    onClick={() => updateLinkProp('showLabelBackground', !displayShowLabelBackground)}
                                    className={`p-1.5 rounded-lg transition-colors ${displayShowLabelBackground ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-700/50' : 'bg-gray-800 text-gray-500 hover:text-gray-300'}`}
                                    title="Toggle Label Background"
                                >
                                    {displayShowLabelBackground ? <Eye className="w-4 h-4"/> : <EyeOff className="w-4 h-4"/>}
                                </button>
                            </div>

                            <div className="h-px bg-gray-800 my-2"></div>

                            <ColorInput 
                                label="Line Color"
                                value={displayLinkColor}
                                onChange={(val) => updateLinkProp('color', val)}
                            />

                            <div className="space-y-1">
                                 <div className="flex justify-between">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Activity className="w-3 h-3"/> Traffic Speed</label>
                                    <span className="text-[10px] text-cyan-400">{displayTrafficSpeed.toFixed(1)}x</span>
                                 </div>
                                 <input 
                                    type="range" min="0.1" max="5" step="0.1"
                                    value={displayTrafficSpeed}
                                    onChange={(e) => updateLinkProp('trafficSpeed', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                 />
                            </div>

                            <div className="space-y-1">
                                 <div className="flex justify-between">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold flex items-center gap-1"><Sliders className="w-3 h-3"/> Traffic Density</label>
                                    <span className="text-[10px] text-cyan-400">{(displayTrafficDensity * 100).toFixed(0)}%</span>
                                 </div>
                                 <input 
                                    type="range" min="0" max="0.1" step="0.001"
                                    value={displayTrafficDensity}
                                    onChange={(e) => updateLinkProp('trafficDensity', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                 />
                            </div>
                        </div>
                    )}

                    {/* Global Settings (Accessible via Toggle) */}
                    {showGlobalSettings && (
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-400 uppercase font-bold">Project Name</label>
                                <input 
                                    type="text" 
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>

                             <div className="space-y-1">
                                 <label className="text-[10px] text-gray-400 uppercase font-bold">Line Corner Radius</label>
                                 <input 
                                    type="range" min="0" max="100" step="5"
                                    value={cornerRadius}
                                    onChange={(e) => setCornerRadius(parseInt(e.target.value))}
                                    className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                                 />
                            </div>

                            {/* Global Actions moved here for better context when in Settings mode */}
                            <div className="mt-4 pt-4 border-t border-gray-800 flex flex-col gap-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={onUndo} disabled={!canUndo} className={`py-1.5 rounded text-xs font-bold border ${canUndo ? 'border-gray-600 text-gray-300 hover:bg-gray-800' : 'border-gray-800 text-gray-600 cursor-not-allowed'}`}>
                                        Undo
                                    </button>
                                    <button onClick={onClear} className="py-1.5 rounded text-xs font-bold border border-red-900 text-red-400 hover:bg-red-900/20">
                                        Clear All
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2">
                                     <button onClick={onExport} className="py-1.5 px-2 rounded text-xs font-bold border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-1">
                                        <Save className="w-3 h-3" /> Save JSON
                                     </button>
                                     <button onClick={onHome} className="py-1.5 px-2 rounded text-xs font-bold border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white flex items-center justify-center gap-1">
                                        <Home className="w-3 h-3" /> Home
                                     </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EditorPanel;
