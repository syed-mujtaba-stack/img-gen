import React, { useState, useRef } from 'react';
import { Button } from './Button';
import { fileToBase64, editImageWithGemini } from '../services/geminiService';
import { ProcessingState, GeneratedImage, GenerationConfig } from '../types';

const PRESETS = {
  Emotions: [
    { label: "😭 Crying", prompt: "Make the person in the image look like they are crying with visible tears and a sad expression." },
    { label: "😄 Laughing", prompt: "Make the person laugh uncontrollably with a joyful expression." },
    { label: "😠 Angry", prompt: "Make the person look furious and angry." },
    { label: "😲 Surprised", prompt: "Make the person look shocked and surprised." },
  ],
  Styles: [
    { label: "✏️ Sketch", prompt: "Convert this image into a pencil sketch art style." },
    { label: "🤖 Cyberpunk", prompt: "Transform this image into a futuristic cyberpunk style with neon lights." },
    { label: "🎨 Oil Paint", prompt: "Turn this image into a classic oil painting." },
    { label: "👾 Pixel Art", prompt: "Convert this image into 16-bit pixel art." },
  ],
  Professional: [
    { label: "👔 Suit", prompt: "Dress the person in a professional business suit." },
    { label: "📸 Studio", prompt: "Enhance the lighting to look like a professional studio headshot." },
  ],
  Fun: [
    { label: "🧟 Zombie", prompt: "Turn the person into a scary zombie." },
    { label: "🦸 Super Hero", prompt: "Make the person look like a superhero with a cape." },
  ]
};

const ASPECT_RATIOS = ["1:1", "3:4", "4:3", "9:16", "16:9"];

