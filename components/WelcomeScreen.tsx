
import React, { useRef, useState } from 'react';
import { Upload, FileJson, LayoutGrid, ArrowRight, MousePointer2, Sparkles, Copy, X, Check, Heart, AtSign } from 'lucide-react';
import { TEMPLATES } from '../data/templates';
import { DiagramData } from '../types';

interface WelcomeScreenProps {
    onStart: (data: DiagramData) => void;
}

const AI_PROMPT = `You are a System Architecture Visualization Generator.
Your task is to generate a JSON object representing a system architecture diagram based on the user's request.

**Output Rules:**
1. Return ONLY raw JSON. Do not use Markdown formatting.
2. The JSON must strictly follow the schema below.
3. **Layout:** The canvas size is 2000x2000. Center the main components around (1000, 1000). Distribute nodes logically with at least 150px gaps.
4. **Styling:** Use a "Cyberpunk/Neon" palette. Background is dark. Nodes/Links should be bright neon colors (Cyan #22d3ee, Magenta #f472b6, Yellow #facc15, Green #4ade80, Purple #a78bfa).

**JSON Schema:**
{
  "nodes": [
    {
      "id": "string (unique, e.g., 'n1')",
      "type": "rect" | "circle" | "text",
      "label": "string",
      "x": number (0-2000),
      "y": number (0-2000),
      "width": number (approx 80-160),
      "height": number (approx 60-100),
      "color": "string (hex)",
      "borderColor": "string (hex)",
      "borderWidth": number (usually 2),
      "borderStyle": "solid" | "dashed",
      "labelColor": "string (hex)",
      "fontSize": number (usually 14)
    }
  ],
  "links": [
    {
      "id": "string (unique, e.g., 'l1')",
      "sourceId": "string (matches node id)",
      "targetId": "string (matches node id)",
      "color": "string (hex)",
      "width": number (2-4),
      "trafficSpeed": number (0.5 - 2.0),
      "trafficDensity": number (0.01 - 0.1)
    }
  ],
  "globalSettings": {
      "cornerRadius": 24,
      "globalSpeed": 1
  }
}`;

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [showPromptModal, setShowPromptModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                
                // Basic validation
                if (!Array.isArray(json.nodes) || !Array.isArray(json.links)) {
                    throw new Error("Invalid format: 'nodes' and 'links' arrays are required.");
                }

                onStart(json as DiagramData);
            } catch (err) {
                console.error(err);
                setError("Failed to parse JSON. Please ensure the file is a valid Neon Architect diagram.");
            }
        };
        reader.readAsText(file);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(AI_PROMPT);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex h-screen w-screen bg-gray-950 text-gray-100 overflow-hidden font-sans flex-col items-center justify-center p-6 relative">
             {/* Background Effects */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-gray-950 to-gray-950 pointer-events-none"></div>
             
             <div className="max-w-4xl w-full z-10 flex flex-col gap-8">
                 <div className="text-center space-y-4">
                     <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl mb-2">
                        <LayoutGrid className="w-10 h-10 text-white" />
                     </div>
                     <h1 className="text-5xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                         NEON ARCHITECT
                     </h1>
                     <p className="text-gray-400 text-lg max-w-lg mx-auto">
                         Design futuristic system architectures and watch them come to life with animated traffic.
                     </p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                     {/* Template Section */}
                     <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 flex flex-col gap-4">
                         <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <MousePointer2 className="w-4 h-4" /> Start with a Template
                         </h2>
                         <div className="grid grid-cols-1 gap-3">
                             {TEMPLATES.map(t => (
                                 <button 
                                    key={t.id}
                                    onClick={() => onStart(t.data)}
                                    className="group text-left p-4 rounded-xl border border-gray-800 bg-gray-900 hover:bg-gray-800 hover:border-cyan-700/50 transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                                 >
                                     <div className="flex justify-between items-center mb-1">
                                         <h3 className="font-bold text-gray-200 group-hover:text-cyan-400 transition-colors">{t.name}</h3>
                                         <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transform group-hover:translate-x-1 transition-all" />
                                     </div>
                                     <p className="text-xs text-gray-500">{t.description}</p>
                                 </button>
                             ))}
                         </div>
                     </div>

                     {/* Import Section */}
                     <div className="bg-gray-900/50 backdrop-blur border border-gray-800 rounded-2xl p-6 flex flex-col gap-4 justify-center items-center text-center border-dashed">
                         <div className="p-4 bg-gray-800 rounded-full mb-2">
                             <FileJson className="w-8 h-8 text-cyan-500" />
                         </div>
                         <div className="w-full">
                             <h2 className="text-xl font-bold text-white mb-2">Import Diagram</h2>
                             <p className="text-sm text-gray-400 mb-6">
                                 Upload a previously saved .json file or generate one with AI.
                             </p>
                             
                             <div className="flex flex-col gap-3">
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 border border-gray-700 hover:border-gray-500"
                                >
                                    <Upload className="w-4 h-4" />
                                    Select JSON File
                                </button>
                                
                                <button 
                                    onClick={() => setShowPromptModal(true)}
                                    className="w-full px-6 py-2 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 border border-cyan-900/50 hover:border-cyan-500/50"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    AI Prompt Guide
                                </button>
                             </div>

                             <input 
                                ref={fileInputRef}
                                type="file" 
                                accept=".json" 
                                className="hidden" 
                                onChange={handleFileUpload}
                             />
                         </div>
                         {error && (
                             <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded text-red-400 text-xs">
                                 {error}
                             </div>
                         )}
                     </div>
                 </div>
             </div>

             {/* Footer - Social Links */}
             <div className="mt-12 z-10 flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
                <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-red-500/20" />
                    <span>by</span>
                    <span className="text-gray-300 font-medium tracking-wide">@weru_ps</span>
                </div>
                <div className="flex items-center gap-3">
                     <a href="https://x.com/xwerux" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 transition-all">
                        <svg viewBox="0 0 24 24" className="w-3 h-3 fill-gray-400 group-hover:fill-white transition-colors" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">X</span>
                     </a>
                     <a href="https://www.threads.com/@weru_ps" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-900/50 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 transition-all">
                        <AtSign className="w-3 h-3 text-gray-400 group-hover:text-white transition-colors" />
                        <span className="text-[10px] font-bold text-gray-400 group-hover:text-white">Threads</span>
                     </a>
                </div>
             </div>

             {/* AI Prompt Modal */}
             {showPromptModal && (
                 <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                     <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
                         <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                             <div className="flex items-center gap-2">
                                 <Sparkles className="w-5 h-5 text-cyan-400" />
                                 <h2 className="font-bold text-white">Generate with AI</h2>
                             </div>
                             <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                 <X className="w-5 h-5" />
                             </button>
                         </div>
                         <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                             <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                                 Copy the instructions below and paste them into an AI assistant (like Gemini, ChatGPT, or Claude) to generate a compatible diagram file.
                             </p>
                             <div className="relative group">
                                 <pre className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-gray-400 text-xs font-mono overflow-x-auto whitespace-pre-wrap">
                                     {AI_PROMPT}
                                 </pre>
                                 <button 
                                     onClick={handleCopy}
                                     className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-all shadow-lg border border-gray-700 opacity-0 group-hover:opacity-100"
                                     title="Copy to Clipboard"
                                 >
                                     {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                                 </button>
                             </div>
                             <div className="mt-6">
                                 <h3 className="text-sm font-bold text-white mb-2">Example User Requests:</h3>
                                 <ul className="text-xs text-gray-400 space-y-2 list-disc list-inside">
                                     <li>"Create a high-frequency trading platform architecture with multiple exchanges and risk engines."</li>
                                     <li>"Visualize a microservices e-commerce backend with load balancers, payment gateways, and inventory DBs."</li>
                                     <li>"Draw a neural network training pipeline with data ingestion, processing, and model evaluation nodes."</li>
                                 </ul>
                             </div>
                         </div>
                         <div className="p-4 border-t border-gray-800 flex justify-end">
                             <button 
                                onClick={() => setShowPromptModal(false)}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors"
                             >
                                 Close
                             </button>
                         </div>
                     </div>
                 </div>
             )}
        </div>
    );
};

export default WelcomeScreen;
