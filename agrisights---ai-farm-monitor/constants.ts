// --- SENTINEL HUB EVALSCRIPTS (V3) ---
// These are provided for future backend integration.

export const EVALSCRIPT_NDVI = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  
  // Return RGBA, visualization logic would handle color mapping based on 'ndvi' value
  // This simple script passes raw values
  return [ndvi, sample.dataMask, 0, 0];
}
`;

export const EVALSCRIPT_NDWI = `
//VERSION=3
function setup() {
  return {
    input: ["B03", "B08", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  // McFeeters NDWI: (Green - NIR) / (Green + NIR)
  let ndwi = (sample.B03 - sample.B08) / (sample.B03 + sample.B08);
  return [ndwi, sample.dataMask, 0, 0];
}
`;

export const EVALSCRIPT_MOISTURE = `
//VERSION=3
function setup() {
  return {
    input: ["B8A", "B11", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  // Moisture Index (Normalized Difference Moisture Index)
  let mi = (sample.B8A - sample.B11) / (sample.B8A + sample.B11);
  return [mi, sample.dataMask, 0, 0];
}
`;

// --- UI CONSTANTS ---

export const COLORS = {
    primary: '#10B981', // Emerald 500
    secondary: '#3B82F6', // Blue 500
    danger: '#EF4444', // Red 500
    warning: '#F59E0B', // Amber 500
    dark: '#1F2937',
    light: '#F3F4F6'
};

export const MOCK_LOCATIONS = {
    defaultCenter: { lat: 40.7128, lng: -74.0060 } // NYC roughly, but we'll use geolocation
};