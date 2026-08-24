import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Server-side Gemini initialization
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API endpoint to parse unstructured timing text to structured daily timing data
app.post("/api/gemini/parse-timing", async (req, res) => {
  try {
    const { rawText, targetDate, timezone } = req.body;
    if (!rawText || typeof rawText !== "string") {
      res.status(400).json({ error: "Missing or invalid rawText" });
      return;
    }

    const ai = getAi();
    if (!ai) {
      res.status(503).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
      return;
    }

    const prompt = `You are a Vedic Astrology Panchang parser. Convert the following pasted text into a structured timing dataset for date ${
      targetDate || "2026-08-24"
    } and timezone ${timezone || "America/New_York"}.
Extract:
1. Sunrise time (HH:MM in 24h format or with AM/PM).
2. Sunset time (HH:MM in 24h format or with AM/PM).
3. All auspicious (green) and inauspicious (red) periods with their exact name, classification ('green' or 'red'), start time, and end time.
Common inauspicious: Rahu Kala, Yamaganda, Gulika / Gulika Kala, Dur Muhurtam, Varjyam. (classification = 'red')
Common auspicious: Brahma Muhurta, Amrita Gadiyas, Abhijit Muhurta, Shuba Muhurtham. (classification = 'green')
4. Optional Moon Nakshatra and Moon House if mentioned in text.

Pasted raw text:
"""
${rawText}
"""

Ensure timestamps are formatted as ISO strings or HH:mm military format for the target date.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
            sunrise: { type: Type.STRING, description: "Sunrise time, e.g. 06:57" },
            sunset: { type: Type.STRING, description: "Sunset time, e.g. 19:48" },
            nakshatra: { type: Type.STRING, description: "Moon Nakshatra name if known, e.g. Uttara Ashadha" },
            moonHouse: { type: Type.INTEGER, description: "Moon house number 1-12 if known" },
            periods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  startTime: { type: Type.STRING, description: "HH:mm format (24hr)" },
                  endTime: { type: Type.STRING, description: "HH:mm format (24hr)" },
                  classification: {
                    type: Type.STRING,
                    description: "Must be 'green' or 'red'",
                  },
                  description: { type: Type.STRING },
                },
                required: ["name", "startTime", "endTime", "classification"],
              },
            },
          },
          required: ["sunrise", "sunset", "periods"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Error parsing timing text:", error);
    res.status(500).json({ error: error.message || "Failed to parse timing text" });
  }
});

// API endpoint to generate short contextual story interpretation (< 50 words)
app.post("/api/gemini/interpret", async (req, res) => {
  try {
    const { color, panchangName, nakshatra, moonHouse, activeTransits, dasha, windowTime } = req.body;

    const ai = getAi();
    if (!ai) {
      res.status(503).json({
        error: "GEMINI_API_KEY is not configured.",
      });
      return;
    }

    const prompt = `You are a concise timing storyteller for UFO Transit Light. 
Generate a short interpretation of the astrological moment based STRICTLY on the supplied factual parameters.
CRITICAL CONSTRAINTS:
1. Do NOT determine or suggest changing the color. Color is already deterministically calculated as: "${color}".
2. Do NOT invent astrological facts or planetary placements not provided.
3. Keep the TOTAL response under 45 words.
4. Format strictly with two concise fields:
   - "bestFor": 3-4 short verbs/actions separated by middle dots (e.g. "send · submit · decide · sign" or "rest · reflect · review · wait")
   - "theme": 1-2 tight sentences explaining the mood/story (under 30 words).

Input facts:
- Deterministic Color: ${color}
- Active Panchang condition: ${panchangName || "None / Neutral window"}
- Moon Nakshatra: ${nakshatra || "Uttara Ashadha"}
- Moon House: ${moonHouse || 7}
- Active Transits: ${JSON.stringify(activeTransits || [])}
- Dasha: ${JSON.stringify(dasha || {})}
- Window: ${windowTime || "Current window"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bestFor: { type: Type.STRING, description: "e.g. 'send · submit · decide · commit'" },
            theme: { type: Type.STRING, description: "Max 30 words describing the story theme" },
          },
          required: ["bestFor", "theme"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedJson });
  } catch (error: any) {
    console.error("Error generating interpretation:", error);
    res.status(500).json({ error: error.message || "Failed to generate interpretation" });
  }
});

// Vite middleware & Static serving
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
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`UFO Transit Light server running on http://localhost:${PORT}`);
  });
}

startServer();
