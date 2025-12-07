import { GoogleGenAI } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getFieldInterpretation = async (data: AnalysisResult): Promise<string> => {
    if (!apiKey) {
        return "API Key is missing. Please configure the environment variable.";
    }

    const prompt = `
    You are an expert agronomist. Analyze the following satellite index data for a farm field.
    
    Current Metrics:
    - NDVI (Vegetation Health -1 to 1): ${data.currentNDVI.toFixed(2)}
    - NDWI (Water Stress -1 to 1): ${data.currentNDWI.toFixed(2)}
    - Soil Moisture Index (0 to 1): ${data.currentMoisture.toFixed(2)}
    
    Historical Trend (Last 6 months):
    ${data.history.map(h => `${h.date}: NDVI ${h.ndvi.toFixed(2)}, NDWI ${h.ndwi.toFixed(2)}`).join('\n')}
    
    Provide a concise, helpful summary for the farmer.
    1. Assess crop health.
    2. Identify potential water stress or irrigation needs.
    3. Suggest one actionable step.
    
    Keep it under 100 words. Use professional but accessible language.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Could not generate interpretation.";
    } catch (error) {
        console.error("Gemini API Error:", error);
        return "AI analysis currently unavailable due to network or configuration issues.";
    }
};