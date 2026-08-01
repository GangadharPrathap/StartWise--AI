import { GoogleGenAI } from "@google/genai";
import { GEMINI_API_KEY } from "../config/env.js";

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || "dummy" });

// Models to try in order — if one hits quota, fall back to the next
const MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];

export const generateCompletion = async (systemPrompt, userPrompt, jsonMode = true) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "dummy") {
    throw new Error("Gemini API key is missing. Set GEMINI_API_KEY in .env");
  }

  let lastError = null;

  for (const model of MODELS) {
    try {
      const result = await ai.models.generateContent({
        model,
        systemInstruction: systemPrompt,
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          responseMimeType: jsonMode ? "application/json" : "text/plain",
        }
      });
      
      return result.text;
    } catch (error) {
      lastError = error;
      const status = error?.status || error?.code;
      // If rate limited (429), try the next model
      if (status === 429 || error?.message?.includes("RESOURCE_EXHAUSTED")) {
        console.warn(`Gemini model "${model}" rate limited (429). Trying next model...`);
        continue;
      }
      // For other errors, don't retry with different models
      console.error(`Gemini SDK Error (${model}):`, error.message || error);
      throw error;
    }
  }

  // All models exhausted
  console.error("All Gemini models rate limited. Throwing last error.");
  throw lastError;
};
