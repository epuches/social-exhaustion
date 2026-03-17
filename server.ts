import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL || "http://localhost:3000";

const SYSTEM_INSTRUCTION = `You are the "Recharge" AI Guide. Your tone is warm, calm, non-clinical, and deeply empathetic. You sound like a wise, introverted friend who understands that social energy is a finite resource.
Core Philosophy: Social exhaustion isn't a flaw; it's a signal. We don't "fix" it; we manage it.
Guidelines:
- Avoid "hustle" language or clinical jargon.
- Use metaphors related to batteries, tides, or light.
- When generating recovery plans, prioritize low-energy, high-restoration activities.
- When writing boundary scripts, prioritize "Kind but Firm" over "People Pleasing."`;

// API Routes
app.post("/api/generate-profile", async (req, res) => {
  try {
    const { quizData } = req.body;
    const model = "gemini-3.1-pro-preview";
    
    const prompt = `Based on the user data provided, generate a 'Social Exhaustion Profile.'
    Input: ${JSON.stringify(quizData)}
    
    Return a JSON object with:
    - type: A creative name for their profile (e.g., "The Office Empath").
    - validation: A 2-paragraph validation of why their specific drain (${quizData.primary_drain}) is so taxing.
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

    const profile = JSON.parse(response.text || "{}");

    // Email sending logic
    if (quizData.email && resend) {
      try {
        await resend.emails.send({
          from: "Social Exhaustion <onboarding@resend.dev>",
          to: quizData.email,
          subject: "Your Social Exhaustion Profile",
          html: `
            <h1>Hello ${quizData.user_name}</h1>
            <p>Here is your personalized energy profile:</p>
            <h2>${profile.type}</h2>
            <p>${profile.validation}</p>
            <h3>Micro-Recoveries:</h3>
            <ul>
              ${profile.microRecoveries.map((r: string) => `<li>${r}</li>`).join("")}
            </ul>
            <p>${profile.invitation}</p>
            <hr />
            <p><small>Sent from <a href="${APP_URL}">Recharge: The Social Exhaustion Guide</a></small></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate profile" });
  }
});

app.post("/api/generate-boundaries", async (req, res) => {
  try {
    const { situation, email } = req.body;
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

    const scripts = JSON.parse(response.text || "{}");

    if (email && resend) {
      try {
        await resend.emails.send({
          from: "Social Exhaustion <onboarding@resend.dev>",
          to: email,
          subject: "Your Boundary Scripts",
          html: `
            <h1>Your Boundary Scripts</h1>
            <p><strong>Situation:</strong> ${situation}</p>
            <h3>Gentle Script:</h3>
            <p>"${scripts.gentle}"</p>
            <h3>Direct Script:</h3>
            <p>"${scripts.direct}"</p>
            <h3>Business Script:</h3>
            <p>"${scripts.business}"</p>
            <hr />
            <p><small>Sent from <a href="${APP_URL}">Recharge: The Social Exhaustion Guide</a></small></p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    res.json(scripts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate boundaries" });
  }
});

app.get("/api/blog-post", async (req, res) => {
  try {
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

    res.json({ text: response.text || "" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate blog post" });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
