import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Zap, Video, Settings2, ChevronUp, ChevronDown, Download, Monitor } from 'lucide-react';

interface ControlsProps {
    isPlaying: boolean;
    togglePlay: () => void;
    globalSpeed: number;
    setGlobalSpeed: (speed: number) => void;
    isRecording: boolean;
    onRecord: () => void;
    recordingProgress: number;
    exportFps: number;
    setExportFps: (fps: number) => void;
    exportResolution: string;
    setExportResolution: (res: string) => void;
    isProcessing: boolean;
}

const Controls: React.FC<ControlsProps> = ({ 
    isPlaying, 
    togglePlay, 
    globalSpeed,
    setGlobalSpeed,
    isRecording,
    onRecord,
    recordingProgress,
    exportFps,
    setExportFps,
    exportResolution,
    setExportResolution,
    isProcessing
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close settings
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowSettings(false);
            }
        };

        if (showSettings) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSettings]);

    return (
        <div ref={containerRef} className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
            
            {/* Expanded Settings Panel */}
            {showSettings && !isRecording && (
                <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-4 mb-2 shadow-2xl w-64 animate-in slide-in-from-bottom-2">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Export Settings</span>
                        <Settings2 className="w-4 h-4 text-gray-500" />
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-300">Frame Rate</span>
                                <span className="text-cyan-400 font-mono">{exportFps} FPS</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="60" 
                                step="5" 
                                value={exportFps}
                                onChange={(e) => setExportFps(parseInt(e.target.value))}
                                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-300">Resolution</span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <button 
                                    onClick={() => setExportResolution('720p')}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${exportResolution === '720p' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    <span className="flex items-center gap-2"><Monitor className="w-3 h-3"/> HD (1280x720)</span>
                                </button>
                                <button 
                                    onClick={() => setExportResolution('1080p')}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${exportResolution === '1080p' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    <span className="flex items-center gap-2"><Monitor className="w-3 h-3"/> Full HD (1920x1080)</span>
                                </button>
                                <button 
                                    onClick={() => setExportResolution('square')}
                                    className={`flex items-center justify-between px-2 py-1.5 rounded text-xs transition-colors ${exportResolution === 'square' ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-700/50' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                >
                                    <span className="flex items-center gap-2"><Monitor className="w-3 h-3"/> Square (1080x1080)</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Bar */}
            <div className="bg-gray-900/90 backdrop-blur border border-gray-700 rounded-full px-6 py-2 flex items-center gap-4 shadow-2xl">
                <button 
                    onClick={togglePlay}
                    className={`flex items-center gap-2 text-sm font-bold transition-colors ${isPlaying ? 'text-cyan-400' : 'text-gray-400 hover:text-white'}`}
                >
                    {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    <span className="hidden md:inline">{isPlaying ? 'ACTIVE' : 'PAUSED'}</span>
                </button>

                <div className="h-6 w-px bg-gray-700"></div>

                <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <input 
                        type="range" 
                        min="0.1" 
                        max="5" 
                        step="0.1" 
                        value={globalSpeed}
                        onChange={(e) => setGlobalSpeed(parseFloat(e.target.value))}
                        className="w-24 md:w-32 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400"
                    />
                    <span className="text-xs font-mono text-gray-400 w-8 text-right hidden md:inline-block">{globalSpeed.toFixed(1)}x</span>
                </div>

                <div className="h-6 w-px bg-gray-700"></div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onRecord}
                        disabled={isRecording || isProcessing}
                        className={`flex items-center gap-2 text-sm font-bold transition-all px-3 py-1 rounded-full 
                            ${isRecording 
                                ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/50' 
                                : isProcessing
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/50'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        {isProcessing ? (
                            <>
                                <Download className="w-4 h-4 animate-bounce" />
                                <span>Encoding...</span>
                            </>
                        ) : isRecording ? (
                            <>
                                <Video className="w-4 h-4" />
                                <span>REC {recordingProgress}%</span>
                            </>
                        ) : (
                            <>
                                <Video className="w-4 h-4" />
                                <span className="hidden md:inline">EXPORT GIF</span>
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => setShowSettings(!showSettings)}
                        disabled={isRecording || isProcessing}
                        className={`p-1 rounded-full transition-colors ${showSettings ? 'text-cyan-400 bg-gray-800' : 'text-gray-500 hover:text-white'}`}
                    >
                        {showSettings ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Controls;