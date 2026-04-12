const express = require("express");
const router = express.Router();
require("dotenv").config();

const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await client.messages.create({
      model: "claude-3-haiku-20240307", // fast + cheap
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    res.json({
      reply: response.content[0].text,
    });
  } catch (error) {
    console.error("❌ Claude Error:", error);

    res.status(500).json({
      error: error.message || "Something went wrong",
    });
  }
});

module.exports = router;