import { GoogleGenAI, Type } from "@google/genai";
import { RGB, AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeColorWithGemini = async (rgb: RGB): Promise<AIAnalysisResult> => {
  try {
    const prompt = `
      I have a color with RGB values (${rgb.r}, ${rgb.g}, ${rgb.b}).
      Please analyze this specific shade.
      1. Give it a creative, descriptive name (e.g., "Midnight Slate" instead of "Dark Grey").
      2. Provide a 1-sentence description of the color.
      3. Describe the emotional vibe in 2-3 words.
      4. Suggest 3 complementary or matching colors for a palette.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colorName: { type: Type.STRING },
            description: { type: Type.STRING },
            emotionalVibe: { type: Type.STRING },
            palette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  name: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback if AI fails, to keep app functional
    return {
      colorName: "Unknown Shade",
      description: "Unable to analyze color details at this moment.",
      emotionalVibe: "Neutral",
      palette: []
    };
  }
};