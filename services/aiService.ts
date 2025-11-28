import { GoogleGenAI, Type } from "@google/genai";
import { ReliefEntry } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// We define a schema to force Gemini to return structured JSON
const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      type: {
        type: Type.STRING,
        enum: ["NEED", "OFFER"],
        description: "Whether the message is asking for help (NEED) or offering help (OFFER).",
      },
      category: {
        type: Type.STRING,
        description: "Category of the item in Traditional Chinese (e.g., 食品, 飲用水, 醫療, 交通, 衣物, 住宿).",
      },
      item: {
        type: Type.STRING,
        description: "Specific item name in Traditional Chinese (e.g., 睡袋, 必理痛, 便當).",
      },
      quantity: {
        type: Type.STRING,
        description: "Amount or quantity mentioned in Traditional Chinese (e.g., 50 盒, 2 人). Use '不明' if not specified.",
      },
      location: {
        type: Type.STRING,
        description: "Specific location mentioned in Traditional Chinese (e.g., 大埔墟站, 大埔體育館).",
      },
      contactInfo: {
        type: Type.STRING,
        description: "Phone number, name, or social handle. Use '無' if not present.",
      },
      urgency: {
        type: Type.STRING,
        enum: ["HIGH", "MEDIUM", "LOW"],
        description: "Urgency level based on context words (e.g., 'Emergency', 'Urgent', 'Immediately' implies HIGH).",
      },
    },
    required: ["type", "category", "item", "quantity", "location", "contactInfo", "urgency"],
  },
};

export const parseMessageToEntries = async (message: string): Promise<ReliefEntry[]> => {
  try {
    const prompt = `
      You are an emergency coordination AI for the Tai Po fire incident in Hong Kong.
      Analyze the following unstructured text (likely from WhatsApp or WeChat). 
      The text may be in Cantonese, Traditional Chinese, or English.
      
      Extract specific needs or offers. A single message might contain multiple items.
      Return a JSON array of objects.

      IMPORTANT: 
      1. All extracted text fields (category, item, quantity, location, contactInfo) MUST be in Traditional Chinese (繁體中文).
      2. If the input is English, translate it to Traditional Chinese.
      3. Use standard Hong Kong Cantonese/Chinese terms where appropriate (e.g., 'Van仔' -> '客貨車', 'Lunch box' -> '便當/飯盒').

      Input Text:
      "${message}"
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const rawData = JSON.parse(response.text || "[]");
    
    // Enrich with client-side only fields (IDs, timestamps)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return rawData.map((item: any) => ({
      ...item,
      id: crypto.randomUUID(),
      status: 'PENDING',
      timestamp: Date.now(),
      originalMessage: message,
    }));

  } catch (error) {
    console.error("Gemini parsing error:", error);
    return [];
  }
};