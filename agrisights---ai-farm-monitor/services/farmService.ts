import { AnalysisResult, FarmField, HeatmapPixel, IndexDataPoint } from '../types';

/**
 * Simulates calling the Sentinel Hub Process API.
 * In a real app, this would be a POST request to your backend.
 */
export const processFieldData = async (field: FarmField): Promise<AnalysisResult> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const today = new Date();
    const history: IndexDataPoint[] = [];

    // Generate 6 months of historical data
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(today.getMonth() - i);
        
        // Seasonality simulation
        const isSummer = d.getMonth() >= 5 && d.getMonth() <= 8;
        const baseNDVI = isSummer ? 0.7 : 0.4;
        
        history.push({
            date: d.toISOString().split('T')[0],
            ndvi: Math.min(0.9, Math.max(0.1, baseNDVI + (Math.random() * 0.2 - 0.1))),
            ndwi: Math.min(0.6, Math.max(-0.4, (Math.random() * 0.4 - 0.2))),
            moisture: Math.min(0.8, Math.max(0.2, (Math.random() * 0.5)))
        });
    }

    const currentNDVI = history[history.length - 1].ndvi;
    const currentNDWI = history[history.length - 1].ndwi;
    const currentMoisture = history[history.length - 1].moisture;

    // Generate simulated heatmap pixels within the polygon bounds
    // In a real app, this would be a PNG or TIFF overlay from WMS
    const heatmap: HeatmapPixel[] = [];
    const bounds = getBounds(field.coordinates);
    
    // Create a 10x10 grid of points for visualization
    const stepLat = (bounds.maxLat - bounds.minLat) / 10;
    const stepLng = (bounds.maxLng - bounds.minLng) / 10;

    for (let lat = bounds.minLat; lat < bounds.maxLat; lat += stepLat) {
        for (let lng = bounds.minLng; lng < bounds.maxLng; lng += stepLng) {
            // Random variation based on current NDVI
            const val = currentNDVI + (Math.random() * 0.3 - 0.15);
            heatmap.push({
                lat,
                lng,
                value: val,
                color: getNDVIColor(val)
            });
        }
    }

    return {
        fieldId: field.id,
        currentNDVI,
        currentNDWI,
        currentMoisture,
        history,
        ndviHeatmap: heatmap,
        lastUpdated: new Date().toISOString()
    };
};

function getBounds(coords: {lat: number, lng: number}[]) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    coords.forEach(c => {
        if (c.lat < minLat) minLat = c.lat;
        if (c.lat > maxLat) maxLat = c.lat;
        if (c.lng < minLng) minLng = c.lng;
        if (c.lng > maxLng) maxLng = c.lng;
    });
    return { minLat, maxLat, minLng, maxLng };
}

function getNDVIColor(value: number): string {
    if (value < 0.2) return '#ef4444'; // Red (Barren/Dead)
    if (value < 0.4) return '#f59e0b'; // Yellow (Stressed)
    if (value < 0.6) return '#84cc16'; // Light Green (Moderate)
    return '#15803d'; // Dark Green (Healthy)
}
