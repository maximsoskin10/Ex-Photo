import { GoogleGenAI } from "@google/genai";

/**
 * Edits an image using Gemini 2.5 Flash Image based on a text prompt.
 * @param base64Image The base64 encoded string of the image (without the data:image/... prefix ideally, or handled by the SDK if supported, but usually raw base64)
 * @param mimeType The MIME type of the image (e.g., image/jpeg)
 * @param prompt The user's editing instruction
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<{ imageUri?: string; text?: string }> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Clean base64 string if it contains the data URL prefix
  const cleanBase64 = base64Image.includes('base64,') 
    ? base64Image.split('base64,')[1] 
    : base64Image;

  // Enhanced prompt to ensure the model focuses on editing ONLY the requested part
  // and maintains the integrity of the rest of the image.
  const enhancedPrompt = `Act as an expert photo editor. Edit the attached image according to this instruction: "${prompt}".

IMPORTANT CONSTRAINTS:
1.  **Preserve Originality**: Do NOT change the background, lighting, style, or other objects unless explicitly asked. The unedited parts of the image must look exactly like the original.
2.  **Clean Removal**: If the instruction is to remove an object/person, replace it seamlessly with the surrounding background texture (inpainting).
3.  **No Additions**: Do NOT add new objects, animals, or people that were not in the original photo unless specifically instructed to add them.
4.  **Fidelity**: The result should look natural and realistic, matching the original camera quality.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType,
            },
          },
          {
            text: enhancedPrompt,
          },
        ],
      },
      config: {
        temperature: 0.4, // Lower temperature for less random/creative hallucination
      }
    });

    let resultImageUri: string | undefined;
    let resultText: string | undefined;

    if (response.candidates && response.candidates[0] && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          resultImageUri = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          resultText = part.text;
        }
      }
    }

    return { imageUri: resultImageUri, text: resultText };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};