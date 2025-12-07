import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Polyline, CircleMarker, Popup, useMapEvents, Marker, ZoomControl } from 'react-leaflet';
import { FarmField, HeatmapPixel, MapLayerType } from '../types';
import L from 'leaflet';
import { Pencil, Check, X, Trash2 } from 'lucide-react';

// Fix for default Leaflet markers in Webpack/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
    onFieldCreated: (field: FarmField) => void;
    activeLayer: MapLayerType;
    heatmapData?: HeatmapPixel[];
    selectedField: FarmField | null;
}

const HeatmapLayer = ({ data }: { data: HeatmapPixel[] }) => {
    if (!data || data.length === 0) return null;
    return (
        <>
            {data.map((point, idx) => (
                <CircleMarker
                    key={idx}
                    center={[point.lat, point.lng]}
                    radius={8}
                    pathOptions={{ 
                        color: point.color, 
                        fillColor: point.color, 
                        fillOpacity: 0.6, 
                        stroke: false 
                    }}
                >
                    <Popup>
                        <div className="text-xs font-sans">
                           <strong>NDVI:</strong> {point.value.toFixed(2)}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

// Internal component to handle map clicks for drawing
const DrawingController = ({ 
    isDrawing, 
    onAddPoint 
}: { 
    isDrawing: boolean; 
    onAddPoint: (latlng: L.LatLng) => void 
}) => {
    useMapEvents({
        click(e) {
            if (isDrawing) {
                onAddPoint(e.latlng);
            }
        }
    });
    return null;
};

export const MapComponent: React.FC<MapProps> = ({ onFieldCreated, activeLayer, heatmapData, selectedField }) => {
    const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawPoints, setDrawPoints] = useState<L.LatLng[]>([]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setCenter([pos.coords.latitude, pos.coords.longitude]);
            }, (err) => {
                console.warn("Geolocation error:", err);
            });
        }
    }, []);

    const handleStartDrawing = () => {
        setIsDrawing(true);
        setDrawPoints([]);
        // We do not clear the selectedField immediately to allow comparison, 
        // but typically you'd want to clear it if you start a new one.
    };

    const handleAddPoint = (latlng: L.LatLng) => {
        setDrawPoints(prev => [...prev, latlng]);
    };

    const handleFinishDrawing = () => {
        if (drawPoints.length < 3) {
            alert("A polygon needs at least 3 points.");
            return;
        }
        
        const coordinates = drawPoints.map(p => ({ lat: p.lat, lng: p.lng }));
        
        const newField: FarmField = {
            id: Date.now().toString(),
            name: `Field ${new Date().toLocaleTimeString()}`,
            coordinates: coordinates,
            areaHectares: 0 // logic omitted
        };

        onFieldCreated(newField);
        setIsDrawing(false);
        setDrawPoints([]);
    };

    const handleCancelDrawing = () => {
        setIsDrawing(false);
        setDrawPoints([]);
    };

    return (
        <div className="relative h-full w-full">
            <MapContainer 
                center={center} 
                zoom={13} 
                scrollWheelZoom={true} 
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url={ activeLayer === MapLayerType.SATELLITE 
                        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" 
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                    }
                />

                <ZoomControl position="bottomright" />

                <DrawingController isDrawing={isDrawing} onAddPoint={handleAddPoint} />

                {/* Render the saved/selected field */}
                {selectedField && !isDrawing && (
                    <Polygon 
                        positions={selectedField.coordinates}
                        pathOptions={{ color: '#10B981', fillOpacity: 0.2 }}
                    />
                )}

                {/* Render the drawing in progress */}
                {isDrawing && (
                    <>
                        {drawPoints.map((pos, idx) => (
                            <CircleMarker 
                                key={idx} 
                                center={pos} 
                                radius={4} 
                                pathOptions={{ color: '#F59E0B', fillColor: 'white', fillOpacity: 1 }} 
                            />
                        ))}
                        <Polyline positions={drawPoints} pathOptions={{ color: '#F59E0B', dashArray: '5, 10' }} />
                        {/* Close the loop preview if > 2 points */}
                        {drawPoints.length > 2 && (
                            <Polygon positions={drawPoints} pathOptions={{ color: '#F59E0B', fillOpacity: 0.1, stroke: false }} />
                        )}
                    </>
                )}
                
                {activeLayer === MapLayerType.NDVI && heatmapData && !isDrawing && (
                    <HeatmapLayer data={heatmapData} />
                )}
            </MapContainer>

            {/* Custom Drawing Controls - Absolute Positioned on top of Map */}
            <div className="absolute top-6 left-6 z-[1000] flex flex-col gap-2">
                {!isDrawing ? (
                    <button 
                        onClick={handleStartDrawing}
                        className="bg-white hover:bg-emerald-50 text-emerald-700 shadow-md border border-emerald-200 p-3 rounded-full flex items-center justify-center transition-all hover:scale-105"
                        title="Draw New Field"
                    >
                        <Pencil size={24} />
                    </button>
                ) : (
                    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-300">
                         <div className="bg-white/95 backdrop-blur px-4 py-2 rounded-lg shadow-lg border border-amber-200 text-sm font-medium text-amber-800 mb-2">
                            Click on map to add points
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleFinishDrawing}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-md p-3 rounded-full flex items-center justify-center transition-all"
                                title="Finish Shape"
                                disabled={drawPoints.length < 3}
                            >
                                <Check size={24} />
                            </button>
                            <button 
                                onClick={handleCancelDrawing}
                                className="bg-white hover:bg-red-50 text-red-500 shadow-md p-3 rounded-full flex items-center justify-center transition-all border border-red-100"
                                title="Cancel"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
