const express = require("express");
const router = express.Router();
const { GoogleGenAI } = require("@google/genai");

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MAX_MESSAGE_LENGTH = 4000;

/* ------------------ HELPERS ------------------ */

function extractAnswer(result) {
  const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.warn("Gemini returned no text. Full result:", JSON.stringify(result, null, 2));
  }
  return text?.trim() ?? null;
}

function classifyGeminiError(err) {
  const msg = err?.message?.toLowerCase() ?? "";
  if (msg.includes("api key") || msg.includes("unauthorized") || msg.includes("403")) {
    return { status: 401, error: "Invalid or missing API key" };
  }
  if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("429")) {
    return { status: 429, error: "AI service rate limit reached. Please try again later." };
  }
  if (msg.includes("invalid") || msg.includes("400")) {
    return { status: 400, error: "Invalid request sent to AI service" };
  }
  return { status: 500, error: "AI service error. Please try again." };
}

/* ------------------ ROUTE ------------------ */

router.post("/", async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return res.status(400).json({ error: "Message must be a non-empty string" });
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return res.status(400).json({
      error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`,
    });
  }

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: message.trim(),
    });

    const reply = extractAnswer(result);

    return res.json({
      reply: reply ?? "No response from AI",
    });

  } catch (err) {
    console.error("Gemini error:", err.message);
    const { status, error } = classifyGeminiError(err);
    return res.status(status).json({ error });
  }
});

module.exports = router;