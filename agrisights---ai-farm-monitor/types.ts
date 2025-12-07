export interface Coordinate {
    lat: number;
    lng: number;
}

export interface FarmField {
    id: string;
    name: string;
    coordinates: Coordinate[]; // simplified polygon ring
    areaHectares: number;
}

export interface IndexDataPoint {
    date: string;
    ndvi: number; // Normalized Difference Vegetation Index
    ndwi: number; // Normalized Difference Water Index
    moisture: number; // Soil Moisture Index
}

export interface HeatmapPixel {
    lat: number;
    lng: number;
    value: number; // -1 to 1
    color: string;
}

export interface AnalysisResult {
    fieldId: string;
    currentNDVI: number;
    currentNDWI: number;
    currentMoisture: number;
    history: IndexDataPoint[];
    ndviHeatmap: HeatmapPixel[]; // Simulated overlay data
    lastUpdated: string;
}

export enum MapLayerType {
    SATELLITE = "Satellite",
    NDVI = "NDVI (Health)",
    NDWI = "NDWI (Water)"
}