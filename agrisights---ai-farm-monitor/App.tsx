import React, { useState, useCallback } from 'react';
import { MapComponent } from './components/MapComponent';
import { AnalysisPanel } from './components/AnalysisPanel';
import { AnalysisResult, FarmField, MapLayerType } from './types';
import { processFieldData } from './services/farmService';
import { getFieldInterpretation } from './services/geminiService';
import { Layers, Map as MapIcon, MousePointer2 } from 'lucide-react';

export default function App() {
  const [selectedField, setSelectedField] = useState<FarmField | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayerType>(MapLayerType.NDVI);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiText, setAiText] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleFieldCreated = useCallback(async (field: FarmField) => {
    setSelectedField(field);
    setIsProcessing(true);
    setAnalysisResult(null);
    setAiText("");

    try {
      // 1. Get Satellite Data (Mocked Sentinel Hub)
      const data = await processFieldData(field);
      setAnalysisResult(data);
      setIsProcessing(false);

      // 2. Get AI Interpretation
      setIsAiLoading(true);
      const text = await getFieldInterpretation(data);
      setAiText(text);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    } finally {
      setIsAiLoading(false);
    }
  }, []);

  return (
    <div className="flex h-screen w-screen bg-gray-100 overflow-hidden font-sans">
      
      {/* Map Area */}
      <div className="flex-1 relative h-full group">
        
        {/* Top Center Status Banner - Visible only when not drawing (handled implicitly by interactions) */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-[900] pointer-events-none transition-opacity duration-300">
           <div className="bg-white/90 backdrop-blur-sm px-6 py-2.5 rounded-full shadow-lg border border-emerald-100 text-sm font-medium text-gray-700 flex items-center gap-3 pointer-events-auto">
              {selectedField ? (
                 <>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span>Analysis Active: {selectedField.name}</span>
                 </>
              ) : (
                 <>
                   <MousePointer2 size={16} className="text-emerald-600" />
                   <span>Use the <strong>Pencil Tool</strong> (top-left) to draw your field</span>
                 </>
              )}
           </div>
        </div>

        {/* Top Right Custom Controls (Layer Switcher) */}
        <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-2 bg-white/95 backdrop-blur-sm p-1.5 rounded-lg shadow-lg border border-gray-200">
          <button 
            onClick={() => setActiveLayer(MapLayerType.SATELLITE)}
            className={`p-2.5 rounded-md transition-all duration-200 flex items-center gap-2 ${activeLayer === MapLayerType.SATELLITE ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            title="Satellite View"
          >
            <MapIcon size={20} />
            <span className="text-xs font-semibold w-16 text-left">Map</span>
          </button>
          <div className="h-px w-full bg-gray-100 my-0.5"></div>
          <button 
            onClick={() => setActiveLayer(MapLayerType.NDVI)}
            className={`p-2.5 rounded-md transition-all duration-200 flex items-center gap-2 ${activeLayer === MapLayerType.NDVI ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
            title="NDVI (Vegetation)"
          >
            <Layers size={20} />
            <span className="text-xs font-semibold w-16 text-left">NDVI</span>
          </button>
        </div>

        <MapComponent 
          onFieldCreated={handleFieldCreated}
          activeLayer={activeLayer}
          heatmapData={analysisResult?.ndviHeatmap}
          selectedField={selectedField}
        />
      </div>

      {/* Right Sidebar Analysis Panel */}
      <div className="w-[420px] bg-white h-full shadow-2xl relative z-[1000] flex flex-col border-l border-gray-200">
        <div className="h-16 flex items-center px-6 bg-white border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
                <Layers className="text-emerald-600" size={20} />
            </div>
            <h1 className="text-lg font-bold text-gray-800 tracking-tight">
              AgriSights
            </h1>
          </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative bg-gray-50/50">
            <AnalysisPanel 
              data={analysisResult} 
              isLoading={isProcessing}
              activeLayer={activeLayer}
              aiText={aiText}
              isAiLoading={isAiLoading}
            />
        </div>
      </div>
    </div>
  );
}