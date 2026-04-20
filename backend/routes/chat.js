const express = require("express");
const router = express.Router();
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: message,
    });

    const reply = result.text;

    res.json({
      reply: reply || "No response from AI",
    });

  } catch (error) {
    console.error("❌ Gemini Error:", error);

    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

module.exports = router;