export const ImageEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [state, setState] = useState<ProcessingState>({ isLoading: false, error: null });
  const [config, setConfig] = useState<GenerationConfig>({ temperature: 0.9, aspectRatio: "1:1" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setResultImage(null);
      setState({ isLoading: false, error: null });
      
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile || !prompt) return;

    setState({ isLoading: true, error: null });
    
    try {
      const base64Data = await fileToBase64(selectedFile);
      const generatedImageUrl = await editImageWithGemini(base64Data, selectedFile.type, prompt, config);
      
      setResultImage(generatedImageUrl);
      
      // Add to history
      setHistory(prev => [{
        imageUrl: generatedImageUrl,
        prompt: prompt,
        timestamp: Date.now()
      }, ...prev].slice(0, 10)); // Keep last 10
      
    } catch (err: any) {
      setState({ isLoading: false, error: err.message || "Failed to edit image" });
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultImage(null);
    setPrompt('');
    setActivePreset(null);
    setState({ isLoading: false, error: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const selectFromHistory = (item: GeneratedImage) => {
    setResultImage(item.imageUrl);
  };

  const handlePresetClick = (label: string, presetPrompt: string) => {
    setPrompt(presetPrompt);
    setActivePreset(label);
  };

  return (
    <div className="max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
        
        {/* Left Column: Controls (4/12) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Panel: Upload & Prompt */}
          <div className="bg-[#0f172a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl space-y-6">
            
            {/* Image Upload Area */}
            <div 
              className={`relative group rounded-2xl p-1 transition-all duration-300 ${
                previewUrl 
                  ? 'border-0' 
                  : 'border-2 border-dashed border-slate-700 hover:border-indigo-500 hover:bg-indigo-500/5'
              }`}
            >
               <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                disabled={state.isLoading}
              />
              
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden bg-black ring-1 ring-white/10 group">
                   {/* Blur background for fill */}
                   <div 
                     className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl"
                     style={{ backgroundImage: `url(${previewUrl})` }}
                   ></div>
                   
                   <img src={previewUrl} alt="Original" className="relative z-10 w-full h-48 object-contain mx-auto" />
                   
                   <div className="absolute top-2 right-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                       onClick={(e) => { e.preventDefault(); e.stopPropagation(); clearAll(); }}
                       className="bg-black/50 hover:bg-red-500/80 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
                     >
                       <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                       </svg>
                     </button>
                   </div>
                   
                   <div className="absolute bottom-2 left-2 z-20">
                     <span className="bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-md backdrop-blur-sm border border-white/10 uppercase tracking-wide">
                        Original
                     </span>
                   </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col items-center justify-center text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-300">Upload Source Image</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>

            {/* Prompt Section */}
            <div className="space-y-4">
              <div>
                <label htmlFor="prompt" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">
                  Magic Prompt
                </label>
                <div className="relative">
                  <textarea
                    id="prompt"
                    rows={3}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none shadow-inner"
                    placeholder="Describe your imagination..."
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      if (activePreset) setActivePreset(null);
                    }}
                  />
                  <div className="absolute bottom-3 right-3 text-slate-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Instant Styles</p>
                <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                  {Object.entries(PRESETS).map(([category, items]) => (
                    <div key={category} className="space-y-2">
                      <span className="text-[10px] text-indigo-400/80 font-medium ml-1 tracking-wider uppercase">{category}</span>
                      <div className="grid grid-cols-2 gap-2">
                        {items.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handlePresetClick(item.label, item.prompt)}
                            className={`flex items-center px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                              activePreset === item.label
                                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                : 'bg-slate-800 border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced Controls Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors"
                >
                  <svg 
                    className={`mr-1.5 h-3 w-3 transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Advanced Controls
                </button>
                
                {showAdvanced && (
                  <div className="mt-3 p-4 bg-slate-800/50 rounded-xl space-y-4 border border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-xs font-medium text-slate-300">Creativity</label>
                        <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded">{config.temperature}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-2">Aspect Ratio</label>
                      <div className="grid grid-cols-5 gap-1.5">
                        {ASPECT_RATIOS.map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setConfig({ ...config, aspectRatio: ratio })}
                            className={`px-1 py-1.5 text-[10px] font-medium rounded border transition-all ${
                              config.aspectRatio === ratio
                                ? 'bg-indigo-600 text-white border-indigo-500'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={!selectedFile || !prompt.trim()}
              isLoading={state.isLoading}
              className="w-full"
            >
              {state.isLoading ? 'Processing...' : 'Generate Magic'}
            </Button>

            {state.error && (
              <div className="rounded-xl bg-red-500/10 p-3 border border-red-500/20 flex items-start gap-3">
                <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h3 className="text-xs font-bold text-red-400">Generation Failed</h3>
                  <p className="text-xs text-red-300/80 mt-0.5">{state.error}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Result Canvas (8/12) */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[600px]">
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-[#0f172a]/40 border border-white/5 shadow-2xl backdrop-blur-sm flex flex-col">
             
             {/* Toolbar */}
             <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0f172a]/40">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Canvas Preview</div>
                <div>
                  {resultImage && (
                    <a 
                      href={resultImage} 
                      download={`nano-edit-${Date.now()}.png`}
                      className="text-xs flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Save Image
                    </a>
                  )}
                </div>
             </div>

             {/* Canvas Area */}
             <div className="flex-1 relative bg-[#020617] flex items-center justify-center p-8">
                {/* Checkerboard Pattern for transparency */}
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)`,
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                }}></div>

                {state.isLoading ? (
                  <div className="relative z-10 flex flex-col items-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
                      <div className="w-20 h-20 border-2 border-t-indigo-500 border-r-indigo-500 border-b-indigo-500/30 border-l-indigo-500/30 rounded-full animate-spin"></div>
                    </div>
                    <div className="mt-8 text-center space-y-2">
                      <h3 className="text-lg font-medium text-white">Dreaming up pixels...</h3>
                      <p className="text-sm text-slate-400">Applying neural transformations</p>
                    </div>
                  </div>
                ) : resultImage ? (
                  <div className="relative z-10 max-w-full max-h-full">
                     <img 
                       src={resultImage} 
                       alt="Generated" 
                       className="max-w-full max-h-[600px] w-auto h-auto object-contain rounded-lg shadow-2xl ring-1 ring-white/10" 
                     />
                  </div>
                ) : (
                  <div className="relative z-10 text-center opacity-40">
                    <svg className="w-24 h-24 mx-auto text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-lg font-medium text-slate-300">Canvas Empty</p>
                    <p className="text-sm text-slate-500">Your imagination goes here</p>
                  </div>
                )}
             </div>

             {/* Film Strip History */}
             {history.length > 0 && (
                <div className="h-32 border-t border-white/5 bg-[#0f172a]/60 backdrop-blur-md overflow-hidden flex flex-col">
                  <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Timeline
                  </div>
                  <div className="flex-1 overflow-x-auto flex items-center gap-3 px-4 pb-3 custom-scrollbar">
                    {history.map((item, index) => (
                      <button
                        key={item.timestamp}
                        onClick={() => selectFromHistory(item)}
                        className={`group relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${
                          resultImage === item.imageUrl 
                            ? 'ring-2 ring-indigo-500 scale-105 shadow-lg shadow-indigo-500/20' 
                            : 'opacity-60 hover:opacity-100 hover:scale-105 ring-1 ring-white/10'
                        }`}
                      >
                        <img src={item.imageUrl} alt={`History ${index}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                          <span className="text-[8px] text-white truncate px-1 w-full text-center">{item.prompt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};