import { GoogleGenAI, Type } from "@google/genai";
import { Cookie, Rarity } from "../types";

// Initialize Gemini
// NOTE: We assume process.env.API_KEY is available.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateOracleCookie = async (): Promise<Partial<Cookie>> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key missing");
  }

  const modelId = "gemini-3-flash-preview"; 

  const prompt = `
    You are the Oracle Oven, a mythical entity that bakes cookies with divine properties.
    Create a unique, fantasy-themed cookie.
    
    The cookie should be:
    - Rarity: Divine (Extremely powerful and unique)
    - Name: Creative, mythical, or sci-fi inspired.
    - Description: A one-sentence lore description.
    - ColorHex: A hex color code representing the cookie's aura.
    - BaseValue: A number between 80 and 200.

    Return the result in strictly valid JSON format matching the schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            colorHex: { type: Type.STRING },
            baseValue: { type: Type.NUMBER },
          },
          required: ["name", "description", "colorHex", "baseValue"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Oracle Oven");

    const data = JSON.parse(text);

    return {
      name: data.name,
      description: data.description,
      rarity: Rarity.DIVINE,
      baseValue: data.baseValue,
      colorHex: data.colorHex,
      isAiGenerated: true,
    };
  } catch (error) {
    console.error("Oracle Oven malfunctioned:", error);
    // Fallback if AI fails, so user doesn't lose money without reward
    return {
      name: "Glitch Cookie",
      description: "The Oracle Oven sputtered and produced this anomaly.",
      rarity: Rarity.DIVINE,
      baseValue: 77,
      colorHex: "#333333",
      isAiGenerated: true,
    };
  }
};
