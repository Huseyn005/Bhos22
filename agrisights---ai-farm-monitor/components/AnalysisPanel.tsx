import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisResult, MapLayerType } from '../types';
import { Loader2, Sprout, Droplets, Activity } from 'lucide-react';

interface AnalysisPanelProps {
    data: AnalysisResult | null;
    isLoading: boolean;
    activeLayer: MapLayerType;
    aiText: string;
    isAiLoading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ 
    data, 
    isLoading, 
    activeLayer,
    aiText,
    isAiLoading
}) => {
    
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-600" />
                <p>Processing satellite imagery...</p>
                <p className="text-sm text-gray-400 mt-2">Retrieving indices via Sentinel Hub</p>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                <Sprout className="w-16 h-16 mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
                <p>Select the "Draw" tool on the map to define your field boundary.</p>
            </div>
        );
    }

    const chartColor = activeLayer === MapLayerType.NDWI ? '#3B82F6' : '#10B981';
    const chartDataKey = activeLayer === MapLayerType.NDWI ? 'ndwi' : 'ndvi';

    return (
        <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Header Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-emerald-100">
                    <div className="flex items-center gap-2 mb-2 text-emerald-600">
                        <Sprout size={18} />
                        <span className="text-sm font-semibold">NDVI (Health)</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{data.currentNDVI.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 block mt-1">Target: > 0.6</span>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                        <Droplets size={18} />
                        <span className="text-sm font-semibold">NDWI (Water)</span>
                    </div>
                    <span className="text-2xl font-bold text-gray-800">{data.currentNDWI.toFixed(2)}</span>
                    <span className="text-xs text-gray-400 block mt-1">Target: > -0.1</span>
                </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 text-indigo-700">
                    <Activity size={20} />
                    <h3 className="font-semibold">AI Agronomist Insight</h3>
                </div>
                
                {isAiLoading ? (
                    <div className="flex items-center gap-2 text-indigo-400 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating interpretation...
                    </div>
                ) : (
                    <p className="text-gray-700 text-sm leading-relaxed">
                        {aiText}
                    </p>
                )}
                <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-200 rounded-full opacity-20 blur-xl"></div>
            </div>

            {/* Main Chart */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-800 mb-4">Historical Trend (6 Months)</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.history}>
                            <defs>
                                <linearGradient id="colorIndex" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, {month:'short'})}
                                stroke="#9ca3af"
                                fontSize={12}
                            />
                            <YAxis stroke="#9ca3af" fontSize={12} domain={[-0.5, 1]}/>
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey={chartDataKey} 
                                stroke={chartColor} 
                                fillOpacity={1} 
                                fill="url(#colorIndex)" 
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Legend for Map */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <h4 className="text-sm font-semibold text-gray-600 mb-3">Map Legend (NDVI)</h4>
                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                    <span>Dead/Soil</span>
                    <span>Healthy Canopy</span>
                </div>
                <div className="h-3 w-full rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-700"></div>
                <div className="flex justify-between mt-1 text-xs font-mono text-gray-400">
                    <span>-1.0</span>
                    <span>0.0</span>
                    <span>1.0</span>
                </div>
            </div>
        </div>
    );
};