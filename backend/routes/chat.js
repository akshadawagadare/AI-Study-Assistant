const express = require("express");
const router = express.Router();
require("dotenv").config();

const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-1.5-flash"});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const result = await model.generateContent(message);
    const reply = result.response.text();

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