import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, SocialProfile, BoundaryScripts } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const SYSTEM_INSTRUCTION = `You are the "Recharge" AI Guide. Your tone is warm, calm, non-clinical, and deeply empathetic. You sound like a wise, introverted friend who understands that social energy is a finite resource.
Core Philosophy: Social exhaustion isn't a flaw; it's a signal. We don't "fix" it; we manage it.
Guidelines:
- Avoid "hustle" language or clinical jargon.
- Use metaphors related to batteries, tides, or light.
- When generating recovery plans, prioritize low-energy, high-restoration activities.
- When writing boundary scripts, prioritize "Kind but Firm" over "People Pleasing."`;

export async function generateSocialProfile(data: QuizData): Promise<SocialProfile> {
  const model = "gemini-3.1-pro-preview";
  
  const prompt = `Based on the user data provided, generate a 'Social Exhaustion Profile.'
  Input: ${JSON.stringify(data)}
  
  Return a JSON object with:
  - type: A creative name for their profile (e.g., "The Office Empath").
  - validation: A 2-paragraph validation of why their specific drain (${data.primary_drain}) is so taxing.
  - microRecoveries: An array of 3 'Micro-Recoveries' they can do in under 5 minutes today.
  - invitation: A gentle invitation to join the 14-day Pro recovery plan.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
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

  return JSON.parse(response.text || "{}");
}

export async function generateBoundaryScripts(situation: string): Promise<BoundaryScripts> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `You are the Social Exhaustion Boundary Builder. The user will give you a difficult social situation. You will provide three scripts:
  Situation: "${situation}"
  
  Return a JSON object with:
  - gentle: Soft, explaining the need for rest.
  - direct: Short, clear, no over-explaining.
  - business: Professional, firm, and authoritative. Ensure it doesn't sound "weak" or apologetic, but stays respectful.
  
  Ensure all scripts preserve the relationship while protecting the user's energy.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
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

  return JSON.parse(response.text || "{}");
}

export async function generateBlogPost(): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  const prompt = `Draft a 1,200-word blog post titled 'The Science of the Social Battery: Why Your Brain Feels Fried.'
  Structure with H2 headers.
  Include a section on 'The Cost of Masking.'
  Incorporate the 'Recharge' brand voice (warm, humanist serif vibe).
  Target keywords: social exhaustion symptoms, introvert burnout, recovery for HSPs.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });

  return response.text || "";
}
