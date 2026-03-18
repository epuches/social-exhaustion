import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { QuizData, SocialProfile, BoundaryScripts } from "../types";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work correctly.");
}

const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are the "Recharge" AI Guide. Your tone is warm, calm, non-clinical, and deeply empathetic. You sound like a wise, introverted friend who understands that social energy is a finite resource.
Core Philosophy: Social exhaustion isn't a flaw; it's a signal. We don't "fix" it; we manage it.
Guidelines:
- Avoid "hustle" language or clinical jargon.
- Use metaphors related to batteries, tides, or light.
- When generating recovery plans, prioritize low-energy, high-restoration activities.
- When writing boundary scripts, prioritize "Kind but Firm" over "People Pleasing."`;

export async function generateSocialProfile(data: QuizData): Promise<SocialProfile> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing. Please configure it in your environment variables.");
  }

  const model = "gemini-flash-latest";
  
  const prompt = `Based on the user data provided, generate a 'Social Exhaustion Profile.'
  Input: ${JSON.stringify(data)}
  
  Return a JSON object with:
  - type: A creative name for their profile (e.g., "The Office Empath").
  - validation: A 2-paragraph validation of why their specific drain (${data.primary_drain}) is so taxing.
  - microRecoveries: An array of 3 'Micro-Recoveries' they can do in under 5 minutes today.
  - invitation: A gentle invitation to join the 14-day Pro recovery plan.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            validation: { type: Type.STRING },
            microRecoveries: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            invitation: { type: Type.STRING }
          },
          required: ["type", "validation", "microRecoveries", "invitation"]
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", text);
      throw new Error("Invalid response format from AI.");
    }
  } catch (error: any) {
    console.error("Error generating social profile:", error);
    throw error;
  }
}

export async function generateBoundaryScripts(situation: string): Promise<BoundaryScripts> {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `You are the Social Exhaustion Boundary Builder. The user will give you a difficult social situation. You will provide three scripts that sound like a real human speaking, with zero fluff.
  Situation: "${situation}"
  
  Return a JSON object with:
  - gentle: Friendly and warm, but sounds like a real person talking to a friend. No "fake" or overly flowery language. Just honest and kind.
  - direct: Short and sweet. One or two sentences max. Clear and unambiguous.
  - business: Professional, firm, and authoritative. No apologies. Concise and business-like. It should sound strong, not weak.
  
  Ensure all scripts are conversational and realistic. Avoid clichés.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gentle: { type: Type.STRING },
            direct: { type: Type.STRING },
            business: { type: Type.STRING }
          },
          required: ["gentle", "direct", "business"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");

    try {
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse boundary scripts JSON:", text);
      throw new Error("Invalid response format from AI.");
    }
  } catch (error: any) {
    console.error("Error generating boundary scripts:", error);
    throw error;
  }
}

export async function generateBlogPost(data?: QuizData): Promise<string> {
  if (!apiKey) {
    return "API Key missing. Please configure GEMINI_API_KEY.";
  }

  const model = "gemini-3.1-flash-lite-preview";
  const prompt = data 
    ? `Draft a 600-word blog post tailored to a user with these patterns: ${JSON.stringify(data)}.
       Title should be something like 'The Science of the ${data.primary_drain} Drain' or similar.
       Structure with H2 headers.
       Include a section on 'The Cost of Masking.'
       Incorporate the 'Recharge' brand voice (warm, humanist serif vibe).
       Target keywords: social exhaustion symptoms, introvert burnout, recovery for HSPs.`
    : `Draft a 600-word blog post titled 'The Science of the Social Battery: Why Your Brain Feels Fried.'
       Structure with H2 headers.
       Include a section on 'The Cost of Masking.'
       Incorporate the 'Recharge' brand voice (warm, humanist serif vibe).
       Target keywords: social exhaustion symptoms, introvert burnout, recovery for HSPs.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });

    return response.text || "No content generated.";
  } catch (error: any) {
    console.error("Error generating blog post:", error);
    return `Error: ${error.message || "Failed to generate blog post."}`;
  }
}
